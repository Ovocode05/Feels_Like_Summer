package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Projects struct {
	gorm.Model
	Name           string         `json:"name" gorm:"column:name"`
	ProjectID      string         `json:"pid" gorm:"column:project_id;uniqueIndex;not null"`
	SDesc          string         `json:"sdesc" gorm:"column:sdesc"`
	LDesc          string         `json:"ldesc" gorm:"column:ldesc"`
	IsActive       bool           `json:"isActive" gorm:"column:is_active"`
	Tags           pq.StringArray `json:"tags" gorm:"column:tags;type:text[]"`
	WorkingUsers   pq.StringArray `json:"workingUsers" gorm:"column:working_users;type:text[]"`
	CreatorID      string         `json:"creator" gorm:"column:creator_id;index"`
	FieldOfStudy   string         `json:"fieldOfStudy" gorm:"column:field_of_study"`
	Specialization string         `json:"specialization" gorm:"column:specialization"`
	Duration       string         `json:"duration" gorm:"column:duration"`
	PositionType   pq.StringArray `json:"positionType" gorm:"column:position_type;type:text[]"`
	Deadline       *string        `json:"deadline" gorm:"column:deadline"`
}
