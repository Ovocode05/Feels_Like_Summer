package handlers

import (
	"backend/config"
	"backend/models"
	"backend/utils"
	"fmt"
	"log"
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

	// Send email notification to the professor
	go func() {
		// Fetch professor details
		var professor models.User
		if err := config.DB.Where("uid = ?", project.CreatorID).First(&professor).Error; err != nil {
			log.Printf("Failed to fetch professor for email notification: %v", err)
			return
		}

		// Fetch student details
		var student models.User
		if err := config.DB.Where("uid = ?", userData.GetUID()).First(&student).Error; err != nil {
			log.Printf("Failed to fetch student for email notification: %v", err)
			return
		}

		// Send email to professor
		emailConfig := utils.LoadEmailConfig()
		if err := utils.SendProjectApplicationEmail(emailConfig, professor.Email, project.Name, student.Name); err != nil {
			log.Printf("Failed to send application email to professor %s: %v", professor.Email, err)
		}
	}()

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

		// Interview fields
		InterviewDate    string `json:"interviewDate"`
		InterviewTime    string `json:"interviewTime"`
		InterviewDetails string `json:"interviewDetails"`
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

			// Interview fields
			InterviewDate:    app.InterviewDate,
			InterviewTime:    app.InterviewTime,
			InterviewDetails: app.InterviewDetails,
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

	// Send email notification to the student about status update
	go func() {
		// Fetch student details
		var student models.User
		if err := config.DB.Where("uid = ?", application.UID).First(&student).Error; err != nil {
			log.Printf("Failed to fetch student for status update email: %v", err)
			return
		}

		// Send appropriate email based on status
		emailConfig := utils.LoadEmailConfig()
		var emailBody string
		var subject string

		switch requestBody.Status {
		case "accepted", "approved":
			subject = fmt.Sprintf("Congratulations! Application Accepted for %s", project.Name)
			emailBody = fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #4CAF50;">Application Accepted!</h2>
						<p>Hi %s,</p>
						<p>Great news! Your application for <strong>%s</strong> has been accepted.</p>
						<p>The project lead will contact you shortly with next steps.</p>
						<p>Log in to your dashboard to view more details.</p>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, student.Name, project.Name)
		case "rejected":
			subject = fmt.Sprintf("Application Update for %s", project.Name)
			emailBody = fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #333;">Application Update</h2>
						<p>Hi %s,</p>
						<p>Thank you for your interest in <strong>%s</strong>.</p>
						<p>Unfortunately, we are unable to move forward with your application at this time.</p>
						<p>We encourage you to explore other exciting projects on our platform.</p>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, student.Name, project.Name)
		case "interview":
			subject = fmt.Sprintf("Interview Request for %s", project.Name)
			emailBody = fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #2196F3;">Interview Request</h2>
						<p>Hi %s,</p>
						<p>Your application for <strong>%s</strong> has been reviewed and the project lead would like to interview you.</p>
						<p>Please check your dashboard for more details and contact information.</p>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, student.Name, project.Name)
		case "waitlisted":
			subject = fmt.Sprintf("Application Waitlisted for %s", project.Name)
			emailBody = fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #FF9800;">Application Waitlisted</h2>
						<p>Hi %s,</p>
						<p>Your application for <strong>%s</strong> has been placed on the waitlist.</p>
						<p>We'll notify you if a position becomes available.</p>
						<p>Thank you for your patience!</p>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, student.Name, project.Name)
		default:
			// For other statuses, send a generic update
			subject = fmt.Sprintf("Application Status Update for %s", project.Name)
			emailBody = fmt.Sprintf(`
				<html>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
					<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
						<h2 style="color: #333;">Application Status Update</h2>
						<p>Hi %s,</p>
						<p>Your application status for <strong>%s</strong> has been updated to: <strong>%s</strong></p>
						<p>Log in to your dashboard to view more details.</p>
						<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
						<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
					</div>
				</body>
				</html>
			`, student.Name, project.Name, requestBody.Status)
		}

		emailMessage := &utils.EmailMessage{
			To:      []string{student.Email},
			Subject: subject,
			Body:    emailBody,
			IsHTML:  true,
		}

		if err := utils.SendEmail(emailConfig, emailMessage); err != nil {
			log.Printf("Failed to send status update email to student %s: %v", student.Email, err)
		}
	}()

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
		InterviewDate    string    `json:"interviewDate"`
		InterviewTime    string    `json:"interviewTime"`
		InterviewDetails string    `json:"interviewDetails"`
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
			InterviewDate:    app.InterviewDate,
			InterviewTime:    app.InterviewTime,
			InterviewDetails: app.InterviewDetails,
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

		// Interview fields
		InterviewDate    string `json:"interviewDate"`
		InterviewTime    string `json:"interviewTime"`
		InterviewDetails string `json:"interviewDetails"`

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

				// Interview fields
				InterviewDate:    app.InterviewDate,
				InterviewTime:    app.InterviewTime,
				InterviewDetails: app.InterviewDetails,

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

// SendApplicationFeedback allows professors to send feedback to students
func SendApplicationFeedback(c echo.Context) error {
	projectID := c.Param("id")
	applicationID := c.Param("appId")

	if projectID == "" || applicationID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID and Application ID are required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a faculty member
	if userData.GetUserType() != models.UserTypeFaculty {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only faculty can send feedback"})
	}

	// Parse request body
	var requestBody struct {
		Feedback string `json:"feedback" binding:"required"`
	}

	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	if requestBody.Feedback == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Feedback message is required"})
	}

	// Check if project belongs to the professor
	var project models.Projects
	if err := config.DB.Where("project_id = ? AND creator_id = ?", projectID, userData.GetUID()).First(&project).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found or you don't have permission"})
	}

	// Find the application
	var application models.ProjRequests
	if err := config.DB.Where("id = ? AND p_id = ?", applicationID, projectID).First(&application).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Application not found"})
	}

	// Fetch student details
	var student models.User
	if err := config.DB.Where("uid = ?", application.UID).First(&student).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Student not found"})
	}

	// Fetch professor details
	var professor models.User
	if err := config.DB.Where("uid = ?", userData.GetUID()).First(&professor).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Professor not found"})
	}

	// Send feedback email to the student
	emailConfig := utils.LoadEmailConfig()
	subject := fmt.Sprintf("Feedback on your application for %s", project.Name)
	emailBody := fmt.Sprintf(`
		<html>
		<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
			<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
				<h2 style="color: #2196F3;">Application Feedback</h2>
				<p>Hi %s,</p>
				<p>You have received feedback from <strong>%s</strong> regarding your application for <strong>%s</strong>:</p>
				<div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
					<p style="margin: 0; white-space: pre-wrap;">%s</p>
				</div>
				<p>Log in to your dashboard to view your application status and more details.</p>
				<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
				<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
			</div>
		</body>
		</html>
	`, student.Name, professor.Name, project.Name, requestBody.Feedback)

	emailMessage := &utils.EmailMessage{
		To:      []string{student.Email},
		Subject: subject,
		Body:    emailBody,
		IsHTML:  true,
	}

	if err := utils.SendEmail(emailConfig, emailMessage); err != nil {
		log.Printf("Failed to send feedback email to student %s: %v", student.Email, err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to send feedback email"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Feedback sent successfully",
	})
}

// ScheduleInterview allows professors to schedule interviews with students
func ScheduleInterview(c echo.Context) error {
	projectID := c.Param("id")
	applicationID := c.Param("appId")

	if projectID == "" || applicationID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID and Application ID are required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Verify user is a faculty member
	if userData.GetUserType() != models.UserTypeFaculty {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "Only faculty can schedule interviews"})
	}

	// Parse request body
	var requestBody struct {
		InterviewDate    string `json:"interviewDate" binding:"required"`
		InterviewTime    string `json:"interviewTime" binding:"required"`
		InterviewDetails string `json:"interviewDetails"`
	}

	if err := c.Bind(&requestBody); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	if requestBody.InterviewDate == "" || requestBody.InterviewTime == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Interview date and time are required"})
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if project belongs to the professor
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

	// Update the application with interview details and status
	updates := map[string]interface{}{
		"status":            "interview",
		"interview_date":    requestBody.InterviewDate,
		"interview_time":    requestBody.InterviewTime,
		"interview_details": requestBody.InterviewDetails,
	}

	if err := tx.Model(&application).Updates(updates).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to schedule interview"})
	}

	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save changes"})
	}

	// Send interview email to the student
	go func() {
		var student models.User
		if err := config.DB.Where("uid = ?", application.UID).First(&student).Error; err != nil {
			log.Printf("Failed to fetch student for interview email: %v", err)
			return
		}

		var professor models.User
		if err := config.DB.Where("uid = ?", userData.GetUID()).First(&professor).Error; err != nil {
			log.Printf("Failed to fetch professor for interview email: %v", err)
			return
		}

		emailConfig := utils.LoadEmailConfig()
		subject := fmt.Sprintf("Interview Scheduled for %s", project.Name)
		emailBody := fmt.Sprintf(`
			<html>
			<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
				<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
					<h2 style="color: #4CAF50;">Interview Scheduled!</h2>
					<p>Hi %s,</p>
					<p><strong>%s</strong> has scheduled an interview with you for the project: <strong>%s</strong></p>
					<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
						<p style="margin: 5px 0;"><strong>📅 Date:</strong> %s</p>
						<p style="margin: 5px 0;"><strong>🕐 Time:</strong> %s</p>
						%s
					</div>
					<p>Please make sure to be available at the scheduled time. Good luck!</p>
					<p>Log in to your dashboard to view more details.</p>
					<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
					<p style="font-size: 12px; color: #666;">Feels Like Summer Team</p>
				</div>
			</body>
			</html>
		`, student.Name, professor.Name, project.Name, requestBody.InterviewDate, requestBody.InterviewTime,
			func() string {
				if requestBody.InterviewDetails != "" {
					return fmt.Sprintf(`<p style="margin: 5px 0;"><strong>📝 Details:</strong> %s</p>`, requestBody.InterviewDetails)
				}
				return ""
			}())

		emailMessage := &utils.EmailMessage{
			To:      []string{student.Email},
			Subject: subject,
			Body:    emailBody,
			IsHTML:  true,
		}

		if err := utils.SendEmail(emailConfig, emailMessage); err != nil {
			log.Printf("Failed to send interview email to student %s: %v", student.Email, err)
		}
	}()

	// Fetch updated application
	if err := config.DB.Where("id = ?", applicationID).First(&application).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch updated application"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message":     "Interview scheduled successfully",
		"application": application,
	})
}
