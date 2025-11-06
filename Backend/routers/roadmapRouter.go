package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func SetupRoadmapRoutes(e *echo.Group) {
	roadmap := e.Group("/roadmap")
	roadmap.Use(middleware.JWTMiddleware())

	// Research roadmap routes
	roadmap.POST("/preferences", handlers.SavePreferences)
	roadmap.GET("/preferences", handlers.GetPreferences)
	roadmap.POST("/generate", handlers.GenerateRoadmap)

	// Placement roadmap routes
	roadmap.POST("/placement/preferences", handlers.SavePlacementPreferences)
	roadmap.GET("/placement/preferences", handlers.GetPlacementPreferences)
	roadmap.POST("/placement/generate", handlers.GeneratePlacementRoadmap)

	// Common routes
	roadmap.GET("/history", handlers.GetUserRoadmaps)
}
