package models

import "gorm.io/gorm"

type Projects struct {
	gorm.Model
	Name         string   `json:"name"`
	ProjectID    string   `json:"pid" gorm:"uniqueIndex;not null"`
	ShortDesc    string   `json:"shortDesc"`
	LongDesc     string   `json:"longDesc"`
	IsActive     string   `json:"isActive"`
	Uid          string   `json:"uid" gorm:"not null;index;constraint:OnDelete:CASCADE"`
	WorkingUsers []string `json:"workUsers" gorm:"type:text[]"`
}
