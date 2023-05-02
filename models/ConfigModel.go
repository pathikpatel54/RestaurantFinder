package models

type Config struct {
	MongoURI string `json:"MongoURI"`
	PORT     string `json:"PORT"`
	YELPKEY  string `json:"YELPKEY"`
}
