package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Favourite struct {
	ID         primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	UserID     string             `json:"username" bson:"username"`
	Restaurant Restaurant         `json:"restaurant" bson:"restaurant"`
	Created    time.Time          `bson:"created"`
}
