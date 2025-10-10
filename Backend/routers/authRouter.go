package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterAuthRoutes(api *echo.Group) {
	authGroup := api.Group("/auth")

	// Public routes (no authentication required)
	authGroup.POST("/signup", handlers.Signup)
	authGroup.POST("/login", handlers.Login)

	// Protected routes (require JWT token)
	authGroup.POST("/refresh", handlers.RefreshToken, middleware.JWTMiddleware())
}
