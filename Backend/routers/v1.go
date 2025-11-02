package routers

import (
	"backend/handlers"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Echo) {
	// Group routes for modularity
	e.GET("/health", handlers.Health)
	api := e.Group("/v1")

	// Auth routes
	RegisterAuthRoutes(api)

	// Project routes
	RegisterProjectRoutes(api)

	// Profile routes
	RegisterProfileRoutes(api)

	// Problem Statement routes
	RegisterProblemStatementRoutes(api)

	// Roadmap routes
	SetupRoadmapRoutes(api)
}
