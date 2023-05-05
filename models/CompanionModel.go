package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Companion struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	Username1 string             `json:"username1" bson:"username1"`
	Username2 string             `json:"username2" bson:"username2"`
	Address   string             `json:"address" bson:"address"`
	Created   time.Time          `bson:"created"`
}
