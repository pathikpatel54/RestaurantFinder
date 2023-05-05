package models

type Category struct {
	Alias         string   `json:"alias"`
	Title         string   `json:"title"`
	ParentAliases []string `json:"parent_aliases"`
}
