package handlers

import (
	"backend/config"
	"backend/models"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

// ApplyToProject handles student applications to projects
func ApplyToProject(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID is required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a student
	if userData.GetUserType() != models.UserTypeStudent {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only students can apply to projects"})
	}

	// Parse request body for application details
	var applicationRequest struct {
		Availability     string `json:"availability"`
		Motivation       string `json:"motivation"`
		PriorProjects    string `json:"priorProjects"`
		CVLink           string `json:"cvLink"`
		PublicationsLink string `json:"publicationsLink"`
	}

	if err := c.Bind(&applicationRequest); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid request body"})
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if project exists and is active
	var project models.Projects
	if err := tx.Where("project_id = ? AND is_active = ?", projectID, true).First(&project).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found or not active"})
	}

	// Check if student has already applied to this project
	var existingApplication models.ProjRequests
	result := tx.Where("uid = ? AND p_id = ?", userData.GetUID(), projectID).First(&existingApplication)
	if result.Error == nil {
		tx.Rollback()
		return c.JSON(http.StatusConflict, echo.Map{"error": "You have already applied to this project"})
	}

	// Create new application with additional fields
	application := models.ProjRequests{
		TimeCreated:      time.Now(),
		Status:           "under_review", // Default status when applying
		UID:              userData.GetUID(),
		PID:              projectID,
		Availability:     applicationRequest.Availability,
		Motivation:       applicationRequest.Motivation,
		PriorProjects:    applicationRequest.PriorProjects,
		CVLink:           applicationRequest.CVLink,
		PublicationsLink: applicationRequest.PublicationsLink,
	}

	if err := tx.Create(&application).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to submit application"})
	}

	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save application"})
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"message":     "Application submitted successfully",
		"application": application,
	})
}

// GetProjectApplications returns all applications for a specific project (for professors)
func GetProjectApplications(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID is required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a faculty member
	if userData.GetUserType() != models.UserTypeFaculty {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only faculty can view project applications"})
	}

	// Check if project exists and belongs to the professor (by creator)
	var project models.Projects
	if err := config.DB.Where("project_id = ? AND creator_id = ?", projectID, userData.GetUID()).First(&project).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found or you don't have permission to view applications"})
	}

	// Define a flattened struct for application details
	type FlattenedApplication struct {
		// Application fields
		ID          uint      `json:"id"`
		TimeCreated time.Time `json:"timeCreated"`
		Status      string    `json:"status"`
		UID         string    `json:"uid"`
		PID         string    `json:"pid"`

		// User fields
		Name     string `json:"name"`
		Email    string `json:"email"`
		UserType string `json:"userType"`

		// Student fields
		Experience       string   `json:"workEx"`
		Projects         []string `json:"projects"`
		PlatformProjects []int64  `json:"platformProjects"`
		Skills           []string `json:"skills"`
		Activities       []string `json:"activities"`
		Resume           string   `json:"resumeLink"`
	}

	var applications []models.ProjRequests
	if err := config.DB.Where("p_id = ?", projectID).Find(&applications).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch applications"})
	}

	var flattenedApplications []FlattenedApplication

	// For each application, fetch user and student details
	for _, app := range applications {
		var user models.User
		if err := config.DB.Where("uid = ?", app.UID).First(&user).Error; err != nil {
			continue // Skip if user not found
		}

		var student models.Students
		if err := config.DB.Where("uid = ?", app.UID).First(&student).Error; err != nil {
			// Create empty student record if not found
			student = models.Students{Uid: app.UID}
		}

		flattenedApp := FlattenedApplication{
			// Application fields
			ID:          app.ID,
			TimeCreated: app.TimeCreated,
			Status:      app.Status,
			UID:         app.UID,
			PID:         app.PID,

			// User fields
			Name:     user.Name,
			Email:    user.Email,
			UserType: string(user.Type),

			// Student fields
			Experience:       student.Experience,
			Projects:         student.Projects,
			PlatformProjects: student.PlatformProjects,
			Skills:           student.Skills,
			Activities:       student.Activities,
			Resume:           student.Resume,
		}
		flattenedApplications = append(flattenedApplications, flattenedApp)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"project":      project,
		"applications": flattenedApplications,
		"count":        len(flattenedApplications),
	})
}

// UpdateApplicationStatus allows professors to update the status of applications
func UpdateApplicationStatus(c echo.Context) error {
	projectID := c.Param("id")
	applicationID := c.Param("appId")

	if projectID == "" || applicationID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID and Application ID are required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a faculty member
	if userData.GetUserType() != models.UserTypeFaculty {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only faculty can update application status"})
	}

	// Parse request body
	var requestBody struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	// Validate status
	validStatuses := []string{"accepted", "rejected", "waitlisted", "interview", "under_review", "approved"}
	isValidStatus := false
	for _, validStatus := range validStatuses {
		if requestBody.Status == validStatus {
			isValidStatus = true
			break
		}
	}
	if !isValidStatus {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid status. Must be one of: accepted, rejected, waitlisted, interview, under_review, approved"})
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if project belongs to the professor (by creator)
	var project models.Projects
	if err := tx.Where("project_id = ? AND creator_id = ?", projectID, userData.GetUID()).First(&project).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found or you don't have permission"})
	}

	// Find and update the application
	var application models.ProjRequests
	if err := tx.Where("id = ? AND p_id = ?", applicationID, projectID).First(&application).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Application not found"})
	}

	// Update the status
	if err := tx.Model(&application).Update("status", requestBody.Status).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to update application status"})
	}

	// If accepted, add user to project's working users
	if requestBody.Status == "accepted" {
		workingUsers := project.WorkingUsers
		userExists := false
		for _, uid := range workingUsers {
			if uid == application.UID {
				userExists = true
				break
			}
		}
		if !userExists {
			workingUsers = append(workingUsers, application.UID)
			if err := tx.Model(&project).Update("working_users", workingUsers).Error; err != nil {
				tx.Rollback()
				return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to add user to project"})
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save changes"})
	}

	// Fetch updated application
	if err := config.DB.Where("id = ?", applicationID).First(&application).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch updated application"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message":     "Application status updated successfully",
		"application": application,
	})
}

// GetMyApplications returns all applications made by the authenticated student
func GetMyApplications(c echo.Context) error {
	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a student
	if userData.GetUserType() != models.UserTypeStudent {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only students can view their applications"})
	}

	// Define a struct to hold application with project details
	type ApplicationResponse struct {
		ID               uint      `json:"ID"`
		CreatedAt        time.Time `json:"CreatedAt"`
		UpdatedAt        time.Time `json:"UpdatedAt"`
		TimeCreated      time.Time `json:"time_created"`
		Status           string    `json:"status"`
		UID              string    `json:"uid"`
		PID              string    `json:"pid"`
		Availability     string    `json:"availability"`
		Motivation       string    `json:"motivation"`
		PriorProjects    string    `json:"priorProjects"`
		CVLink           string    `json:"cvLink"`
		PublicationsLink string    `json:"publicationsLink"`
		Project          struct {
			ID           uint      `json:"ID"`
			CreatedAt    time.Time `json:"CreatedAt"`
			UpdatedAt    time.Time `json:"UpdatedAt"`
			ProjectName  string    `json:"project_name"`
			ProjectID    string    `json:"project_id"`
			ShortDesc    string    `json:"short_desc"`
			LongDesc     string    `json:"long_desc"`
			Tags         []string  `json:"tags"`
			CreatorID    string    `json:"creator_id"`
			IsActive     bool      `json:"is_active"`
			WorkingUsers []string  `json:"working_users"`
		} `json:"Project"`
		User struct {
			ID        uint      `json:"ID"`
			CreatedAt time.Time `json:"CreatedAt"`
			UpdatedAt time.Time `json:"UpdatedAt"`
			UID       string    `json:"uid"`
			Name      string    `json:"name"`
			Email     string    `json:"email"`
			Type      string    `json:"type"`
		} `json:"User"`
	}

	var applications []models.ProjRequests
	if err := config.DB.Where("uid = ?", userData.GetUID()).Order("time_created DESC").Find(&applications).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch applications"})
	}
	var applicationsResponse []ApplicationResponse

	// For each application, fetch project and professor details
	for _, app := range applications {
		var project models.Projects
		fmt.Println("Printing pid")
		// fmt.Println(applications.PID)
		if err := config.DB.Where("project_id = ?", app.PID).First(&project).Error; err != nil {
			continue // Skip if project not found
		}

		var professor models.User
		if err := config.DB.Where("uid = ?", project.CreatorID).First(&professor).Error; err != nil {
			// Create empty professor record if not found
			professor = models.User{Uid: project.CreatorID, Name: "Unknown", Email: ""}
		}

		appResponse := ApplicationResponse{
			ID:               app.ID,
			CreatedAt:        app.CreatedAt,
			UpdatedAt:        app.UpdatedAt,
			TimeCreated:      app.TimeCreated,
			Status:           app.Status,
			UID:              app.UID,
			PID:              app.PID,
			Availability:     app.Availability,
			Motivation:       app.Motivation,
			PriorProjects:    app.PriorProjects,
			CVLink:           app.CVLink,
			PublicationsLink: app.PublicationsLink,
		}

		appResponse.Project.ID = project.ID
		appResponse.Project.CreatedAt = project.CreatedAt
		appResponse.Project.UpdatedAt = project.UpdatedAt
		appResponse.Project.ProjectName = project.Name
		appResponse.Project.ProjectID = project.ProjectID
		appResponse.Project.ShortDesc = project.SDesc
		appResponse.Project.LongDesc = project.LDesc
		appResponse.Project.Tags = project.Tags
		appResponse.Project.CreatorID = project.CreatorID
		appResponse.Project.IsActive = project.IsActive
		appResponse.Project.WorkingUsers = project.WorkingUsers

		appResponse.User.ID = professor.ID
		appResponse.User.CreatedAt = professor.CreatedAt
		appResponse.User.UpdatedAt = professor.UpdatedAt
		appResponse.User.UID = professor.Uid
		appResponse.User.Name = professor.Name
		appResponse.User.Email = professor.Email
		appResponse.User.Type = string(professor.Type)

		applicationsResponse = append(applicationsResponse, appResponse)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"applications": applicationsResponse,
		"count":        len(applicationsResponse),
	})
}

// GetAllMyProjectApplications returns all applications for all projects created by the professor
func GetAllMyProjectApplications(c echo.Context) error {
	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a faculty member
	if userData.GetUserType() != models.UserTypeFaculty {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only faculty can view project applications"})
	}

	// Get all projects created by this professor
	var projects []models.Projects
	if err := config.DB.Where("creator_id = ?", userData.GetUID()).Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch projects"})
	}

	// Define a flattened struct for application details
	type ApplicationWithDetails struct {
		// Application fields
		ID               uint      `json:"id"`
		TimeCreated      time.Time `json:"timeCreated"`
		Status           string    `json:"status"`
		UID              string    `json:"uid"`
		PID              string    `json:"pid"`
		Availability     string    `json:"availability"`
		Motivation       string    `json:"motivation"`
		PriorProjects    string    `json:"priorProjects"`
		CVLink           string    `json:"cvLink"`
		PublicationsLink string    `json:"publicationsLink"`

		// Student/User fields
		Name     string `json:"name"`
		Email    string `json:"email"`
		UserType string `json:"userType"`

		// Student profile fields
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
		ResearchInterest string   `json:"researchInterest"`
		Intention        string   `json:"intention"`
	}

	type ProjectWithApplications struct {
		Project      models.Projects          `json:"project"`
		Applications []ApplicationWithDetails `json:"applications"`
		Count        int                      `json:"count"`
	}

	var result []ProjectWithApplications

	// For each project, fetch all applications
	for _, project := range projects {
		var applications []models.ProjRequests
		if err := config.DB.Where("p_id = ?", project.ProjectID).Find(&applications).Error; err != nil {
			continue // Skip if error fetching applications
		}

		var detailedApplications []ApplicationWithDetails

		// For each application, fetch user and student details
		for _, app := range applications {
			var user models.User
			if err := config.DB.Where("uid = ?", app.UID).First(&user).Error; err != nil {
				continue // Skip if user not found
			}

			var student models.Students
			if err := config.DB.Where("uid = ?", app.UID).First(&student).Error; err != nil {
				// Create empty student record if not found
				student = models.Students{Uid: app.UID}
			}

			detailedApp := ApplicationWithDetails{
				// Application fields
				ID:               app.ID,
				TimeCreated:      app.TimeCreated,
				Status:           app.Status,
				UID:              app.UID,
				PID:              app.PID,
				Availability:     app.Availability,
				Motivation:       app.Motivation,
				PriorProjects:    app.PriorProjects,
				CVLink:           app.CVLink,
				PublicationsLink: app.PublicationsLink,

				// User fields
				Name:     user.Name,
				Email:    user.Email,
				UserType: string(user.Type),

				// Student profile fields
				Institution:      student.Institution,
				Degree:           student.Degree,
				Location:         student.Location,
				Dates:            student.Dates,
				Experience:       student.Experience,
				Projects:         student.Projects,
				PlatformProjects: student.PlatformProjects,
				Skills:           student.Skills,
				Activities:       student.Activities,
				Resume:           student.Resume,
				ResearchInterest: student.ResearchInterest,
				Intention:        student.Intention,
			}
			detailedApplications = append(detailedApplications, detailedApp)
		}

		projectWithApps := ProjectWithApplications{
			Project:      project,
			Applications: detailedApplications,
			Count:        len(detailedApplications),
		}
		result = append(result, projectWithApps)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"projects": result,
		"total":    len(result),
	})
}
