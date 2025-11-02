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

// UserData interface defines the contract for user data in context
type UserData interface {
	GetUID() string
	GetEmail() string
	GetUserType() UserType
	GetName() string
}

// AuthenticatedUser represents user data from JWT claims
type AuthenticatedUser struct {
	UID   string   `json:"uid"`
	Email string   `json:"email"`
	Type  UserType `json:"type"`
	Name  string   `json:"name"`
}

// Implement UserData interface for AuthenticatedUser
func (au *AuthenticatedUser) GetUID() string {
	return au.UID
}

func (au *AuthenticatedUser) GetEmail() string {
	return au.Email
}

func (au *AuthenticatedUser) GetUserType() UserType {
	return au.Type
}

func (au *AuthenticatedUser) GetName() string {
	return au.Name
}

// Implement UserData interface for User (database model)
func (u *User) GetUID() string {
	return u.Uid
}

func (u *User) GetEmail() string {
	return u.Email
}

func (u *User) GetUserType() UserType {
	return u.Type
}

func (u *User) GetName() string {
	return u.Name
}

type User struct {
	gorm.Model
	Uid           string   `json:"uid" gorm:"uniqueIndex;not null"`
	Name          string   `json:"name"`
	Email         string   `json:"email" gorm:"uniqueIndex;not null"`
	Password      string   `json:"password"`
	Type          UserType `json:"type" gorm:"type:varchar(3);check:type IN ('fac','stu')"`
	EmailVerified bool     `json:"email_verified" gorm:"default:false"`
}
