package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Projects struct {
	gorm.Model
	Name           string         `json:"name" gorm:"column:name;index:idx_project_name_creator,priority:1;not null"`
	ProjectID      string         `json:"pid" gorm:"column:project_id;uniqueIndex;not null"`
	SDesc          string         `json:"sdesc" gorm:"column:sdesc"`
	LDesc          string         `json:"ldesc" gorm:"column:ldesc"`
	IsActive       bool           `json:"isActive" gorm:"column:is_active;index"`
	Tags           pq.StringArray `json:"tags" gorm:"column:tags;type:text[]"`
	WorkingUsers   pq.StringArray `json:"workingUsers" gorm:"column:working_users;type:text[]"`
	CreatorID      string         `json:"creator" gorm:"column:creator_id;index;index:idx_project_name_creator,priority:2;not null"`
	FieldOfStudy   string         `json:"fieldOfStudy" gorm:"column:field_of_study"`
	Specialization string         `json:"specialization" gorm:"column:specialization"`
	Duration       string         `json:"duration" gorm:"column:duration"`
	PositionType   pq.StringArray `json:"positionType" gorm:"column:position_type;type:text[]"`
	Deadline       *string        `json:"deadline" gorm:"column:deadline"`
}

// TableName specifies the table name for Projects
func (Projects) TableName() string {
	return "projects"
}

// BeforeCreate hook to validate project creation
func (p *Projects) BeforeCreate(tx *gorm.DB) error {
	// Check for duplicate project name by same creator
	var count int64
	tx.Model(&Projects{}).Where("name = ? AND creator_id = ? AND deleted_at IS NULL", p.Name, p.CreatorID).Count(&count)
	if count > 0 {
		return gorm.ErrDuplicatedKey
	}
	return nil
}

// BeforeUpdate hook to validate project updates
func (p *Projects) BeforeUpdate(tx *gorm.DB) error {
	// If name is being updated, check for duplicates
	if tx.Statement.Changed("Name") {
		var count int64
		tx.Model(&Projects{}).
			Where("name = ? AND creator_id = ? AND project_id != ? AND deleted_at IS NULL",
				p.Name, p.CreatorID, p.ProjectID).
			Count(&count)
		if count > 0 {
			return gorm.ErrDuplicatedKey
		}
	}
	return nil
}
