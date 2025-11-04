package interfaces

type CProj struct {
	Name           string   `json:"name"`
	Sdesc          string   `json:"sdesc"`
	Ldesc          string   `json:"ldesc"`
	IsActive       bool     `json:"isActive"`
	Tags           []string `json:"tags"`
	WorkingUsers   []string `json:"workingUsers"`
	FieldOfStudy   string   `json:"fieldOfStudy"`
	Specialization string   `json:"specialization"`
	Duration       string   `json:"duration"`
	PositionType   []string `json:"positionType"`
	Deadline       *string  `json:"deadline"`
}

type UpdateProj struct {
	Name           *string   `json:"name"`
	Sdesc          *string   `json:"sdesc"`
	Ldesc          *string   `json:"ldesc"`
	IsActive       *bool     `json:"isActive"`
	Tags           *[]string `json:"tags"`
	WorkingUsers   *[]string `json:"workingUsers"`
	FieldOfStudy   *string   `json:"fieldOfStudy"`
	Specialization *string   `json:"specialization"`
	Duration       *string   `json:"duration"`
	PositionType   *[]string `json:"positionType"`
	Deadline       *string   `json:"deadline"`
}
