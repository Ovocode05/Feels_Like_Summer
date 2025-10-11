package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterProblemStatementRoutes(api *echo.Group) {
	psGroup := api.Group("/problem-statements")

	// Public routes (no authentication required)
	psGroup.GET("", handlers.ListProblemStatements)                 // Get all problem statements (summary only)
	psGroup.GET("/search", handlers.GetProblemStatementsByCategory) // Search by category
	psGroup.GET("/:id", handlers.GetProblemStatement)               // Get specific problem statement (full details)

	// Protected routes (require JWT token)
	psGroup.Use(middleware.JWTMiddleware())

	// Authenticated user routes
	psGroup.POST("", handlers.CreateProblemStatement)       // Create new problem statement
	psGroup.GET("/my", handlers.GetMyProblemStatements)     // Get user's own problem statements
	psGroup.PUT("/:id", handlers.UpdateProblemStatement)    // Update problem statement (owner only)
	psGroup.DELETE("/:id", handlers.DeleteProblemStatement) // Delete problem statement (owner only or faculty)
}
