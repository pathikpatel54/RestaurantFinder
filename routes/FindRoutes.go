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
	"go.mongodb.org/mongo-driver/mongo"
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
