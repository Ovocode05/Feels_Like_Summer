package models

import (
	"time"

	"gorm.io/gorm"
)

type ProjRequests struct {
	gorm.Model
	TimeCreated      time.Time `json:"timeCreated" gorm:"index;index:idx_proj_requests_uid_time,priority:2"` // Composite index for recommendations
	Status           string    `json:"status" gorm:"type:varchar(20);check:status IN ('accepted','rejected','waitlisted', 'interview', 'under_review', 'approved');index"`
	UID              string    `json:"uid" gorm:"column:uid;index;index:idx_proj_requests_uid_time,priority:1;not null"` // Multiple indexes
	PID              string    `json:"pid" gorm:"column:p_id;index;not null"`
	Availability     string    `json:"availability" gorm:"type:text"`
	Motivation       string    `json:"motivation" gorm:"type:text"`
	PriorProjects    string    `json:"priorProjects" gorm:"type:text"`
	CVLink           string    `json:"cvLink"`
	PublicationsLink string    `json:"publicationsLink"`
	InterviewDate    string    `json:"interviewDate" gorm:"type:varchar(100)"`
	InterviewTime    string    `json:"interviewTime" gorm:"type:varchar(100)"`
	InterviewDetails string    `json:"interviewDetails" gorm:"type:text"`
}

// TableName specifies the table name for ProjRequests
func (ProjRequests) TableName() string {
	return "proj_requests"
}

// BeforeCreate hook to prevent duplicate applications
func (pr *ProjRequests) BeforeCreate(tx *gorm.DB) error {
	// Check for existing non-deleted application
	var count int64
	tx.Model(&ProjRequests{}).Where("uid = ? AND p_id = ? AND deleted_at IS NULL", pr.UID, pr.PID).Count(&count)
	if count > 0 {
		return gorm.ErrDuplicatedKey
	}
	return nil
}
