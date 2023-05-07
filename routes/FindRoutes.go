package routes

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"restaurantfinder/models"
	"sort"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lesismal/nbio/nbhttp/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type FindController struct {
	ctx                    context.Context
	db                     *mongo.Database
	userConnections        map[string]*websocket.Conn
	companionSubscriptions map[string]map[string]bool
	userPreferences        map[string]models.UserPreference
	sync.Mutex
}

func NewFindController(ctx context.Context, db *mongo.Database) *FindController {
	return &FindController{
		ctx:                    ctx,
		db:                     db,
		userConnections:        make(map[string]*websocket.Conn),
		companionSubscriptions: make(map[string]map[string]bool),
		userPreferences:        make(map[string]models.UserPreference),
	}
}

func (fc *FindController) GetCompanion(c *gin.Context) {
	logged, user := isLoggedIn(c, fc.db, fc.ctx)

	if !logged {
		c.JSON(http.StatusUnauthorized, "")
		return
	}

	var companion models.Companion

	filter := bson.M{
		"$or": []bson.M{
			{"username1": user.Username},
			{"username2": user.Username},
		},
	}

	result := fc.db.Collection("companions").FindOne(fc.ctx, filter)

	if result.Err() != nil {
		log.Println(result.Err().Error())
		c.String(http.StatusNotFound, "")
		return
	}

	result.Decode(&companion)
	c.JSON(http.StatusOK, companion)
}

func (fc *FindController) AddCompanion(c *gin.Context) {

	logged, _ := isLoggedIn(c, fc.db, fc.ctx)

	if !logged {
		c.JSON(http.StatusUnauthorized, "")
		return
	}

	var companion models.Companion
	if err := c.ShouldBindJSON(&companion); err != nil {
		log.Println(err.Error())
		c.String(http.StatusBadRequest, "")
		return
	}

	companion.Created = time.Now()

	filter := bson.M{
		"$or": []bson.M{
			{"username1": companion.Username1},
			{"username1": companion.Username2},
			{"username2": companion.Username1},
			{"username2": companion.Username2},
		},
	}

	update := bson.M{
		"$set": companion,
	}

	opts := options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)

	var updatedCompanion models.Companion
	if err := fc.db.Collection("companions").FindOneAndUpdate(fc.ctx, filter, update, opts).Decode(&updatedCompanion); err != nil {
		if err == mongo.ErrNoDocuments {
			if _, err := fc.db.Collection("companions").InsertOne(fc.ctx, companion); err != nil {
				log.Println(err.Error())
				c.String(http.StatusInternalServerError, "")
				return
			}

			c.JSON(http.StatusOK, companion)
		} else {
			log.Println(err.Error())
			c.String(http.StatusInternalServerError, "")
			return
		}
	} else {
		c.JSON(http.StatusOK, updatedCompanion)
	}
}

func newUpgrader(user *models.User, fc *FindController) *websocket.Upgrader {
	u := websocket.NewUpgrader()

	u.OnMessage(func(c *websocket.Conn, messageType websocket.MessageType, data []byte) {
		var message models.Message

		json.Unmarshal(data, &message)

		if message.Type == "ping" {
			c.WriteMessage(messageType, []byte(`{"type": "pong"}`))
		} else if message.Type == "modify" {
			c.WriteMessage(messageType, []byte(`{"type": "pong"}`))
		} else if message.Type == "preference" {
			fc.Lock()
			defer fc.Unlock()

			// Store user preferences
			message.UserPreference.IsSet = true
			fc.userPreferences[user.Username] = message.UserPreference

			// Check if both users have sent their preferences
			companion, err := fc.getCompanionByID(message.CompanionID)
			if err == nil && fc.userPreferences[companion.Username1].IsSet && fc.userPreferences[companion.Username2].IsSet {
				// Calculate the best match
				restaurants, err := getRestaurants(*companion)
				if err != nil {
					log.Println("Error fetching restaurants:", err)
					return
				}

				sortedRestaurants := findBestMatch(restaurants, fc.userPreferences[companion.Username1], fc.userPreferences[companion.Username2])

				// Send the best match to both clients
				user1Conn := fc.userConnections[companion.Username1]
				user2Conn := fc.userConnections[companion.Username2]
				sortedRestaurantsJSON, _ := json.Marshal(sortedRestaurants)
				user1Conn.WriteMessage(messageType, []byte(`{"type": "sortedRestaurants", "restaurants": `+string(sortedRestaurantsJSON)+`}`))
				user2Conn.WriteMessage(messageType, []byte(`{"type": "sortedRestaurants", "restaurants": `+string(sortedRestaurantsJSON)+`}`))

				// Clear the stored user preferences
				delete(fc.userPreferences, companion.Username1)
				delete(fc.userPreferences, companion.Username2)
			}
			log.Println(fc.userPreferences)
		} else if message.Type == "subscribe" {
			fc.Lock()
			defer fc.Unlock()

			// Check if there's already a connection for the user
			if existingConn, ok := fc.userConnections[user.Username]; ok {
				// If there is, close the existing connection
				existingConn.Close()
			}

			// Store the new connection in the map
			fc.userConnections[user.Username] = c

			companionID := message.CompanionID
			if _, ok := fc.companionSubscriptions[companionID]; !ok {
				fc.companionSubscriptions[companionID] = make(map[string]bool)
			}
			fc.companionSubscriptions[companionID][user.Username] = true

			// Check if both users are subscribed
			companion, err := fc.getCompanionByID(companionID)
			if err == nil && fc.companionSubscriptions[companionID][companion.Username1] && fc.companionSubscriptions[companionID][companion.Username2] {
				// Both users are subscribed, inform them of each other's presence
				user1Conn := fc.userConnections[companion.Username1]
				user2Conn := fc.userConnections[companion.Username2]
				user1Conn.WriteMessage(messageType, []byte(`{"type": "presence", "username": "`+companion.Username2+`"}`))
				user2Conn.WriteMessage(messageType, []byte(`{"type": "presence", "username": "`+companion.Username1+`"}`))
			}
			log.Println(fc.userConnections)
		}

	})

	u.OnClose(func(c *websocket.Conn, err error) {
		log.Println("OnClose:", c.RemoteAddr().String(), err)
		fc.Lock()
		defer fc.Unlock()
		// Remove the connection from the user connections map
		delete(fc.userConnections, user.Username)

		// Remove the user from the companion subscriptions
		for companionID, subscribers := range fc.companionSubscriptions {
			if subscribers[user.Username] {
				delete(subscribers, user.Username)

				// Inform the companion about the user's disconnection
				companion, err := fc.getCompanionByID(companionID)
				if err == nil {
					otherUsername := companion.Username1
					if user.Username == companion.Username1 {
						otherUsername = companion.Username2
					}
					if otherConn, ok := fc.userConnections[otherUsername]; ok {
						otherConn.WriteMessage(websocket.TextMessage, []byte(`{"type": "disconnected", "username": "`+user.Username+`"}`))
					}
				}
			}
		}
		log.Println(fc.userConnections)
	})

	return u
}

func (fc *FindController) FindWebSocket(c *gin.Context) {
	logged, user := isLoggedIn(c, fc.db, fc.ctx)

	if !logged {
		c.JSON(http.StatusUnauthorized, "")
		return
	}

	log.Println(user.Username)
	upgrader := newUpgrader(user, fc)
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		panic(err)
	}
	
	wsConn := conn.(*websocket.Conn)
	wsConn.SetReadDeadline(time.Time{})

	log.Println("OnOpen:", wsConn.RemoteAddr().String())
}

func (fc *FindController) getCompanionByID(id string) (*models.Companion, error) {
	var companion models.Companion
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	filter := bson.M{"_id": objectID}
	err = fc.db.Collection("companions").FindOne(fc.ctx, filter).Decode(&companion)
	if err != nil {
		return nil, err
	}
	return &companion, nil
}

func calculateScore(restaurant models.Restaurant, user1, user2 models.UserPreference) int {
	score1 := calculateIndividualScore(restaurant, user1)
	score2 := calculateIndividualScore(restaurant, user2)
	return score1 + score2
}

func calculateIndividualScore(restaurant models.Restaurant, user models.UserPreference) int {
	cuisineScore := 0
	if restaurant.Cuisine == user.Cuisine {
		cuisineScore = user.CuisineWeight
	}

	distanceScore := 0
	if restaurant.Distance <= user.MaxDistance {
		distanceScore = user.DistanceWeight
	}

	priceScore := 0
	if restaurant.Price <= user.MaxPrice {
		priceScore = user.PriceWeight
	}

	return cuisineScore + distanceScore + priceScore
}

func findBestMatch(restaurants []models.Restaurant, user1, user2 models.UserPreference) []models.Restaurant {
	// Calculate scores for all restaurants
	for i := range restaurants {
		score := calculateScore(restaurants[i], user1, user2)
		restaurants[i].Score = score
	}

	// Sort the restaurants by score in descending order
	sort.Slice(restaurants, func(i, j int) bool {
		return restaurants[i].Score > restaurants[j].Score
	})

	return restaurants
}

func (fc *FindController) SaveFavorite(c *gin.Context) {
	logged, user := isLoggedIn(c, fc.db, fc.ctx)

	if !logged {
		c.String(http.StatusUnauthorized, "")
		return
	}

	var favourite models.Favourite
	json.NewDecoder(c.Request.Body).Decode(&favourite)

	favourite.UserID = user.Username
	favourite.Created = time.Now()

	result, err := fc.db.Collection("favourites").InsertOne(fc.ctx, favourite)
	if err != nil {
		log.Println(err.Error())
		c.String(http.StatusInternalServerError, "")
		return
	}

	// Get the inserted ID from the result
	insertedID := result.InsertedID

	// Retrieve the saved document using the inserted ID
	var savedFavourite models.Favourite
	err = fc.db.Collection("favourites").FindOne(fc.ctx, bson.M{"_id": insertedID}).Decode(&savedFavourite)
	if err != nil {
		log.Println(err.Error())
		c.String(http.StatusInternalServerError, "")
		return
	}

	c.JSON(http.StatusOK, savedFavourite)
}

func (fc *FindController) GetFavorites(c *gin.Context) {

	logged, user := isLoggedIn(c, fc.db, fc.ctx)

	if !logged {
		c.String(http.StatusUnauthorized, "")
		return
	}

	filter := bson.M{"username": user.Username}
	cursor, err := fc.db.Collection("favourites").Find(fc.ctx, filter)

	if err != nil {
		log.Println(err.Error())
		c.String(http.StatusInternalServerError, "")
		return
	}

	var favourites []models.Favourite
	err = cursor.All(fc.ctx, &favourites)

	if err != nil {
		log.Println(err.Error())
		c.String(http.StatusInternalServerError, "")
		return
	}

	c.JSON(http.StatusOK, favourites)
}
