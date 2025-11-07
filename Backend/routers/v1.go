package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Echo) {
	// Group routes for modularity
	// Health route without CORS validation (should work without CORS headers)
	e.GET("/health", handlers.Health)

	// Apply CORS validation middleware to all /v1 routes
	api := e.Group("/v1", middleware.CORSValidator())

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
