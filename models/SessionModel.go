package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Session Model
type Session struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	SessionID string             `json:"session-id" bson:"session-id"`
	Username  string             `json:"username" bson:"username"`
	Expires   time.Time          `json:"expires" bson:"expires"`
}
