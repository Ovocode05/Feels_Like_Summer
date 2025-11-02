package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// TODO: Add Publications as well and certifications as well as schooling/gpa Add year of study
type Students struct {
	gorm.Model
	Uid              string         `json:"uid" gorm:"not null;index;constraint:OnDelete:CASCADE"`
	Schooling        string         `json:"schooling"`
	Institution      string         `json:"institution"`
	Degree           string         `json:"degree"`
	Location         string         `json:"location"`
	Dates            string         `json:"dates"`
	Experience       string         `json:"workEx"`
	Projects         pq.StringArray `json:"projects" gorm:"type:text[]"`
	PlatformProjects pq.Int64Array  `json:"platformProjects" gorm:"type:integer[]"` // Foreign keys to Projects model
	Skills           pq.StringArray `json:"skills" gorm:"type:text[]"`
	Activities       pq.StringArray `json:"activities" gorm:"type:text[]"`
	Resume           string         `json:"resumeLink"`
	Publications     string         `json:"publicationsLink"`
	ResearchInterest string         `json:"researchInterest"`
	Intention        string         `json:"intention"`
}
