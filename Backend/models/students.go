package models

import (
	"database/sql/driver"
	"encoding/json"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// EducationEntry represents a single education entry
type EducationEntry struct {
	Institution string `json:"institution"`
	Degree      string `json:"degree"`
	Field       string `json:"field"`
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	Current     bool   `json:"current"`
	Description string `json:"description"`
}

// ExperienceEntry represents a single work experience entry
type ExperienceEntry struct {
	Title       string `json:"title"`
	Company     string `json:"company"`
	Location    string `json:"location"`
	StartDate   string `json:"startDate"`
	EndDate     string `json:"endDate"`
	Current     bool   `json:"current"`
	Description string `json:"description"`
}

// PublicationEntry represents a single publication
type PublicationEntry struct {
	Title   string `json:"title"`
	Authors string `json:"authors"`
	Journal string `json:"journal"`
	Date    string `json:"date"`
	Link    string `json:"link"`
}

// ProjectEntry represents a detailed project
type ProjectEntry struct {
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Technologies []string `json:"technologies"`
	Link         string   `json:"link"`
}

// JSONArray custom type for storing array of structs as JSON
type EducationArray []EducationEntry
type ExperienceArray []ExperienceEntry
type PublicationArray []PublicationEntry
type ProjectArray []ProjectEntry

// Scan implements sql.Scanner interface
func (a *EducationArray) Scan(value interface{}) error {
	if value == nil {
		*a = EducationArray{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, a)
}

// Value implements driver.Valuer interface
func (a EducationArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return nil, nil
	}
	return json.Marshal(a)
}

// Scan implements sql.Scanner interface
func (a *ExperienceArray) Scan(value interface{}) error {
	if value == nil {
		*a = ExperienceArray{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, a)
}

// Value implements driver.Valuer interface
func (a ExperienceArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return nil, nil
	}
	return json.Marshal(a)
}

// Scan implements sql.Scanner interface
func (a *PublicationArray) Scan(value interface{}) error {
	if value == nil {
		*a = PublicationArray{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, a)
}

// Value implements driver.Valuer interface
func (a PublicationArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return nil, nil
	}
	return json.Marshal(a)
}

// Scan implements sql.Scanner interface
func (a *ProjectArray) Scan(value interface{}) error {
	if value == nil {
		*a = ProjectArray{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, a)
}

// Value implements driver.Valuer interface
func (a ProjectArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return nil, nil
	}
	return json.Marshal(a)
}

type Students struct {
	gorm.Model
	Uid              string         `json:"uid" gorm:"not null;index;constraint:OnDelete:CASCADE"`
	Schooling        string         `json:"schooling"`
	Institution      string         `json:"institution"`
	Degree           string         `json:"degree"`
	Location         string         `json:"location"`
	Dates            string         `json:"dates"`
	Experience       string         `json:"workEx"`                      // Kept for backward compatibility
	Projects         pq.StringArray `json:"projects" gorm:"type:text[]"` // Kept for backward compatibility
	PlatformProjects pq.Int64Array  `json:"platformProjects" gorm:"type:integer[]"`
	Skills           pq.StringArray `json:"skills" gorm:"type:text[]"`
	Activities       pq.StringArray `json:"activities" gorm:"type:text[]"`
	Resume           string         `json:"resumeLink"`
	Publications     string         `json:"publicationsLink"` // Kept for backward compatibility
	ResearchInterest string         `json:"researchInterest"`
	Intention        string         `json:"intention"`

	// New detailed fields stored as JSON
	EducationDetails  EducationArray   `json:"educationDetails" gorm:"type:jsonb"`
	ExperienceDetails ExperienceArray  `json:"experienceDetails" gorm:"type:jsonb"`
	PublicationsList  PublicationArray `json:"publicationsList" gorm:"type:jsonb"`
	ProjectsDetails   ProjectArray     `json:"projectsDetails" gorm:"type:jsonb"`
	Summary           string           `json:"summary" gorm:"type:text"`
	PersonalInfo      string           `json:"personalInfo" gorm:"type:jsonb"`       // Store phone, linkedin, github, etc.
	DiscoveryEnabled  bool             `json:"discoveryEnabled" gorm:"default:true"` // Controls visibility in explore section
}
