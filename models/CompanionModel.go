package models

import "time"

type Companion struct {
	Username1 string    `json:"username1" bson:"username1"`
	Username2 string    `json:"username2" bson:"username2"`
	Address   string    `json:"address" bson:"address"`
	Created   time.Time `bson:"created"`
}
