package models

type Message struct {
	Type           string         `json:"type"`
	CompanionID    string         `json:"companionId,omitempty"`
	UserPreference UserPreference `json:"userPreference,omitempty"`
}
