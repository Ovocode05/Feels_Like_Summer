package routers

import (
	"github.com/labstack/echo/v4"
)

func SetupRoutes(e *echo.Echo) {
	// Group routes for modularity
	api := e.Group("/v1")

	// Auth routes
	RegisterAuthRoutes(api)
}
