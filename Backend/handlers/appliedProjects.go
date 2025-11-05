package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/labstack/echo/v4"
)

// GetMyAppliedProjects returns a lightweight list of project IDs and statuses that the student has applied to
// Optimized to fetch only the minimal data needed for showing "applied" flags
func GetMyAppliedProjects(c echo.Context) error {
	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a student
	if userData.GetUserType() != models.UserTypeStudent {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only students can view their applied projects"})
	}

	// Define lightweight response structure
	type AppliedProjectInfo struct {
		PID    string `json:"pid"`
		Status string `json:"status"`
	}

	// Optimized query - only fetch project IDs and statuses
	var applications []models.ProjRequests
	err := config.DB.
		Select("p_id, status").
		Where("uid = ?", userData.GetUID()).
		Find(&applications).Error

	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch applied projects"})
	}

	// Build lightweight response
	appliedProjects := make([]AppliedProjectInfo, 0, len(applications))
	for _, app := range applications {
		appliedProjects = append(appliedProjects, AppliedProjectInfo{
			PID:    app.PID,
			Status: app.Status,
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"appliedProjects": appliedProjects,
		"count":           len(appliedProjects),
	})
}
