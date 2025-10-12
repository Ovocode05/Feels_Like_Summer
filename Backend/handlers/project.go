package handlers

import (
	"backend/config"
	"backend/interfaces"
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lib/pq"
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
    result := tx.Where("name = ?", newProject.Name).First(&existingProject)

    if result.Error == nil {
        tx.Rollback()
        return c.JSON(http.StatusConflict, echo.Map{"error": "Project already exists"})
    }

// ...
project := models.Projects{
    ProjectID:    pid,
    Name:         newProject.Name,
    SDesc:        newProject.Sdesc,
    LDesc:        newProject.Ldesc,
    IsActive:     newProject.IsActive,
    Uid:          userData.GetUID(),
    Tags:         pq.StringArray(newProject.Tags),
    WorkingUsers: pq.StringArray{}, // or pq.StringArray(newProject.WorkingUsers)
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

    // Fetch all projects (remove the active filter)
    if err := config.DB.Find(&projects).Error; err != nil {
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

    userData := c.Get("userData").(models.UserData)

    tx := config.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    var existingProject models.Projects
    result := tx.Where("project_id = ? AND uid = ?", projectID, userData.GetUID()).First(&existingProject)
    if result.Error != nil {
        tx.Rollback()
        return c.JSON(http.StatusNotFound, echo.Map{"error": "Project not found or you don't have permission to edit it"})
    }

    updates := make(map[string]interface{})

    if updateData.Name != nil {
        var nameCheck models.Projects
        nameResult := tx.Where("name = ? AND project_id != ? AND uid = ?", *updateData.Name, projectID, userData.GetUID()).First(&nameCheck)
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

    if err := tx.Model(&existingProject).Updates(updates).Error; err != nil {
        tx.Rollback()
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
