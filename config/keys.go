package config

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"restaurantfinder/models"
)

var Keys = func() models.Config {
	if os.Getenv("GO_ENV") == "production" {
		return prodConfig
	} else {
		var devConfig models.Config
		devFile, err := os.Open("config/dev.json")
		if err != nil {
			log.Println(err)
		}
		json.NewDecoder(devFile).Decode(&devConfig)
		fmt.Println(devConfig)
		return devConfig
	}
}()
