package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/labstack/echo/v4"
)

// GetMyApplicationForProject returns the authenticated student's application for a specific project
// Optimized to fetch only the necessary data with a single query
func GetMyApplicationForProject(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID is required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a student
	if userData.GetUserType() != models.UserTypeStudent {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only students can view their applications"})
	}

	// Define a lightweight response structure with only needed fields
	type ApplicationStatusResponse struct {
		ID               uint   `json:"ID"`
		Status           string `json:"status"`
		TimeCreated      string `json:"time_created"`
		InterviewDate    string `json:"interviewDate,omitempty"`
		InterviewTime    string `json:"interviewTime,omitempty"`
		InterviewDetails string `json:"interviewDetails,omitempty"`
		HasApplied       bool   `json:"hasApplied"`
	}

	// Single optimized query - only fetch the specific application
	var application models.ProjRequests
	err := config.DB.
		Select("id, status, time_created, interview_date, interview_time, interview_details").
		Where("uid = ? AND p_id = ?", userData.GetUID(), projectID).
		First(&application).Error

	if err != nil {
		// No application found - return hasApplied: false
		return c.JSON(http.StatusOK, echo.Map{
			"hasApplied":  false,
			"application": nil,
		})
	}

	// Application found - return the status
	response := ApplicationStatusResponse{
		ID:               application.ID,
		Status:           application.Status,
		TimeCreated:      application.TimeCreated.Format("2006-01-02T15:04:05Z07:00"),
		InterviewDate:    application.InterviewDate,
		InterviewTime:    application.InterviewTime,
		InterviewDetails: application.InterviewDetails,
		HasApplied:       true,
	}

	return c.JSON(http.StatusOK, echo.Map{
		"hasApplied":  true,
		"application": response,
	})
}
