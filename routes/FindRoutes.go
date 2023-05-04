package routes

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"restaurantfinder/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lesismal/nbio/nbhttp/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type FindController struct {
	ctx context.Context
	db  *mongo.Database
}

func NewFindController(ctx context.Context, db *mongo.Database) *FindController {
	return &FindController{
		ctx: ctx,
		db:  db,
	}
}

func (fc *FindController) AddCompanion(c *gin.Context) {
	var companion models.Companion
	json.NewDecoder(c.Request.Body).Decode(&companion)

	filter := bson.M{
		"$or": []bson.M{
			{"username1": companion.Username1},
			{"username2": companion.Username2},
		},
	}
	update := bson.M{
		"$set": companion,
	}
	opts := options.Update().SetUpsert(true)

	_, err := fc.db.Collection("companions").UpdateOne(fc.ctx, filter, update, opts)

	if err != nil {
		log.Println(err)
		c.String(http.StatusInternalServerError, "")
		return
	}

	c.String(http.StatusOK, "")
}

func newUpgrader(user *models.User, nc *FindController) *websocket.Upgrader {
	u := websocket.NewUpgrader()

	u.OnMessage(func(c *websocket.Conn, messageType websocket.MessageType, data []byte) {
		var message models.Message

		json.Unmarshal(data, &message)

		if message.Type == "ping" {
			c.WriteMessage(messageType, []byte(`{"type": "pong"}`))
		} else if message.Type == "modify" {
			log.Println(message)
		} else if message.Type == "create" {
			c.WriteMessage(messageType, []byte("Created"))
		} else {
			log.Println(message)
		}
	})

	u.OnClose(func(c *websocket.Conn, err error) {
		log.Println("OnClose:", c.RemoteAddr().String(), err)
	})
	return u
}

func (fc *FindController) FindWebSocket(c *gin.Context) {
	logged, user := isLoggedIn(c, fc.db, fc.ctx)

	if !logged {
		c.JSON(http.StatusUnauthorized, "")
		return
	}

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
