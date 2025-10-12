package interfaces

type CProj struct {
	Name         string   `json:"name"`
	Sdesc        string   `json:"sdesc"`
	Ldesc        string   `json:"ldesc"`
	IsActive     bool     `json:"isActive"`
	Tags         []string `json:"tags"`
	WorkingUsers []string `json:"workingUsers"`
}

type UpdateProj struct {
	Name         *string   `json:"name"`
	Sdesc        *string   `json:"sdesc"`
	Ldesc        *string   `json:"ldesc"`
	IsActive     *bool     `json:"isActive"`
	Tags         *[]string `json:"tags"`
	WorkingUsers *[]string `json:"workingUsers"`
}
