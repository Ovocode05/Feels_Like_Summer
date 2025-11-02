package routers

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterAuthRoutes(api *echo.Group) {
	authGroup := api.Group("/auth")

	authGroup.POST("/signup", handlers.Signup)
	authGroup.POST("/login", handlers.Login)

	// Password reset routes
	authGroup.POST("/forgot-password", handlers.ForgotPassword)
	authGroup.POST("/verify-reset-token", handlers.VerifyResetToken)
	authGroup.POST("/reset-password", handlers.ResetPassword)

	// Email verification routes
	authGroup.POST("/send-verification-code", handlers.SendVerificationCode)
	authGroup.POST("/verify-code", handlers.VerifyCode)
	authGroup.POST("/verify-email", handlers.VerifyEmail)
	authGroup.POST("/resend-verification", handlers.ResendVerification)

	// Get current user (requires authentication)
	authGroup.GET("/me", handlers.GetMe, middleware.JWTMiddleware())
}
