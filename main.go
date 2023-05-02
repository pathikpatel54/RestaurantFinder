package main

import (
	"log"
	"restaurantfinder/routes"

	"github.com/gin-gonic/gin"
)

func init() {
	log.SetFlags(log.Lshortfile | log.LstdFlags)
}

func main() {
	router := gin.New()
	ac := routes.NewAuthController()
	router.GET()
}
