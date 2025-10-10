package interfaces

type CProj struct {
	Name      string `json:"name"`
	ShortDesc string `json:"sdesc"`
	LongDesc  string `json:"ldesc"`
	IsActive  bool   `json:"isActive"`
	UserID    string `json:"userId"`
}

type UpdateProj struct {
	Name      *string `json:"name,omitempty"`
	ShortDesc *string `json:"sdesc,omitempty"`
	LongDesc  *string `json:"ldesc,omitempty"`
	IsActive  *bool   `json:"isActive,omitempty"`
}
