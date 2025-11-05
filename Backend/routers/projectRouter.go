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
	projects.POST("", handlers.CreateProject, middleware.RequireUserType("fac"))                              // Create a new project (Faculty only)
	projects.GET("", handlers.ListProject)                                                                    // Get all projects with user info (for faculty/admin)
	projects.GET("/student", handlers.ListProjectsForStudent, middleware.RequireUserType("stu"))              // Get projects visible to student (active + applied)
	projects.GET("/my", handlers.GetMyProjects)                                                               // Get projects belonging to authenticated user
	projects.GET("/:id", handlers.GetProject)                                                                 // Get a specific project by ID
	projects.GET("/:id/working-users", handlers.GetProjectWorkingUsers)                                       // Get working users details for a project (Faculty only)
	projects.DELETE("/:id/working-users/:uid", handlers.RemoveWorkingUser, middleware.RequireUserType("fac")) // Remove a working user from project (Faculty only)
	projects.PUT("/:id", handlers.EditProject)                                                                // Update a project by ID
	projects.DELETE("/:id", handlers.DeleteProject)                                                           // Delete a project by ID

	// Application routes
	projects.POST("/:id/apply", handlers.ApplyToProject, middleware.RequireUserType("stu"))                                     // Apply to a project (Students only)
	projects.DELETE("/:id/retract", handlers.RetractApplication, middleware.RequireUserType("stu"))                             // Retract application (Students only)
	projects.GET("/:id/application-status", handlers.GetMyApplicationForProject, middleware.RequireUserType("stu"))             // Get student's application status for a specific project (Students only)
	projects.GET("/:id/applications", handlers.GetProjectApplications, middleware.RequireUserType("fac"))                       // Get all applications for a project (Faculty only)
	projects.GET("/:id/past-applicants", handlers.GetPastApplicantsForProject, middleware.RequireUserType("fac"))               // Get past applicants (accepted/rejected) for a project (Faculty only)
	projects.PUT("/:id/applications/:appId", handlers.UpdateApplicationStatus, middleware.RequireUserType("fac"))               // Update application status (Faculty only)
	projects.POST("/:id/applications/:appId/feedback", handlers.SendApplicationFeedback, middleware.RequireUserType("fac"))     // Send feedback to student (Faculty only)
	projects.POST("/:id/applications/:appId/schedule-interview", handlers.ScheduleInterview, middleware.RequireUserType("fac")) // Schedule interview (Faculty only)

	// Student application routes
	applications := api.Group("/applications")
	applications.Use(middleware.JWTMiddleware())
	applications.GET("/my", handlers.GetMyApplications, middleware.RequireUserType("stu"))                     // Get student's own applications with full details
	applications.GET("/my/applied-projects", handlers.GetMyAppliedProjects, middleware.RequireUserType("stu")) // Get lightweight list of applied project IDs and statuses
	applications.GET("/all", handlers.GetAllMyProjectApplications, middleware.RequireUserType("fac"))          // Get all applications for all professor's projects
}
