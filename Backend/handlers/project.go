package handlers

import (
	"backend/config"
	"backend/interfaces"
	"backend/models"
	"backend/utils"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

func CreateProject(c echo.Context) error {
	var newProject interfaces.CProj

	if err := c.Bind(&newProject); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid Input"})
	}

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var pid string

	for attempts := 0; attempts < 5; attempts++ {
		generatedId, err := utils.Generateuid()
		if err != nil {
			tx.Rollback()
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to generate user ID"})
		}

		var existingByuid models.Projects
		if tx.Where("project_id = ?", generatedId).First(&existingByuid).Error != nil {
			pid = generatedId
			break
		}
	}
	userData := c.Get("userData").(models.UserData)

	var existingProject models.Projects
	// Ensure uniqueness of project name per creator
	result := tx.Where("name = ? AND creator_id = ?", newProject.Name, userData.GetUID()).First(&existingProject)

	if result.Error == nil {
		tx.Rollback()
		return c.JSON(http.StatusConflict, echo.Map{"error": "Project already exists"})
	}

	// ...
	project := models.Projects{
		ProjectID:      pid,
		Name:           newProject.Name,
		SDesc:          newProject.Sdesc,
		LDesc:          newProject.Ldesc,
		IsActive:       newProject.IsActive,
		Tags:           pq.StringArray(newProject.Tags),
		WorkingUsers:   pq.StringArray{}, // or pq.StringArray(newProject.WorkingUsers)
		CreatorID:      userData.GetUID(),
		FieldOfStudy:   newProject.FieldOfStudy,
		Specialization: newProject.Specialization,
		Duration:       newProject.Duration,
		PositionType:   pq.StringArray(newProject.PositionType),
		Deadline:       newProject.Deadline,
	}
	if err := tx.Create(&project).Error; err != nil {
		tx.Rollback()
		// Check if it's a duplicate key error
		if err == gorm.ErrDuplicatedKey || strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			return c.JSON(http.StatusConflict, echo.Map{"error": "Project with this name already exists"})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save Project"})
	}

	return c.JSON(http.StatusCreated, project)
}

func ListProject(c echo.Context) error {
	type ProjectWithUser struct {
		models.Projects
		User models.User `json:"user"`
	}

	var projects []models.Projects

	// Fetch all projects (remove the active filter)
	if err := config.DB.Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch projects"})
	}

	var projectsWithUsers []ProjectWithUser

	// For each project, fetch the associated user (by creator)
	for _, project := range projects {
		var user models.User
		if err := config.DB.Where("uid = ?", project.CreatorID).First(&user).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch user information"})
		}

		projectWithUser := ProjectWithUser{
			Projects: project,
			User:     user,
		}
		projectsWithUsers = append(projectsWithUsers, projectWithUser)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"projects": projectsWithUsers,
		"count":    len(projectsWithUsers),
	})
}

// ListProjectsForStudent returns projects visible to a student based on application status
// Only shows active projects OR inactive projects the student has applied to
func ListProjectsForStudent(c echo.Context) error {
	type ProjectWithUser struct {
		models.Projects
		User models.User `json:"user"`
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)
	studentUID := userData.GetUID()

	// Get pagination parameters
	page := 1
	pageSize := 20
	if pageParam := c.QueryParam("page"); pageParam != "" {
		if p, err := strconv.Atoi(pageParam); err == nil && p > 0 {
			page = p
		}
	}
	if pageSizeParam := c.QueryParam("pageSize"); pageSizeParam != "" {
		if ps, err := strconv.Atoi(pageSizeParam); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	// Get all project IDs the student has applied to
	var appliedProjectIDs []string
	if err := config.DB.Model(&models.ProjRequests{}).
		Where("uid = ?", studentUID).
		Pluck("p_id", &appliedProjectIDs).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch applied projects"})
	}

	// Build query to fetch projects
	// Show active projects OR projects the student has applied to
	var projects []models.Projects
	query := config.DB.Where("is_active = ?", true)
	if len(appliedProjectIDs) > 0 {
		query = query.Or("project_id IN ?", appliedProjectIDs)
	}

	// Get total count before pagination
	var totalCount int64
	if err := query.Model(&models.Projects{}).Count(&totalCount).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to count projects"})
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch projects"})
	}

	var projectsWithUsers []ProjectWithUser

	// For each project, fetch the associated user (by creator)
	for _, project := range projects {
		var user models.User
		if err := config.DB.Where("uid = ?", project.CreatorID).First(&user).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch user information"})
		}

		projectWithUser := ProjectWithUser{
			Projects: project,
			User:     user,
		}
		projectsWithUsers = append(projectsWithUsers, projectWithUser)
	}

	totalPages := int((totalCount + int64(pageSize) - 1) / int64(pageSize))

	return c.JSON(http.StatusOK, echo.Map{
		"projects":   projectsWithUsers,
		"count":      len(projectsWithUsers),
		"total":      totalCount,
		"page":       page,
		"pageSize":   pageSize,
		"totalPages": totalPages,
	})
}

func EditProject(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID is required"})
	}

	var updateData interfaces.UpdateProj
	if err := c.Bind(&updateData); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
	}

	userData := c.Get("userData").(models.UserData)

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Lock the project row to prevent concurrent modifications
	var existingProject models.Projects
	result := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("project_id = ? AND creator_id = ?", projectID, userData.GetUID()).
		First(&existingProject)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found or you don't have permission to edit it"})
	}

	updates := make(map[string]interface{})

	if updateData.Name != nil {
		// Check for duplicate names with row-level locking to prevent race conditions
		var nameCheck models.Projects
		nameResult := tx.Set("gorm:query_option", "FOR UPDATE").
			Where("name = ? AND project_id != ? AND creator_id = ?", *updateData.Name, projectID, userData.GetUID()).
			First(&nameCheck)
		if nameResult.Error == nil {
			tx.Rollback()
			return c.JSON(http.StatusConflict, echo.Map{"error": "Project with this name already exists"})
		}
		updates["name"] = *updateData.Name
	}

	if updateData.Sdesc != nil {
		updates["sdesc"] = *updateData.Sdesc // <-- use sdesc
	}

	if updateData.Ldesc != nil {
		updates["ldesc"] = *updateData.Ldesc // <-- use ldesc
	}

	if updateData.IsActive != nil {
		updates["is_active"] = *updateData.IsActive
	}

	if updateData.Tags != nil {
		updates["tags"] = pq.StringArray(*updateData.Tags)
	}

	if updateData.WorkingUsers != nil {
		updates["working_users"] = pq.StringArray(*updateData.WorkingUsers)
	}

	if updateData.FieldOfStudy != nil {
		updates["field_of_study"] = *updateData.FieldOfStudy
	}

	if updateData.Specialization != nil {
		updates["specialization"] = *updateData.Specialization
	}

	if updateData.Duration != nil {
		updates["duration"] = *updateData.Duration
	}

	if updateData.PositionType != nil {
		updates["position_type"] = pq.StringArray(*updateData.PositionType)
	}

	if updateData.Deadline != nil {
		updates["deadline"] = *updateData.Deadline
	}

	if err := tx.Model(&existingProject).Updates(updates).Error; err != nil {
		tx.Rollback()
		// Check if it's a duplicate key error (race condition caught)
		if err == gorm.ErrDuplicatedKey || strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			return c.JSON(http.StatusConflict, echo.Map{"error": "Project with this name already exists"})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to update project"})
	}

	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save changes"})
	}

	var updatedProject models.Projects
	if err := config.DB.Where("project_id = ?", projectID).First(&updatedProject).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch updated project"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Project updated successfully",
		"project": updatedProject,
	})
}

func GetProject(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID is required"})
	}

	type ProjectWithUser struct {
		models.Projects
		User models.User `json:"user"`
	}

	var project models.Projects
	if err := config.DB.Where("project_id = ?", projectID).First(&project).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found"})
	}

	// Fetch the associated user (by creator)
	var user models.User
	if err := config.DB.Where("uid = ?", project.CreatorID).First(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch user information"})
	}

	projectWithUser := ProjectWithUser{
		Projects: project,
		User:     user,
	}

	return c.JSON(http.StatusOK, projectWithUser)
}

func DeleteProject(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID is required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check if project exists and belongs to the user
	var existingProject models.Projects
	result := tx.Where("project_id = ? AND creator_id = ?", projectID, userData.GetUID()).First(&existingProject)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found or you don't have permission to delete it"})
	}

	// Delete the project
	if err := tx.Delete(&existingProject).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to delete project"})
	}

	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save changes"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message":   "Project deleted successfully",
		"projectId": projectID,
	})
}

func GetMyProjects(c echo.Context) error {
	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	var projects []models.Projects

	// Find all projects belonging to the authenticated user
	if err := config.DB.Where("creator_id = ?", userData.GetUID()).Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch projects"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"projects": projects,
		"count":    len(projects),
	})
}

func GetProjectWorkingUsers(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID is required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Fetch the project
	var project models.Projects
	if err := config.DB.Where("project_id = ?", projectID).First(&project).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found"})
	}

	// Verify the user is the creator of the project
	if project.CreatorID != userData.GetUID() {
		return c.JSON(http.StatusForbidden, echo.Map{"error": "You don't have permission to view this project's working users"})
	}

	// If no working users, return empty array
	if len(project.WorkingUsers) == 0 {
		return c.JSON(http.StatusOK, echo.Map{
			"workingUsers": []interface{}{},
			"count":        0,
		})
	}

	type UserDetails struct {
		UID              string   `json:"uid"`
		Name             string   `json:"name"`
		Email            string   `json:"email"`
		Institution      string   `json:"institution,omitempty"`
		Degree           string   `json:"degree,omitempty"`
		Location         string   `json:"location,omitempty"`
		Skills           []string `json:"skills,omitempty"`
		ResearchInterest string   `json:"researchInterest,omitempty"`
		ResumeLink       string   `json:"resumeLink,omitempty"`
	}

	var workingUsersDetails []UserDetails

	// Fetch details for each working user
	for _, uid := range project.WorkingUsers {
		var user models.User
		if err := config.DB.Where("uid = ?", uid).First(&user).Error; err != nil {
			// Skip if user not found
			continue
		}

		userDetail := UserDetails{
			UID:   user.Uid,
			Name:  user.Name,
			Email: user.Email,
		}

		// If user is a student, fetch their profile
		if user.Type == "stu" {
			var student models.Students
			if err := config.DB.Where("uid = ?", uid).First(&student).Error; err == nil {
				userDetail.Institution = student.Institution
				userDetail.Degree = student.Degree
				userDetail.Location = student.Location
				userDetail.Skills = student.Skills
				userDetail.ResearchInterest = student.ResearchInterest
				userDetail.ResumeLink = student.Resume
			}
		}

		workingUsersDetails = append(workingUsersDetails, userDetail)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"workingUsers": workingUsersDetails,
		"count":        len(workingUsersDetails),
	})
}

// RemoveWorkingUser removes a user from the project's working users
func RemoveWorkingUser(c echo.Context) error {
	projectID := c.Param("id")
	userID := c.Param("uid")

	if projectID == "" || userID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID and User ID are required"})
	}

	// Get user data from context
	userData := c.Get("userData").(models.UserData)

	// Start a transaction
	tx := config.DB.Begin()
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to start transaction"})
	}

	// Fetch the project
	var project models.Projects
	if err := tx.Where("project_id = ?", projectID).First(&project).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found"})
	}

	// Verify the user is the creator of the project
	if project.CreatorID != userData.GetUID() {
		tx.Rollback()
		return c.JSON(http.StatusForbidden, echo.Map{"error": "You don't have permission to remove users from this project"})
	}

	// Remove user from working_users array
	if err := tx.Exec(
		"UPDATE projects SET working_users = array_remove(working_users, ?), updated_at = NOW() WHERE project_id = ?",
		userID, projectID,
	).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to remove user from project"})
	}

	// Update the application status to rejected
	if err := tx.Exec(
		"UPDATE proj_requests SET status = 'rejected' WHERE p_id = ? AND uid = ?",
		projectID, userID,
	).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to update application status"})
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save changes"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "User removed from project successfully",
	})
}
