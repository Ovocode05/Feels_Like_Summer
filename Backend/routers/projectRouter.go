package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterProjectRoutes(api *echo.Group) {
	projects := api.Group("/projects")

	// Apply authentication middleware to all project routes
	projects.Use(middleware.JWTMiddleware())

	// Project CRUD routes
	projects.POST("", handlers.CreateProject, middleware.RequireUserType("fac")) // Create a new project (Faculty only)
	projects.GET("", handlers.ListProject)                                       // Get all active projects with user info
	projects.GET("/my", handlers.GetMyProjects)                                  // Get projects belonging to authenticated user
	projects.GET("/:id", handlers.GetProject)                                    // Get a specific project by ID
	projects.PUT("/:id", handlers.EditProject)                                   // Update a project by ID
	projects.DELETE("/:id", handlers.DeleteProject)                              // Delete a project by ID
}
