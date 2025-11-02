package models

import (
	"time"

	"gorm.io/gorm"
)

// EmailVerification represents an email verification code record
type EmailVerification struct {
	gorm.Model
	Email     string    `json:"email" gorm:"index;not null"`
	Code      string    `json:"code" gorm:"not null"` // 6-digit verification code
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	Used      bool      `json:"used" gorm:"default:false"`
}
