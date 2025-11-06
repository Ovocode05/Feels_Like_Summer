package models

import (
	"time"

	"gorm.io/gorm"
)

// PlacementPreference for placement/internship preparation roadmaps
type PlacementPreference struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	UserID           string         `gorm:"uniqueIndex;not null" json:"user_id"`
	TimelineWeeks    int            `gorm:"not null" json:"timeline_weeks"`                  // weeks till placement
	TimeCommitment   int            `gorm:"not null" json:"time_commitment"`                 // hours per week
	IntensityType    string         `gorm:"type:varchar(50);not null" json:"intensity_type"` // regular, intense, weekend
	PrepAreas        string         `gorm:"type:text;not null" json:"prep_areas"`            // JSON array: aptitude, dsa, core_cs, resume, interview, company_specific
	CurrentLevels    string         `gorm:"type:text;not null" json:"current_levels"`        // JSON object: {area: level}
	ResourcesStarted string         `gorm:"type:text" json:"resources_started"`              // JSON array of resources
	TargetCompanies  string         `gorm:"type:text" json:"target_companies"`               // JSON array of company names
	SpecialNeeds     string         `gorm:"type:text" json:"special_needs"`                  // any specific requirements
	Goals            string         `gorm:"type:text;not null" json:"goals"`                 // career goals, target roles
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
