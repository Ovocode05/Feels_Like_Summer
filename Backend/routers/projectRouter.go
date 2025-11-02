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

	// Application routes
	projects.POST("/:id/apply", handlers.ApplyToProject, middleware.RequireUserType("stu"))                       // Apply to a project (Students only)
	projects.GET("/:id/applications", handlers.GetProjectApplications, middleware.RequireUserType("fac"))         // Get all applications for a project (Faculty only)
	projects.PUT("/:id/applications/:appId", handlers.UpdateApplicationStatus, middleware.RequireUserType("fac")) // Update application status (Faculty only)

	// Student application routes
	applications := api.Group("/applications")
	applications.Use(middleware.JWTMiddleware())
	applications.GET("/my", handlers.GetMyApplications, middleware.RequireUserType("stu"))            // Get student's own applications
	applications.GET("/all", handlers.GetAllMyProjectApplications, middleware.RequireUserType("fac")) // Get all applications for all professor's projects
}
