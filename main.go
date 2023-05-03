package main

import (
	"log"
	"restaurantfinder/config"
	"restaurantfinder/database"
	"restaurantfinder/routes"

	"github.com/gin-gonic/gin"
)

func init() {
	log.SetFlags(log.Lshortfile | log.LstdFlags)
}

func main() {
	router := gin.New()
	db, ctx := database.GetMongoDB()
	ac := routes.NewAuthController(ctx, db)
	fc := routes.NewFindController(ctx, db)

	router.POST("/api/signup", ac.SignUp)
	router.POST("/api/login", ac.Login)
	router.GET("/api/user", ac.User)
	router.GET("/api/logout", ac.Logout)

	router.GET("/api/socket", fc.FindWebSocket)

	router.Run(":" + config.Keys.PORT)
}
