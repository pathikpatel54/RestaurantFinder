package routes

import (
	"context"

	"go.mongodb.org/mongo-driver/mongo"
)

type AuthController struct {
	ctx context.Context
	db  mongo.Database
}

func NewAuthController(ctx context.Context, db mongo.Database) *AuthController {
	return &AuthController{
		ctx: ctx,
		db:  db,
	}
}
