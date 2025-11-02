package utils

import (
	"errors"
	"os"
	"time"

	"backend/models"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims represents the claims stored in JWT token
type JWTClaims struct {
	UserID string          `json:"userId"`
	Email  string          `json:"email"`
	Name   string          `json:"name"`
	Type   models.UserType `json:"type"`
	jwt.RegisteredClaims
}

// JWT secret key - in production, this should be loaded from environment variables
var jwtSecret = []byte(getJWTSecret())

// getJWTSecret retrieves JWT secret from environment or uses default
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Default secret for development - CHANGE THIS IN PRODUCTION
		secret = "your-super-secret-jwt-key-change-this-in-production"
	}
	return secret
}

// GenerateJWT creates a new JWT token for a user
func GenerateJWT(user *models.User) (string, error) {
	// Create claims
	claims := JWTClaims{
		UserID: user.Uid,
		Email:  user.Email,
		Name:   user.Name,
		Type:   user.Type,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // Token expires in 24 hours
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "feels-like-summer",
			Subject:   user.Uid,
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign token with secret
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateJWT validates a JWT token and returns the claims
func ValidateJWT(tokenString string) (*JWTClaims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	// Validate token and extract claims
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshJWT generates a new token for a user (useful for token refresh)
func RefreshJWT(oldTokenString string) (string, error) {
	// Validate the old token
	claims, err := ValidateJWT(oldTokenString)
	if err != nil {
		return "", err
	}

	// Create new claims with extended expiration
	newClaims := JWTClaims{
		UserID: claims.UserID,
		Email:  claims.Email,
		Type:   claims.Type,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "feels-like-summer",
			Subject:   claims.UserID,
		},
	}

	// Create and sign new token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, newClaims)
	return token.SignedString(jwtSecret)
}
