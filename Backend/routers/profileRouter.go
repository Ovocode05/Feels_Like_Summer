package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterProfileRoutes(api *echo.Group) {
	profileGroup := api.Group("/profile")

	// All profile routes require authentication
	profileGroup.Use(middleware.JWTMiddleware())

	// Student profile routes
	studentGroup := profileGroup.Group("/student")
	studentGroup.Use(middleware.RequireUserType("stu"))

	studentGroup.GET("", handlers.GetStudentProfile)
	studentGroup.PUT("", handlers.UpdateStudentProfile)
	studentGroup.PUT("/skills", handlers.UpdateStudentSkills)
	studentGroup.POST("/project", handlers.AddPlatformProject)
	studentGroup.GET("/recommendations", handlers.GetRecommendedProjects)
}
