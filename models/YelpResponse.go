package models

type YelpAPIResponse struct {
	Businesses []struct {
		ID       string  `json:"id"`
		Name     string  `json:"name"`
		Distance float64 `json:"distance"`
		Price    string  `json:"price"`
		Rating   float64 `json:"rating"`
		ImageURL string  `json:"image_url"`
		URL      string  `json:"url"`
		Categories []struct {
			Title string `json:"title"`
		} `json:"categories"`
	} `json:"businesses"`
}
