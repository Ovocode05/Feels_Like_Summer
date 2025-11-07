package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// CORSValidator middleware checks if CORS headers are present in the request
func CORSValidator() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Check if Origin header is present
			origin := c.Request().Header.Get("Origin")
			if origin == "" {
				return c.JSON(http.StatusBadRequest, map[string]string{
					"error": "CORS headers missing: Origin header is required",
				})
			}

			// If CORS headers are present, continue to the next handler
			return next(c)
		}
	}
}
