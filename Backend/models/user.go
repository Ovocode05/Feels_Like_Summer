package models

import "gorm.io/gorm"

// UserType represents the type of user
type UserType string

const (
	UserTypeFaculty UserType = "fac"
	UserTypeStudent UserType = "stu"
)

// IsValid checks if the user type is valid
func (ut UserType) IsValid() bool {
	return ut == UserTypeFaculty || ut == UserTypeStudent
}

type User struct {
	gorm.Model
	UserID   string   `json:"userId" gorm:"uniqueIndex;not null"`
	Name     string   `json:"name"`
	Email    string   `json:"email" gorm:"uniqueIndex;not null"`
	Password string   `json:"password"`
	Type     UserType `json:"type" gorm:"type:varchar(3);check:type IN ('fac','stu')"`
}
