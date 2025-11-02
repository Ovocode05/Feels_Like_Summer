package models

import (
	"time"

	"gorm.io/gorm"
)

type ProjRequests struct {
	gorm.Model
	TimeCreated      time.Time `json:"timeCreated"`
	Status           string    `json:"status" gorm:"type:varchar(20);check:status IN ('accepted','rejected','waitlisted', 'interview', 'under_review', 'approved')"`
	UID              string    `json:"uid"`
	PID              string    `json:"pid"`
	Availability     string    `json:"availability" gorm:"type:text"`
	Motivation       string    `json:"motivation" gorm:"type:text"`
	PriorProjects    string    `json:"priorProjects" gorm:"type:text"`
	CVLink           string    `json:"cvLink"`
	PublicationsLink string    `json:"publicationsLink"`
}
