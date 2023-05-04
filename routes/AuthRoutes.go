package routes

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"restaurantfinder/models"
	"restaurantfinder/utils"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct {
	ctx context.Context
	db  *mongo.Database
}

func NewAuthController(ctx context.Context, db *mongo.Database) *AuthController {
	return &AuthController{
		ctx: ctx,
		db:  db,
	}
}

func (ac *AuthController) User(c *gin.Context) {

	logged, user := isLoggedIn(c, ac.db, ac.ctx)
	if logged {
		c.JSON(http.StatusOK, user)
		return
	}
	c.String(http.StatusUnauthorized, "")
}

func (ac *AuthController) Login(c *gin.Context) {
	var user models.User
	err := json.NewDecoder(c.Request.Body).Decode(&user)
	if err != nil {
		log.Println(err.Error())
		c.String(http.StatusBadRequest, "")
		return
	}

	result := ac.db.Collection("users").FindOne(ac.ctx, bson.M{"username": user.Username})

	if result.Err() != nil {
		log.Println(result.Err().Error())
		c.String(http.StatusNotFound, "")
		return
	}

	var foundUser models.User
	result.Decode(&foundUser)

	err = bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password))
	if err != nil {
		log.Println(err.Error())
		c.String(http.StatusUnauthorized, "")
		return
	}

	generateSession(&foundUser, c, ac)
	foundUser.Password = ""
	c.JSON(http.StatusOK, foundUser)
}

func (ac *AuthController) SignUp(c *gin.Context) {
	var user models.User
	err := json.NewDecoder(c.Request.Body).Decode(&user)

	if err != nil {
		log.Println(err.Error())
		c.String(http.StatusBadRequest, "")
		return
	}

	result := ac.db.Collection("users").FindOne(ac.ctx, bson.M{"username": user.Username})

	if result.Err() == nil {
		c.String(http.StatusConflict, "user with email %s already exists", user.Username)
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 8)

	if err != nil {
		log.Println(err.Error())
		c.String(http.StatusInternalServerError, "")
		return
	}

	user.Password = string(hashedPassword)

	result = ac.db.Collection("users").FindOneAndUpdate(context.Background(), bson.M{"username": user.Username}, bson.M{"$setOnInsert": user}, options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After))
	if result.Err() != nil {
		log.Println(result.Err().Error())
		c.String(http.StatusInternalServerError, "")
		return
	}
	insertedUser := models.User{}
	if err := result.Decode(&insertedUser); err != nil {
		log.Println(err.Error())
		c.String(http.StatusInternalServerError, "")
		return
	}
	generateSession(&insertedUser, c, ac)
	insertedUser.Password = ""
	c.JSON(http.StatusOK, insertedUser)
}

func (ac *AuthController) Logout(c *gin.Context) {
	logged, user := isLoggedIn(c, ac.db, ac.ctx)

	if !logged {
		c.JSON(http.StatusUnauthorized, "")
		return
	}

	_, err := ac.db.Collection("sessions").DeleteMany(ac.ctx, bson.D{{Key: "username", Value: user.Username}})

	if err != nil {
		log.Println(err.Error())
		c.JSON(http.StatusInternalServerError, "")
		return
	}

	c.SetCookie("session", "", -1, "/", "localhost", false, true)
	c.Redirect(http.StatusSeeOther, "/")
}

func generateSession(user *models.User, c *gin.Context, ac *AuthController) error {
	sessionID, _ := utils.GenerateRandomString(20)

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("session", sessionID, (30 * 24 * 60 * 60), "/", "localhost", false, true)

	_, err := ac.db.Collection("sessions").UpdateOne(ac.ctx, bson.D{{Key: "username", Value: user.Username}}, bson.M{
		"$set": bson.M{
			"session-id": sessionID,
			"expires":    time.Now().Add(time.Second * 24 * 60 * 60),
		},
	}, options.Update().SetUpsert(true))

	if err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}

func isLoggedIn(c *gin.Context, db *mongo.Database, ctx context.Context) (bool, *models.User) {
	var session models.Session
	var user models.User

	cookie, err := c.Cookie("session")

	if err != nil {
		log.Println(err.Error())
		return false, &models.User{}
	}

	err = db.Collection("sessions").FindOne(ctx, bson.D{{Key: "session-id", Value: cookie}}).Decode(&session)

	if err != nil {
		log.Println(err.Error())
		return false, &models.User{}
	}

	if session.Expires.Before(time.Now()) {
		c.SetCookie("session", "", -1, "/", "localhost", false, true)
		db.Collection("sessions").DeleteMany(ctx, bson.D{{Key: "username", Value: session.Username}})
		return false, &models.User{}
	}

	err = db.Collection("users").FindOne(ctx, bson.D{{Key: "username", Value: session.Username}}).Decode(&user)

	if err != nil {
		log.Println(err.Error())
		return false, &models.User{}
	}
	user.Password = ""
	return true, &user
}
