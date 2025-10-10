package routers

import (
	"backend/handlers"

	"github.com/labstack/echo/v4"
)

func RegisterAuthRoutes(g *echo.Group) {
	authGroup := g.Group("/auth")

	authGroup.POST("/signup", handlers.Signup)
	// later you can add:
	// authGroup.POST("/login", handlers.Login)
	// authGroup.GET("/profile", handlers.GetProfile)
}
