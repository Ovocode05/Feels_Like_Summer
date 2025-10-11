package handlers

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"

	"backend/config"
	"backend/interfaces"
	"backend/models"
	"backend/utils"
)

// generateuid creates a unique 12-character uid

func Signup(c echo.Context) error {
	var signupReq interfaces.SignupRequest
	if err := c.Bind(&signupReq); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	// Validate user type
	if !signupReq.Type.IsValid() {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid user type. Must be 'fac' or 'stu'"})
	}

	// Start database transaction to prevent write/write conflicts
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Generate unique uid with retry logic
	var uid string
	for attempts := 0; attempts < 5; attempts++ {
		generatedId, err := utils.Generateuid()
		if err != nil {
			tx.Rollback()
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to generate user ID"})
		}

		// Check if uid already exists
		var existingByuid models.User
		if tx.Where("uid = ?", generatedId).First(&existingByuid).Error != nil {
			uid = generatedId
			break
		}
	}

	if uid == "" {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to generate unique user ID"})
	}

	// Check if email already exists within transaction
	var existing models.User
	result := tx.Where("email = ?", signupReq.Email).First(&existing)
	if result.Error == nil {
		tx.Rollback()
		return c.JSON(http.StatusConflict, echo.Map{"error": "User already exists"})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(signupReq.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to hash password"})
	}

	// Create user model from signup request
	user := models.User{
		Uid:      uid,
		Name:     signupReq.Name,
		Email:    signupReq.Email,
		Password: string(hashedPassword),
		Type:     signupReq.Type,
	}

	// Save user within transaction
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save user"})
	}

	user.Password = "" // hide password in response
	return c.JSON(http.StatusCreated, user)
}

func Login(c echo.Context) error {
	var loginRequest interfaces.LoginRequest
	if err := c.Bind(&loginRequest); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	// Start database transaction for consistency
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Find user by email within transaction
	var user models.User
	result := tx.Where("email = ?", loginRequest.Email).First(&user)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusUnauthorized, echo.Map{"error": "Invalid credentials"})
	}

	// Compare the provided password with the stored hash
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password))
	if err != nil {
		tx.Rollback()
		return c.JSON(http.StatusUnauthorized, echo.Map{"error": "Invalid credentials"})
	}

	// Commit transaction (though no writes occurred, maintains consistency)
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Database error"})
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(&user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to generate token"})
	}

	// Login successful - hide password in response
	user.Password = ""
	return c.JSON(http.StatusOK, echo.Map{
		"message": "Login successful",
		"token":   token,
	})
}

// RefreshToken generates a new JWT token from an existing valid token
func RefreshToken(c echo.Context) error {
	// Get Authorization header
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, echo.Map{"error": "Authorization header required"})
	}

	// Extract token
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return c.JSON(http.StatusUnauthorized, echo.Map{"error": "Invalid authorization header format"})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	// Generate new token
	newToken, err := utils.RefreshJWT(tokenString)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{"error": "Invalid or expired token"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Token refreshed successfully",
		"token":   newToken,
	})
}
