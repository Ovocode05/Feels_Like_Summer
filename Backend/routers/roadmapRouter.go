package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func SetupRoadmapRoutes(e *echo.Group) {
	roadmap := e.Group("/roadmap")
	roadmap.Use(middleware.JWTMiddleware())

	// Preference routes
	roadmap.POST("/preferences", handlers.SavePreferences)
	roadmap.GET("/preferences", handlers.GetPreferences)

	// Roadmap generation routes
	roadmap.POST("/generate", handlers.GenerateRoadmap)
	roadmap.GET("/history", handlers.GetUserRoadmaps)
}
