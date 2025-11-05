package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func ProfileStudents(c echo.Context) error {
	return c.JSON(http.StatusOK, echo.Map{
		"message": "Profile students endpoint",
	})
}

// UpdateStudentProfile updates a student's profile information
func UpdateStudentProfile(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Ensure user is a student
	if userData.Type != "stu" {
		return c.JSON(http.StatusForbidden, echo.Map{
			"error": "Only students can update student profiles",
		})
	}

	// Parse request body with new detailed fields
	var updateRequest struct {
		// Basic fields (backward compatible)
		Institution      string   `json:"institution"`
		Degree           string   `json:"degree"`
		Location         string   `json:"location"`
		Dates            string   `json:"dates"`
		Experience       string   `json:"workEx"`
		Projects         []string `json:"projects"`
		PlatformProjects []int64  `json:"platformProjects"`
		Skills           []string `json:"skills"`
		Activities       []string `json:"activities"`
		Resume           string   `json:"resumeLink"`
		Publications     string   `json:"publicationsLink"`
		ResearchInterest string   `json:"researchInterest"`
		Intention        string   `json:"intention"`

		// New detailed fields
		EducationDetails  models.EducationArray   `json:"educationDetails"`
		ExperienceDetails models.ExperienceArray  `json:"experienceDetails"`
		PublicationsList  models.PublicationArray `json:"publicationsList"`
		ProjectsDetails   models.ProjectArray     `json:"projectsDetails"`
		Summary           string                  `json:"summary"`
		PersonalInfo      string                  `json:"personalInfo"`     // JSON string
		DiscoveryEnabled  *bool                   `json:"discoveryEnabled"` // Pointer to allow explicit false
	}

	if err := c.Bind(&updateRequest); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Invalid request body",
		})
	}

	// Find existing student record
	var student models.Students
	result := config.DB.Where("uid = ?", userData.UID).First(&student)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Create new student record if doesn't exist
			student = models.Students{
				Uid:               userData.UID,
				Institution:       updateRequest.Institution,
				Degree:            updateRequest.Degree,
				Location:          updateRequest.Location,
				Dates:             updateRequest.Dates,
				Experience:        updateRequest.Experience,
				Projects:          updateRequest.Projects,
				PlatformProjects:  updateRequest.PlatformProjects,
				Skills:            updateRequest.Skills,
				Activities:        updateRequest.Activities,
				Resume:            updateRequest.Resume,
				Publications:      updateRequest.Publications,
				ResearchInterest:  updateRequest.ResearchInterest,
				Intention:         updateRequest.Intention,
				EducationDetails:  updateRequest.EducationDetails,
				ExperienceDetails: updateRequest.ExperienceDetails,
				PublicationsList:  updateRequest.PublicationsList,
				ProjectsDetails:   updateRequest.ProjectsDetails,
				Summary:           updateRequest.Summary,
				PersonalInfo:      updateRequest.PersonalInfo,
				DiscoveryEnabled:  true, // Default to enabled
			}

			// Allow explicit override of discoveryEnabled
			if updateRequest.DiscoveryEnabled != nil {
				student.DiscoveryEnabled = *updateRequest.DiscoveryEnabled
			}

			if err := config.DB.Create(&student).Error; err != nil {
				return c.JSON(http.StatusInternalServerError, echo.Map{
					"error": "Failed to create student profile",
				})
			}

			return c.JSON(http.StatusCreated, echo.Map{
				"message": "Student profile created successfully",
				"student": student,
			})
		} else {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"error": "Database error",
			})
		}
	}

	// Update existing student record
	student.Institution = updateRequest.Institution
	student.Degree = updateRequest.Degree
	student.Location = updateRequest.Location
	student.Dates = updateRequest.Dates
	student.Experience = updateRequest.Experience
	student.Projects = updateRequest.Projects
	student.PlatformProjects = updateRequest.PlatformProjects
	student.Skills = updateRequest.Skills
	student.Activities = updateRequest.Activities
	student.Resume = updateRequest.Resume
	student.Publications = updateRequest.Publications
	student.ResearchInterest = updateRequest.ResearchInterest
	student.Intention = updateRequest.Intention
	student.EducationDetails = updateRequest.EducationDetails
	student.ExperienceDetails = updateRequest.ExperienceDetails
	student.PublicationsList = updateRequest.PublicationsList
	student.ProjectsDetails = updateRequest.ProjectsDetails
	student.Summary = updateRequest.Summary
	student.PersonalInfo = updateRequest.PersonalInfo

	// Allow explicit override of discoveryEnabled
	if updateRequest.DiscoveryEnabled != nil {
		student.DiscoveryEnabled = *updateRequest.DiscoveryEnabled
	}

	if err := config.DB.Save(&student).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to update student profile",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Student profile updated successfully",
		"student": student,
	})
}

// GetStudentProfile retrieves a student's profile information
func GetStudentProfile(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Find student record
	var student models.Students
	result := config.DB.Where("uid = ?", userData.UID).First(&student)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, echo.Map{
				"error": "Student profile not found",
			})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Database error",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"student": student,
	})
}

// UpdateStudentSkills updates only the skills array for a student
func UpdateStudentSkills(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Ensure user is a student
	if userData.Type != "stu" {
		return c.JSON(http.StatusForbidden, echo.Map{
			"error": "Only students can update student profiles",
		})
	}

	// Parse request body
	var updateRequest struct {
		Skills []string `json:"skills"`
	}

	if err := c.Bind(&updateRequest); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Invalid request body",
		})
	}

	// Update skills in database
	result := config.DB.Model(&models.Students{}).
		Where("uid = ?", userData.UID).
		Update("skills", updateRequest.Skills)

	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to update skills",
		})
	}

	if result.RowsAffected == 0 {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": "Student profile not found",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Skills updated successfully",
	})
}

// UpdateStudentResume updates only the resume link for a student
func UpdateStudentResume(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Ensure user is a student
	if userData.Type != "stu" {
		return c.JSON(http.StatusForbidden, echo.Map{
			"error": "Only students can update student profiles",
		})
	}

	// Parse request body
	var updateRequest struct {
		Resume string `json:"resumeLink"`
	}

	if err := c.Bind(&updateRequest); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Invalid request body",
		})
	}

	// Update resume link in database
	result := config.DB.Model(&models.Students{}).
		Where("uid = ?", userData.UID).
		Update("resume", updateRequest.Resume)

	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to update resume link",
		})
	}

	if result.RowsAffected == 0 {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": "Student profile not found",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Resume link updated successfully",
	})
}

// GetUserProfileByUID retrieves any user's basic profile information (public data)
func GetUserProfileByUID(c echo.Context) error {
	// Get authenticated user from context (to verify auth)
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	// Get UID from path parameter
	targetUID := c.Param("uid")
	if targetUID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "User ID is required",
		})
	}

	// Get user basic info
	var user models.User
	if err := config.DB.Where("uid = ?", targetUID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, echo.Map{
				"error": "User not found",
			})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Database error",
		})
	}

	// Return basic user info
	userInfo := map[string]interface{}{
		"uid":   user.Uid,
		"name":  user.Name,
		"email": user.Email,
		"type":  user.Type,
	}

	// If user is a student, get their profile
	if user.Type == "stu" {
		var student models.Students
		if err := config.DB.Where("uid = ?", targetUID).First(&student).Error; err == nil {
			// Return public profile information
			userInfo["student"] = map[string]interface{}{
				"institution":      student.Institution,
				"degree":           student.Degree,
				"location":         student.Location,
				"dates":            student.Dates,
				"experience":       student.Experience,
				"projects":         student.Projects,
				"skills":           student.Skills,
				"activities":       student.Activities,
				"resumeLink":       student.Resume,
				"publicationsLink": student.Publications,
				"researchInterest": student.ResearchInterest,
			}
		}
	}

	// If user is faculty, we could add professor-specific info here
	// For now, just return basic info for faculty

	return c.JSON(http.StatusOK, userInfo)
}

// ExploreUsers retrieves a list of all users for exploration
func ExploreUsers(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Get query parameters for filtering
	userType := c.QueryParam("type") // "stu" or "fac"
	search := c.QueryParam("search") // search by name or email

	// Build query
	query := config.DB.Model(&models.User{})

	// Filter by type if specified
	if userType != "" && (userType == "stu" || userType == "fac") {
		query = query.Where("type = ?", userType)
	}

	// Search filter
	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Exclude current user
	query = query.Where("uid != ?", userData.UID)

	// Fetch users
	var users []models.User
	if err := query.Find(&users).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch users",
		})
	}

	// Build response with user profiles
	type UserExploreData struct {
		UID   string `json:"uid"`
		Name  string `json:"name"`
		Email string `json:"email"`
		Type  string `json:"type"`
		// Student-specific fields (if applicable)
		Institution      string   `json:"institution,omitempty"`
		Degree           string   `json:"degree,omitempty"`
		Location         string   `json:"location,omitempty"`
		Skills           []string `json:"skills,omitempty"`
		ResearchInterest string   `json:"researchInterest,omitempty"`
	}

	var userList []UserExploreData

	for _, user := range users {
		userData := UserExploreData{
			UID:   user.Uid,
			Name:  user.Name,
			Email: user.Email,
			Type:  string(user.Type),
		}

		// If user is a student, fetch their profile
		if user.Type == "stu" {
			var student models.Students
			// Only include students who have discovery enabled
			if err := config.DB.Where("uid = ? AND discovery_enabled = ?", user.Uid, true).First(&student).Error; err == nil {
				userData.Institution = student.Institution
				userData.Degree = student.Degree
				userData.Location = student.Location
				userData.Skills = student.Skills
				userData.ResearchInterest = student.ResearchInterest
			} else {
				// Skip this user if they have discovery disabled
				continue
			}
		}

		userList = append(userList, userData)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"users": userList,
		"count": len(userList),
	})
}

// AddPlatformProject adds a project ID to the student's platform projects
func AddPlatformProject(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Ensure user is a student
	if userData.Type != "stu" {
		return c.JSON(http.StatusForbidden, echo.Map{
			"error": "Only students can update student profiles",
		})
	}

	// Parse request body
	var updateRequest struct {
		ProjectID int64 `json:"projectId"`
	}

	if err := c.Bind(&updateRequest); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Invalid request body",
		})
	}

	// Verify project exists
	var project models.Projects
	if err := config.DB.First(&project, updateRequest.ProjectID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, echo.Map{
				"error": "Project not found",
			})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Database error",
		})
	}

	// Find student and add project to their platform projects
	var student models.Students
	result := config.DB.Where("uid = ?", userData.UID).First(&student)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, echo.Map{
				"error": "Student profile not found",
			})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Database error",
		})
	}

	// Check if project is already in the list
	for _, projectID := range student.PlatformProjects {
		if projectID == updateRequest.ProjectID {
			return c.JSON(http.StatusConflict, echo.Map{
				"error": "Project already added to student profile",
			})
		}
	}

	// Add project to platform projects
	student.PlatformProjects = append(student.PlatformProjects, updateRequest.ProjectID)

	if err := config.DB.Save(&student).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to add project to student profile",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Project added to student profile successfully",
		"student": student,
	})
}
