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

	// Parse request body
	var updateRequest struct {
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
				Uid:              userData.UID,
				Institution:      updateRequest.Institution,
				Degree:           updateRequest.Degree,
				Location:         updateRequest.Location,
				Dates:            updateRequest.Dates,
				Experience:       updateRequest.Experience,
				Projects:         updateRequest.Projects,
				PlatformProjects: updateRequest.PlatformProjects,
				Skills:           updateRequest.Skills,
				Activities:       updateRequest.Activities,
				Resume:           updateRequest.Resume,
				Publications:     updateRequest.Publications,
				ResearchInterest: updateRequest.ResearchInterest,
				Intention:        updateRequest.Intention,
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
