package middleware

import (
	"net/http"
	"strings"

	"backend/models"
	"backend/utils"

	"github.com/labstack/echo/v4"
)

// JWTMiddleware validates JWT tokens and adds user info to context
func JWTMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get Authorization header
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, echo.Map{
					"error": "Authorization header required",
				})
			}

			// Check if header starts with "Bearer "
			if !strings.HasPrefix(authHeader, "Bearer ") {
				return c.JSON(http.StatusUnauthorized, echo.Map{
					"error": "Invalid authorization header format. Use 'Bearer <token>'",
				})
			}

			// Extract token
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")

			// Validate token
			claims, err := utils.ValidateJWT(tokenString)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, echo.Map{
					"error": "Invalid or expired token",
				})
			}

			// Create user data object from claims
			userData := &models.AuthenticatedUser{
				UID:   claims.UserID,
				Email: claims.Email,
				Type:  claims.Type,
				Name:  "", // Name not available in JWT claims
			}

			// Add user data to context for use in handlers
			c.Set("userData", userData)
			c.Set("claims", claims)

			// Continue to next handler
			return next(c)
		}
	}
}

// OptionalJWTMiddleware validates JWT tokens if present but allows requests without tokens
func OptionalJWTMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get Authorization header
			authHeader := c.Request().Header.Get("Authorization")

			// If no header, continue without setting user context
			if authHeader == "" {
				return next(c)
			}

			// If header exists, validate it
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString := strings.TrimPrefix(authHeader, "Bearer ")

				// Validate token
				claims, err := utils.ValidateJWT(tokenString)
				if err == nil {
					// Create user data object from claims
					userData := &models.AuthenticatedUser{
						UID:   claims.UserID,
						Email: claims.Email,
						Type:  claims.Type,
						Name:  "", // Name not available in JWT claims
					}

					// Add user data to context only if token is valid
					c.Set("userData", userData)
					c.Set("claims", claims)
				}
			}

			// Continue to next handler regardless of token validity
			return next(c)
		}
	}
}

// RequireUserType middleware ensures the authenticated user has specific user type
func RequireUserType(allowedTypes ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get user data from context (set by JWTMiddleware)
			userDataInterface := c.Get("userData")
			if userDataInterface == nil {
				return c.JSON(http.StatusUnauthorized, echo.Map{
					"error": "User not authenticated",
				})
			}

			userData := userDataInterface.(models.UserData)
			userTypeStr := string(userData.GetUserType())

			// Check if user type is allowed
			for _, allowedType := range allowedTypes {
				if userTypeStr == allowedType {
					return next(c)
				}
			}

			return c.JSON(http.StatusForbidden, echo.Map{
				"error": "Insufficient permissions",
			})
		}
	}
}
