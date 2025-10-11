package models

import "gorm.io/gorm"

// TODO: Add Publications as well and certifications as well as schooling/gpa Add year of study
type Students struct {
	gorm.Model
	Uid              string   `json:"uid" gorm:"not null;index;constraint:OnDelete:CASCADE"`
	Schooling        string   `json:"schooling"`
	Experience       string   `json:"workEx"`
	Projects         []string `json:"projects"`
	PlatformProjects []uint   `json:"platformProjects"` // Foreign keys to Projects model
	Skills           []string `json:"skills" gorm:"type:text[]"`
	Activities       []string `json:"activities" gorm:"type:text[]"`
	Resume           string   `json:"resumeLink"`
}
