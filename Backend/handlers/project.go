package handlers

import (
	"backend/config"
	"backend/interfaces"
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/labstack/echo/v4"
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

		// Check if uid already exists
		var existingByuid models.Projects
		if tx.Where("ProjectID = ?", generatedId).First(&existingByuid).Error != nil {
			pid = generatedId
			break
		}
	}
	userData := c.Get("userData").(models.UserData)

	var existingProject models.Projects
	result := tx.Where("Name = ?", newProject.Name).First(&existingProject)

	if result.Error == nil {
		tx.Rollback()
		return c.JSON(http.StatusConflict, echo.Map{"error": "Project already exists"})
	}
	var isActiveStr string
	if newProject.IsActive {
		isActiveStr = "true"
	} else {
		isActiveStr = "false"
	}

	project := models.Projects{
		ProjectID: pid,
		Name:      newProject.Name,
		ShortDesc: newProject.ShortDesc,
		LongDesc:  newProject.LongDesc,
		IsActive:  isActiveStr,
		Uid:       userData.GetUID(),
	}
	if err := tx.Create(&project).Error; err != nil {
		tx.Rollback()
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

	// Find all active projects
	if err := config.DB.Where("is_active = ?", "true").Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch projects"})
	}

	var projectsWithUsers []ProjectWithUser

	// For each project, fetch the associated user
	for _, project := range projects {
		var user models.User
		if err := config.DB.Where("uid = ?", project.Uid).First(&user).Error; err != nil {
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

func EditProject(c echo.Context) error {
	projectID := c.Param("id")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Project ID is required"})
	}

	var updateData interfaces.UpdateProj
	if err := c.Bind(&updateData); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
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
	result := tx.Where("project_id = ? AND uid = ?", projectID, userData.GetUID()).First(&existingProject)
	if result.Error != nil {
		tx.Rollback()
		return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found or you don't have permission to edit it"})
	}

	// Prepare update data
	updates := make(map[string]interface{})

	if updateData.Name != nil {
		// Check if new name already exists for other projects
		var nameCheck models.Projects
		nameResult := tx.Where("name = ? AND project_id != ? AND uid = ?", *updateData.Name, projectID, userData.GetUID()).First(&nameCheck)
		if nameResult.Error == nil {
			tx.Rollback()
			return c.JSON(http.StatusConflict, echo.Map{"error": "Project with this name already exists"})
		}
		updates["name"] = *updateData.Name
	}

	if updateData.ShortDesc != nil {
		updates["short_desc"] = *updateData.ShortDesc
	}

	if updateData.LongDesc != nil {
		updates["long_desc"] = *updateData.LongDesc
	}

	if updateData.IsActive != nil {
		var isActiveStr string
		if *updateData.IsActive {
			isActiveStr = "true"
		} else {
			isActiveStr = "false"
		}
		updates["is_active"] = isActiveStr
	}

	// Perform the update
	if err := tx.Model(&existingProject).Updates(updates).Error; err != nil {
		tx.Rollback()
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to update project"})
	}

	if err := tx.Commit().Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to save changes"})
	}

	// Fetch the updated project
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

	// Fetch the associated user
	var user models.User
	if err := config.DB.Where("uid = ?", project.Uid).First(&user).Error; err != nil {
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
	result := tx.Where("project_id = ? AND uid = ?", projectID, userData.GetUID()).First(&existingProject)
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
	if err := config.DB.Where("uid = ?", userData.GetUID()).Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to fetch projects"})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"projects": projects,
		"count":    len(projects),
	})
}
