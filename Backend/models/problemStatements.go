package models

import "gorm.io/gorm"

type ProblemStatements struct {
	gorm.Model
	PSID         string `json:"psid"`
	PSTitle      string `json:"shortDesc"`
	PSLongDesc   string `json:"longDesc"`
	Theme        string `json:"theme"`
	Category     string `json:"category"`
	UploadedBy   string `json:"uploadedBy"`
	Organization string `json:"organization"`
}
