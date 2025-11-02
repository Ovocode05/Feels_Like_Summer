package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

// GenerateResetToken generates a secure random token for password reset
func GenerateResetToken() (string, error) {
	// Generate 32 random bytes (256 bits)
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random token: %w", err)
	}

	// Convert to hexadecimal string
	return hex.EncodeToString(bytes), nil
}

// GenerateVerificationToken generates a secure random token for email verification
func GenerateVerificationToken() (string, error) {
	// Generate 32 random bytes (256 bits)
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random token: %w", err)
	}

	// Convert to hexadecimal string
	return hex.EncodeToString(bytes), nil
}

// GenerateVerificationCode generates a 6-digit verification code
func GenerateVerificationCode() (string, error) {
	// Generate a random number between 100000 and 999999
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random code: %w", err)
	}

	// Convert bytes to int and get a number between 100000 and 999999
	num := int(bytes[0])<<24 | int(bytes[1])<<16 | int(bytes[2])<<8 | int(bytes[3])
	if num < 0 {
		num = -num
	}
	code := 100000 + (num % 900000)

	return fmt.Sprintf("%06d", code), nil
}
