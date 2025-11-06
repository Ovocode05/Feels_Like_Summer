package models

import (
	"time"

	"gorm.io/gorm"
)

type Roadmap struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	UserID         string         `gorm:"index;not null" json:"user_id"`
	RoadmapType    string         `gorm:"type:varchar(20);not null;default:'research';index" json:"roadmap_type"` // 'research' or 'placement'
	PreferenceHash string         `gorm:"type:varchar(64);index" json:"preference_hash"`                          // SHA-256 hash for caching
	Title          string         `gorm:"type:varchar(200);not null" json:"title"`
	RoadmapData    string         `gorm:"type:text;not null" json:"roadmap_data"` // JSON structure for the roadmap
	GeneratedBy    string         `gorm:"type:varchar(50);default:'gemini'" json:"generated_by"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// RoadmapCache stores generated roadmaps by preference hash to avoid duplicate API calls
type RoadmapCache struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	RoadmapType     string         `gorm:"type:varchar(20);not null;index" json:"roadmap_type"` // 'research' or 'placement'
	PreferenceHash  string         `gorm:"type:varchar(64);index;not null" json:"preference_hash"`
	FieldOfStudy    string         `gorm:"type:varchar(100);index" json:"field_of_study"`  // Used for research or prep area for placement
	ExperienceLevel string         `gorm:"type:varchar(50);index" json:"experience_level"` // Used for research or intensity for placement
	RoadmapData     string         `gorm:"type:text;not null" json:"roadmap_data"`         // JSON structure for the roadmap
	UsageCount      int            `gorm:"default:1" json:"usage_count"`                   // Track how many times this was reused
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

// RoadmapNode represents a single node in the roadmap
type RoadmapNode struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    string   `json:"category"` // foundation, core, advanced, specialization
	Duration    string   `json:"duration"` // estimated time to complete
	Resources   []string `json:"resources"`
	Skills      []string `json:"skills"`
	NextNodes   []string `json:"next_nodes"` // IDs of next nodes
}

// RoadmapStructure represents the complete roadmap structure
type RoadmapStructure struct {
	Title       string        `json:"title"`
	Description string        `json:"description"`
	TotalTime   string        `json:"total_time"`
	Nodes       []RoadmapNode `json:"nodes"`
}
