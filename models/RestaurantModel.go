package models

type Restaurant struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Cuisine  string  `json:"cuisine"`
	Distance int     `json:"distance"`
	Price    int     `json:"price"`
	Score    int     `json:"score"`
	ImageURL string  `json:"image_url"`
	Rating   float64 `json:"rating"`
	URL      string  `json:"url"`
}
