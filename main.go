package main

import (
	"log"
	"os"
	"path/filepath"
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
	yc := routes.NewYelpController(ctx, db)

	router.POST("/api/signup", ac.SignUp)
	router.POST("/api/login", ac.Login)
	router.GET("/api/user", ac.User)
	router.GET("/api/logout", ac.Logout)

	router.GET("/api/companion", fc.GetCompanion)
	router.POST("/api/companion", fc.AddCompanion)
	router.GET("/api/socket", fc.FindWebSocket)
	router.GET("/api/cuisines", yc.GetCuisines)

	router.Static("/static", "./restaurant-finder/build/static")

	// Serve the files in the React app's root folder and the entry point (index.html)
	router.NoRoute(func(c *gin.Context) {
		file := filepath.Join("./restaurant-finder/build", c.Request.URL.Path)

		// Check if the requested file exists
		if _, err := os.Stat(file); err == nil {
			// If the file exists, serve it
			c.File(file)
		} else {
			// If the file doesn't exist, serve the React app's index.html
			c.File("./restaurant-finder/build/index.html")
		}
	})

	router.Run(":" + config.Keys.PORT)
}
