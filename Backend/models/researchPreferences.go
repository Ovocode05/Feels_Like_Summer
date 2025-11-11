package models

import (
	"time"

	"gorm.io/gorm"
)

type ResearchPreference struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	UserID          string         `gorm:"uniqueIndex;index;not null" json:"user_id"` // Added regular index for recommendations
	FieldOfStudy    string         `gorm:"type:varchar(100);not null" json:"field_of_study"`
	ExperienceLevel string         `gorm:"type:varchar(50);not null" json:"experience_level"` // beginner, intermediate, advanced
	CurrentYear     int            `gorm:"not null" json:"current_year"`
	Goals           string         `gorm:"type:text;not null" json:"goals"`
	TimeCommitment  int            `gorm:"not null" json:"time_commitment"`          // hours per week
	InterestAreas   string         `gorm:"type:text;not null" json:"interest_areas"` // JSON array of interests
	PriorExperience string         `gorm:"type:text" json:"prior_experience"`
	PreferredFormat string         `gorm:"type:varchar(50)" json:"preferred_format"` // visual, text, mixed
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

// PreferenceHash generates a hash for caching purposes
type PreferenceHash struct {
	FieldOfStudy    string `json:"field_of_study"`
	ExperienceLevel string `json:"experience_level"`
	Goals           string `json:"goals"`
	InterestAreas   string `json:"interest_areas"`
}
