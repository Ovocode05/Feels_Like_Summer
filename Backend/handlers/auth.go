package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

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

	// Check if email already exists within transaction
	var existing models.User
	result := tx.Where("email = ?", signupReq.Email).First(&existing)
	if result.Error == nil {
		// Check if user has verified their email
		if existing.EmailVerified {
			tx.Rollback()
			return c.JSON(http.StatusConflict, echo.Map{"error": "User already exists"})
		}
		// User registered but not verified - allow re-registration
		// Permanently delete the unverified user and their verification codes using Unscoped()
		if err := tx.Unscoped().Delete(&existing).Error; err != nil {
			tx.Rollback()
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to clean up unverified user"})
		}
		if err := tx.Unscoped().Where("email = ?", signupReq.Email).Delete(&models.EmailVerification{}).Error; err != nil {
			tx.Rollback()
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to clean up verification records"})
		}
	}

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

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(signupReq.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to hash password"})
	}

	// Create user model from signup request (email not verified yet)
	user := models.User{
		Uid:           uid,
		Name:          signupReq.Name,
		Email:         signupReq.Email,
		Password:      string(hashedPassword),
		Type:          signupReq.Type,
		EmailVerified: false,
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

	// Delete any existing verification codes for this email before creating a new one
	if err := config.DB.Unscoped().Where("email = ?", user.Email).Delete(&models.EmailVerification{}).Error; err != nil {
		log.Printf("Warning: Failed to clean up old verification codes for %s: %v", user.Email, err)
	}

	// Generate verification code
	code, err := utils.GenerateVerificationCode()
	if err != nil {
		log.Printf("Failed to generate verification code for %s: %v", user.Email, err)
		return c.JSON(http.StatusCreated, echo.Map{
			"message": "User created but failed to send verification email. Please request a new code.",
			"user":    user,
		})
	}

	log.Printf("Generated verification code for %s: %s", user.Email, code) // DEBUG LOG

	// Save verification code to database
	emailVerification := models.EmailVerification{
		Email:     user.Email,
		Code:      code,
		ExpiresAt: time.Now().Add(10 * time.Minute),
		Used:      false,
	}

	if err := config.DB.Create(&emailVerification).Error; err != nil {
		log.Printf("Failed to save verification code for %s: %v", user.Email, err)
		return c.JSON(http.StatusCreated, echo.Map{
			"message": "User created but failed to send verification email. Please request a new code.",
			"user":    user,
		})
	}

	// Send verification email asynchronously
	go func(email, name, verificationCode string) {
		emailConfig := utils.LoadEmailConfig()
		emailMessage := &utils.EmailMessage{
			To:      []string{email},
			Subject: "Verify Your Email Address",
			Body: fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #4CAF50;">Welcome to Feels Like Summer!</h2>
						<p>Hi %s,</p>
						<p>Thank you for signing up! Please verify your email address using the code below:</p>
						<div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
							%s
						</div>
						<p>This code will expire in 10 minutes.</p>
						<p>If you didn't create an account, please ignore this email.</p>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, name, verificationCode),
			IsHTML: true,
		}

		if err := utils.SendEmail(emailConfig, emailMessage); err != nil {
			log.Printf("Failed to send verification email to %s: %v", email, err)
		} else {
			log.Printf("Successfully sent verification email with code %s to %s", verificationCode, email)
		}
	}(user.Email, user.Name, code)

	user.Password = "" // hide password in response
	return c.JSON(http.StatusCreated, echo.Map{
		"message": "User created successfully. A verification code will be sent to your email shortly.",
		"user":    user,
	})
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

	// Check if email is verified
	if !user.EmailVerified {
		tx.Rollback()
		return c.JSON(http.StatusForbidden, echo.Map{
			"error":          "Email not verified",
			"email_verified": false,
		})
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

// ForgotPassword initiates the password reset process
func ForgotPassword(c echo.Context) error {
	var req interfaces.ForgotPasswordRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	// Validate email format
	if req.Email == "" || !strings.Contains(req.Email, "@") {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Valid email is required"})
	}

	// Start database transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if user exists
	var user models.User
	result := tx.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		// For security reasons, we return success even if user doesn't exist
		// This prevents email enumeration attacks
		return c.JSON(http.StatusOK, echo.Map{
			"message": "If an account with that email exists, a password reset link has been sent",
		})
	}

	// Generate reset token
	token, err := utils.GenerateResetToken()
	if err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to generate reset token"})
	}

	// Delete any existing unused reset tokens for this email (permanently)
	if err := tx.Unscoped().Where("email = ? AND used = ?", req.Email, false).Delete(&models.PasswordReset{}).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to clean up old reset tokens"})
	}

	// Create password reset record
	passwordReset := models.PasswordReset{
		Email:     req.Email,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour), // Token expires in 1 hour
		Used:      false,
	}

	if err := tx.Create(&passwordReset).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to create reset token"})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Database error"})
	}

	// Send password reset email asynchronously
	go func(email, resetToken string) {
		emailConfig := utils.LoadEmailConfig()
		if err := utils.SendPasswordResetEmail(emailConfig, email, resetToken); err != nil {
			log.Printf("Failed to send password reset email to %s: %v", email, err)
		}
	}(req.Email, token)

	return c.JSON(http.StatusOK, echo.Map{
		"message": "If an account with that email exists, a password reset link will be sent shortly",
	})
}

// VerifyResetToken checks if a reset token is valid
func VerifyResetToken(c echo.Context) error {
	var req interfaces.VerifyResetTokenRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	if req.Token == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Token is required"})
	}

	// Find the reset token
	var passwordReset models.PasswordReset
	result := config.DB.Where("token = ?", req.Token).First(&passwordReset)
	if result.Error != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"valid": false,
			"error": "Invalid or expired reset token",
		})
	}

	// Check if token is used
	if passwordReset.Used {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"valid": false,
			"error": "Reset token has already been used",
		})
	}

	// Check if token is expired
	if time.Now().After(passwordReset.ExpiresAt) {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"valid": false,
			"error": "Reset token has expired",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"valid": true,
		"email": passwordReset.Email,
	})
}

// ResetPassword resets the user's password using a valid reset token
func ResetPassword(c echo.Context) error {
	var req interfaces.ResetPasswordRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	if req.Token == "" || req.NewPassword == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Token and new password are required"})
	}

	if len(req.NewPassword) < 6 {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Password must be at least 6 characters long"})
	}

	// Start database transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Find the reset token
	var passwordReset models.PasswordReset
	result := tx.Where("token = ?", req.Token).First(&passwordReset)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid or expired reset token"})
	}

	// Check if token is used
	if passwordReset.Used {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Reset token has already been used"})
	}

	// Check if token is expired
	if time.Now().After(passwordReset.ExpiresAt) {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Reset token has expired"})
	}

	// Find the user
	var user models.User
	result = tx.Where("email = ?", passwordReset.Email).First(&user)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "User not found"})
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to hash password"})
	}

	// Update user's password
	if err := tx.Model(&user).Update("password", string(hashedPassword)).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to update password"})
	}

	// Mark reset token as used
	if err := tx.Model(&passwordReset).Update("used", true).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to mark token as used"})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Database error"})
	}

	// Send password reset confirmation email asynchronously
	go func(email, name string) {
		emailConfig := utils.LoadEmailConfig()
		emailMessage := &utils.EmailMessage{
			To:      []string{email},
			Subject: "Password Reset Successful",
			Body: fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #4CAF50;">Password Reset Successful</h2>
						<p>Hi %s,</p>
						<p>Your password has been successfully reset.</p>
						<p>If you did not make this change, please contact our support team immediately.</p>
						<p>For security, we recommend:</p>
						<ul>
							<li>Using a strong, unique password</li>
							<li>Enabling two-factor authentication if available</li>
							<li>Not sharing your password with anyone</li>
						</ul>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, name),
			IsHTML: true,
		}

		if err := utils.SendEmail(emailConfig, emailMessage); err != nil {
			log.Printf("Failed to send password reset confirmation email to %s: %v", email, err)
		}
	}(user.Email, user.Name)

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Password has been reset successfully. A confirmation email will be sent shortly.",
	})
}

// SendVerificationCode sends a verification code to the user's email
func SendVerificationCode(c echo.Context) error {
	var req interfaces.SendVerificationCodeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	if req.Email == "" || !strings.Contains(req.Email, "@") {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Valid email is required"})
	}

	// Start database transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if user exists
	var user models.User
	result := tx.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "User not found"})
	}

	// Check if already verified
	if user.EmailVerified {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Email is already verified"})
	}

	// Generate 6-digit verification code
	code, err := utils.GenerateVerificationCode()
	if err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to generate verification code"})
	}

	// Delete any existing unused verification codes for this email (permanently)
	if err := tx.Unscoped().Where("email = ? AND used = ?", req.Email, false).Delete(&models.EmailVerification{}).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to clean up old verification codes"})
	}

	// Create new email verification record
	emailVerification := models.EmailVerification{
		Email:     req.Email,
		Code:      code,
		ExpiresAt: time.Now().Add(10 * time.Minute), // Code expires in 10 minutes
		Used:      false,
	}

	if err := tx.Create(&emailVerification).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to create verification code"})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Database error"})
	}

	// Send verification email asynchronously
	go func(email, name, verificationCode string) {
		emailConfig := utils.LoadEmailConfig()
		emailMessage := &utils.EmailMessage{
			To:      []string{email},
			Subject: "Your Verification Code",
			Body: fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #4CAF50;">Email Verification</h2>
						<p>Hi %s,</p>
						<p>Your verification code is:</p>
						<div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
							%s
						</div>
						<p>This code will expire in 10 minutes.</p>
						<p>If you didn't request this code, please ignore this email.</p>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, name, verificationCode),
			IsHTML: true,
		}

		if err := utils.SendEmail(emailConfig, emailMessage); err != nil {
			log.Printf("Failed to send verification email to %s: %v", email, err)
		}
	}(req.Email, user.Name, code)

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Verification code will be sent to your email shortly",
	})
}

// VerifyCode verifies the user's email with the provided code
func VerifyCode(c echo.Context) error {
	var req interfaces.VerifyCodeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	if req.Email == "" || req.Code == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Email and code are required"})
	}

	// Start database transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Find the verification code
	var emailVerification models.EmailVerification
	result := tx.Where("email = ? AND code = ?", req.Email, req.Code).First(&emailVerification)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid verification code"})
	}

	// Check if code is already used
	if emailVerification.Used {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Verification code has already been used"})
	}

	// Check if code is expired
	if time.Now().After(emailVerification.ExpiresAt) {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Verification code has expired"})
	}

	// Find the user
	var user models.User
	result = tx.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "User not found"})
	}

	// Mark user's email as verified
	if err := tx.Model(&user).Update("email_verified", true).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to verify email"})
	}

	// Mark verification code as used
	if err := tx.Model(&emailVerification).Update("used", true).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to mark code as used"})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Database error"})
	}

	// Send welcome email after successful verification asynchronously
	go func(email, name string) {
		emailConfig := utils.LoadEmailConfig()
		if err := utils.SendWelcomeEmail(emailConfig, email, name); err != nil {
			log.Printf("Failed to send welcome email to %s: %v", email, err)
		}
	}(user.Email, user.Name)

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Email verified successfully",
	})
}

// VerifyEmail verifies a user's email using a verification token (legacy support)
func VerifyEmail(c echo.Context) error {
	var req interfaces.VerifyEmailRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	if req.Token == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Token is required"})
	}

	// Start database transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Find the verification token
	var emailVerification models.EmailVerification
	result := tx.Where("code = ?", req.Token).First(&emailVerification)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid or expired verification token"})
	}

	// Check if token is already used
	if emailVerification.Used {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Verification token has already been used"})
	}

	// Check if token is expired
	if time.Now().After(emailVerification.ExpiresAt) {
		tx.Rollback()
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Verification token has expired"})
	}

	// Find the user
	var user models.User
	result = tx.Where("email = ?", emailVerification.Email).First(&user)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "User not found"})
	}

	// Check if already verified
	if user.EmailVerified {
		tx.Rollback()
		return c.JSON(http.StatusOK, echo.Map{
			"message": "Email is already verified",
		})
	}

	// Mark user's email as verified
	if err := tx.Model(&user).Update("email_verified", true).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to verify email"})
	}

	// Mark verification token as used
	if err := tx.Model(&emailVerification).Update("used", true).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to mark token as used"})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Database error"})
	}

	// Send welcome email after successful verification asynchronously
	go func(email, name string) {
		emailConfig := utils.LoadEmailConfig()
		if err := utils.SendWelcomeEmail(emailConfig, email, name); err != nil {
			log.Printf("Failed to send welcome email to %s: %v", email, err)
		}
	}(user.Email, user.Name)

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Email verified successfully",
	})
}

// ResendVerification resends the verification code
func ResendVerification(c echo.Context) error {
	var req interfaces.ResendVerificationRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	if req.Email == "" || !strings.Contains(req.Email, "@") {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Valid email is required"})
	}

	// Start database transaction
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if user exists
	var user models.User
	result := tx.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		// For security reasons, return success even if user doesn't exist
		return c.JSON(http.StatusOK, echo.Map{
			"message": "If an account with that email exists, a verification code has been sent",
		})
	}

	// Check if already verified
	if user.EmailVerified {
		tx.Rollback()
		return c.JSON(http.StatusOK, echo.Map{
			"message": "Email is already verified",
		})
	}

	// Generate new verification code
	code, err := utils.GenerateVerificationCode()
	if err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to generate verification code"})
	}

	// Delete any existing unused verification codes for this email (permanently)
	if err := tx.Unscoped().Where("email = ? AND used = ?", req.Email, false).Delete(&models.EmailVerification{}).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to clean up old verification codes"})
	}

	// Create new email verification record
	emailVerification := models.EmailVerification{
		Email:     req.Email,
		Code:      code,
		ExpiresAt: time.Now().Add(10 * time.Minute), // Code expires in 10 minutes
		Used:      false,
	}

	if err := tx.Create(&emailVerification).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to create verification code"})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Database error"})
	}

	// Send verification email asynchronously
	go func(email, name, verificationCode string) {
		emailConfig := utils.LoadEmailConfig()
		emailMessage := &utils.EmailMessage{
			To:      []string{email},
			Subject: "Your Verification Code",
			Body: fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #4CAF50;">Email Verification</h2>
						<p>Hi %s,</p>
						<p>Your verification code is:</p>
						<div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
							%s
						</div>
						<p>This code will expire in 10 minutes.</p>
						<p>If you didn't request this code, please ignore this email.</p>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, name, verificationCode),
			IsHTML: true,
		}

		if err := utils.SendEmail(emailConfig, emailMessage); err != nil {
			log.Printf("Failed to send verification email to %s: %v", email, err)
		}
	}(req.Email, user.Name, code)

	return c.JSON(http.StatusOK, echo.Map{
		"message": "If an account with that email exists, a verification code will be sent shortly",
	})
}

// GetMe returns the current authenticated user's information
func GetMe(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Fetch full user details from database
	var user models.User
	if err := config.DB.Where("uid = ?", userData.UID).First(&user).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": "User not found",
		})
	}

	// Return user info (without password)
	return c.JSON(http.StatusOK, echo.Map{
		"user": echo.Map{
			"uid":   user.Uid,
			"name":  user.Name,
			"email": user.Email,
			"type":  user.Type,
		},
	})
}
