package models

type UserPreference struct {
	IsSet          bool   `json:"-"`
	Cuisine        string `json:"cuisine"`
	MaxDistance    int    `json:"maxDistance"`
	MaxPrice       int    `json:"maxPrice"`
	CuisineWeight  int    `json:"cuisineImp"`
	DistanceWeight int    `json:"distanceImp"`
	PriceWeight    int    `json:"priceImp"`
}
