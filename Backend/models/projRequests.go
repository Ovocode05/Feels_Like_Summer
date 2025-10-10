package models

import (
	"time"

	"gorm.io/gorm"
)

type ProjRequests struct {
	gorm.Model
	TimeCreated time.Time `json:"timeCreated"`
	Status      string    `json:"status" gorm:"type:varchar(10);check:status IN ('accepted','rejected','waitlisted')"`
	UID         string    `json:"uid"`
	PID         string    `json:"pid"`
}
