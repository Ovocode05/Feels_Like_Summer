package models

import (
	"time"

	"gorm.io/gorm"
)

// PasswordReset represents a password reset token
type PasswordReset struct {
	gorm.Model
	Email     string    `json:"email" gorm:"not null;index"`
	Token     string    `json:"token" gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	Used      bool      `json:"used" gorm:"default:false"`
}
