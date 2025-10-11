package models

import (
	"time"

	"gorm.io/gorm"
)

type Professors struct {
	gorm.Model
	Availability []time.Time `json:"availability"`
}
