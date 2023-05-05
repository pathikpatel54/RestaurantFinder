package routes

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"restaurantfinder/config"
	"restaurantfinder/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type YelpController struct {
	ctx context.Context
	db  *mongo.Database
}

func NewYelpController(ctx context.Context, db *mongo.Database) *YelpController {
	return &YelpController{
		ctx: ctx,
		db:  db,
	}
}

func (yc *YelpController) GetCuisines(c *gin.Context) {

	logged, _ := isLoggedIn(c, yc.db, yc.ctx)

	if !logged {
		c.JSON(http.StatusUnauthorized, "")
		return
	}

	url := "https://api.yelp.com/v3/categories"
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Println(err)
		c.String(http.StatusInternalServerError, "")
		return
	}
	req.Header.Set("Authorization", "Bearer "+config.Keys.YELPKEY)

	resp, err := client.Do(req)
	if err != nil {
		log.Println(err)
		c.String(http.StatusInternalServerError, "")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		c.String(http.StatusInternalServerError, "")
		return
	}

	var categoriesData struct {
		Categories []models.Category `json:"categories"`
	}
	err = json.Unmarshal(body, &categoriesData)
	if err != nil {
		log.Println(err)
		c.String(http.StatusInternalServerError, "")
		return
	}

	var cuisines []string
	for _, category := range categoriesData.Categories {
		for _, parentAlias := range category.ParentAliases {
			if parentAlias == "restaurants" {
				cuisines = append(cuisines, category.Title)
				break
			}
		}
	}
	c.JSON(http.StatusOK, cuisines)
}

func getRestaurants(companion models.Companion) ([]models.Restaurant, error) {

	client := &http.Client{}
	var restaurants []models.Restaurant

	for offset := 0; offset < 100; offset += 50 {
		req, err := http.NewRequest("GET", "https://api.yelp.com/v3/businesses/search", nil)
		if err != nil {
			return nil, err
		}

		query := req.URL.Query()
		query.Add("location", companion.Address)
		query.Add("categories", "restaurants")
		query.Add("limit", "50")
		query.Add("offset", strconv.Itoa(offset))
		req.URL.RawQuery = query.Encode()

		req.Header.Add("Authorization", "Bearer "+config.Keys.YELPKEY)

		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		var apiResponse models.YelpAPIResponse

		err = json.NewDecoder(resp.Body).Decode(&apiResponse)

		if err != nil {
			return nil, err
		}

		for _, business := range apiResponse.Businesses {
			restaurant := models.Restaurant{
				ID:       business.ID,
				Name:     business.Name,
				Cuisine:  business.Categories[0].Title,
				Distance: int(business.Distance / 1609.34), // Convert distance to miles
				Price:    convertPrice(business.Price),
				ImageURL: business.ImageURL,
				Rating:   business.Rating,
				URL:      business.URL,
			}
			restaurants = append(restaurants, restaurant)
		}

		// If less than 50 results were returned, break the loop
		if len(apiResponse.Businesses) < 50 {
			break
		}
	}

	return restaurants, nil
}

func convertPrice(price string) int {
	switch price {
	case "$":
		return 10
	case "$$":
		return 30
	case "$$$":
		return 60
	case "$$$$":
		return 100
	default:
		return 0
	}
}
