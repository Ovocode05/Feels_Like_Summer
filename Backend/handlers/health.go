package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// Health returns a simple success message
func Health(c echo.Context) error {
	return c.String(http.StatusOK, "Services are Healthy")
}
