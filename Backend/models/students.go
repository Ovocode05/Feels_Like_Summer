package models

import "gorm.io/gorm"

type Students struct {
	gorm.Model
	Uid              string   `json:"uid" gorm:"not null;index;constraint:OnDelete:CASCADE"`
	Experience       string   `json:"workEx"`
	Projects         []string `json:"projects"`
	PlatformProjects []uint   `json:"platformProjects"` // Foreign keys to Projects model
	Skills           []string `json:"skills" gorm:"type:text[]"`
	Activities       []string `json:"activities" gorm:"type:text[]"`
	Resume           string   `json:"resumeLink"`
}
