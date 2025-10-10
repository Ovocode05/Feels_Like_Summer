package models

import "gorm.io/gorm"

type Projects struct {
	gorm.Model
	Name string `json:"name"`
	User
}
