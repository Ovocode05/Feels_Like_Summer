package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"

	"backend/config"
	"backend/interfaces"
	"backend/models"
)

func Signup(c echo.Context) error {
	var user models.User
	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	// Validate user type
	if !user.Type.IsValid() {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid user type. Must be 'fac' or 'stu'"})
	}

	// Start database transaction to prevent write/write conflicts
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if email already exists within transaction
	var existing models.User
	result := tx.Where("email = ?", user.Email).First(&existing)
	if result.Error == nil {
		tx.Rollback()
		return c.JSON(http.StatusConflict, echo.Map{"error": "User already exists"})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to hash password"})
	}
	user.Password = string(hashedPassword)

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

	// Login successful - hide password in response
	user.Password = ""
	return c.JSON(http.StatusOK, echo.Map{
		"message": "Login successful",
		"user":    user,
	})
}
