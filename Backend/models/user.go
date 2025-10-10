package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name     string `json:"name"`
	Email    string `json:"email" gorm:"uniqueIndex;not null"`
	Password string `json:"password"`
	Type     string `json:"type"`
}
