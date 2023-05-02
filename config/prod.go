package config

import (
	"os"
	"restaurantfinder/models"
)

var prodConfig = models.Config{
	MongoURI: os.Getenv("MONGO_URI"),
	PORT:     os.Getenv("PORT"),
	YELPKEY:  os.Getenv("YELPKEY"),
}
