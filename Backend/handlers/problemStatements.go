package handlers

import (
	"backend/config"
	"backend/models"
	"backend/utils"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// CreateProblemStatement creates a new problem statement
func CreateProblemStatement(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Parse request body
	var request struct {
		PSTitle      string `json:"shortDesc" validate:"required"`
		PSLongDesc   string `json:"longDesc" validate:"required"`
		Theme        string `json:"theme" validate:"required"`
		Category     string `json:"category" validate:"required"`
		Organization string `json:"organization"`
	}

	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if request.PSTitle == "" || request.PSLongDesc == "" || request.Theme == "" || request.Category == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Title, description, theme, and category are required",
		})
	}

	// Generate unique PSID
	psid, err := utils.GeneratePSID()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to generate problem statement ID",
		})
	}

	// Check if problem statement with same title already exists
	var existingPS models.ProblemStatements
	result := config.DB.Where("ps_title = ? AND uploaded_by = ?", request.PSTitle, userData.UID).First(&existingPS)
	if result.Error == nil {
		return c.JSON(http.StatusConflict, echo.Map{
			"error": "Problem statement with this title already exists",
		})
	}

	// Create new problem statement
	problemStatement := models.ProblemStatements{
		PSID:         psid,
		PSTitle:      request.PSTitle,
		PSLongDesc:   request.PSLongDesc,
		Theme:        request.Theme,
		Category:     request.Category,
		UploadedBy:   userData.UID,
		Organization: request.Organization,
	}

	if err := config.DB.Create(&problemStatement).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to create problem statement",
		})
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"message":          "Problem statement created successfully",
		"problemStatement": problemStatement,
	})
}

// ListProblemStatements returns all problem statements with summary information only
func ListProblemStatements(c echo.Context) error {
	// Define a summary struct that excludes the full description
	type ProblemStatementSummary struct {
		ID           uint   `json:"id"`
		PSID         string `json:"psid"`
		PSTitle      string `json:"shortDesc"`
		Theme        string `json:"theme"`
		Category     string `json:"category"`
		Organization string `json:"organization"`
		CreatedAt    string `json:"createdAt"`
	}

	var problemStatements []models.ProblemStatements
	if err := config.DB.Find(&problemStatements).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch problem statements",
		})
	}

	// Convert to summary format
	var summaries []ProblemStatementSummary
	for _, ps := range problemStatements {
		summary := ProblemStatementSummary{
			ID:           ps.ID,
			PSID:         ps.PSID,
			PSTitle:      ps.PSTitle,
			Theme:        ps.Theme,
			Category:     ps.Category,
			Organization: ps.Organization,
			CreatedAt:    ps.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}
		summaries = append(summaries, summary)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"problemStatements": summaries,
		"count":             len(summaries),
	})
}

// GetProblemStatement returns full details of a specific problem statement
func GetProblemStatement(c echo.Context) error {
	psidOrID := c.Param("id")
	if psidOrID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Problem statement ID is required",
		})
	}

	var problemStatement models.ProblemStatements
	var err error

	// Try to find by PSID first, then by ID
	err = config.DB.Where("psid = ?", psidOrID).First(&problemStatement).Error
	if err == gorm.ErrRecordNotFound {
		// Try by numeric ID
		if id, parseErr := strconv.ParseUint(psidOrID, 10, 32); parseErr == nil {
			err = config.DB.First(&problemStatement, uint(id)).Error
		}
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, echo.Map{
				"error": "Problem statement not found",
			})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch problem statement",
		})
	}

	// Get uploader information
	var uploader models.User
	if err := config.DB.Where("uid = ?", problemStatement.UploadedBy).First(&uploader).Error; err == nil {
		// Include uploader info in response
		response := echo.Map{
			"id":           problemStatement.ID,
			"psid":         problemStatement.PSID,
			"shortDesc":    problemStatement.PSTitle,
			"longDesc":     problemStatement.PSLongDesc,
			"theme":        problemStatement.Theme,
			"category":     problemStatement.Category,
			"organization": problemStatement.Organization,
			"createdAt":    problemStatement.CreatedAt.Format("2006-01-02T15:04:05Z"),
			"updatedAt":    problemStatement.UpdatedAt.Format("2006-01-02T15:04:05Z"),
			"uploader": echo.Map{
				"name":  uploader.Name,
				"email": uploader.Email,
				"type":  uploader.Type,
			},
		}
		return c.JSON(http.StatusOK, response)
	}

	// If uploader not found, return without uploader info
	response := echo.Map{
		"id":           problemStatement.ID,
		"psid":         problemStatement.PSID,
		"shortDesc":    problemStatement.PSTitle,
		"longDesc":     problemStatement.PSLongDesc,
		"theme":        problemStatement.Theme,
		"category":     problemStatement.Category,
		"organization": problemStatement.Organization,
		"createdAt":    problemStatement.CreatedAt.Format("2006-01-02T15:04:05Z"),
		"updatedAt":    problemStatement.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}

	return c.JSON(http.StatusOK, response)
}

// GetMyProblemStatements returns all problem statements created by the authenticated user
func GetMyProblemStatements(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	var problemStatements []models.ProblemStatements
	if err := config.DB.Where("uploaded_by = ?", userData.UID).Find(&problemStatements).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch problem statements",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"problemStatements": problemStatements,
		"count":             len(problemStatements),
	})
}

// UpdateProblemStatement updates an existing problem statement
func UpdateProblemStatement(c echo.Context) error {
	psidOrID := c.Param("id")
	if psidOrID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Problem statement ID is required",
		})
	}

	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Find the problem statement
	var problemStatement models.ProblemStatements
	var err error

	// Try to find by PSID first, then by ID
	err = config.DB.Where("psid = ?", psidOrID).First(&problemStatement).Error
	if err == gorm.ErrRecordNotFound {
		// Try by numeric ID
		if id, parseErr := strconv.ParseUint(psidOrID, 10, 32); parseErr == nil {
			err = config.DB.First(&problemStatement, uint(id)).Error
		}
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, echo.Map{
				"error": "Problem statement not found",
			})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch problem statement",
		})
	}

	// Check if user owns this problem statement
	if problemStatement.UploadedBy != userData.UID {
		return c.JSON(http.StatusForbidden, echo.Map{
			"error": "You can only update your own problem statements",
		})
	}

	// Parse request body
	var request struct {
		PSTitle      string `json:"shortDesc"`
		PSLongDesc   string `json:"longDesc"`
		Theme        string `json:"theme"`
		Category     string `json:"category"`
		Organization string `json:"organization"`
	}

	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Invalid request body",
		})
	}

	// Update fields if provided
	if request.PSTitle != "" {
		problemStatement.PSTitle = request.PSTitle
	}
	if request.PSLongDesc != "" {
		problemStatement.PSLongDesc = request.PSLongDesc
	}
	if request.Theme != "" {
		problemStatement.Theme = request.Theme
	}
	if request.Category != "" {
		problemStatement.Category = request.Category
	}
	if request.Organization != "" {
		problemStatement.Organization = request.Organization
	}

	if err := config.DB.Save(&problemStatement).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to update problem statement",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message":          "Problem statement updated successfully",
		"problemStatement": problemStatement,
	})
}

// DeleteProblemStatement deletes a problem statement
func DeleteProblemStatement(c echo.Context) error {
	psidOrID := c.Param("id")
	if psidOrID == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Problem statement ID is required",
		})
	}

	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Find the problem statement
	var problemStatement models.ProblemStatements
	var err error

	// Try to find by PSID first, then by ID
	err = config.DB.Where("psid = ?", psidOrID).First(&problemStatement).Error
	if err == gorm.ErrRecordNotFound {
		// Try by numeric ID
		if id, parseErr := strconv.ParseUint(psidOrID, 10, 32); parseErr == nil {
			err = config.DB.First(&problemStatement, uint(id)).Error
		}
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(http.StatusNotFound, echo.Map{
				"error": "Problem statement not found",
			})
		}
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch problem statement",
		})
	}

	// Check if user owns this problem statement or is faculty (faculty can delete any)
	if problemStatement.UploadedBy != userData.UID && userData.Type != "fac" {
		return c.JSON(http.StatusForbidden, echo.Map{
			"error": "You can only delete your own problem statements",
		})
	}

	if err := config.DB.Delete(&problemStatement).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to delete problem statement",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Problem statement deleted successfully",
		"psid":    problemStatement.PSID,
	})
}

// GetProblemStatementsByCategory returns problem statements filtered by category
func GetProblemStatementsByCategory(c echo.Context) error {
	category := c.QueryParam("category")
	if category == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Category parameter is required",
		})
	}

	// Define a summary struct that excludes the full description
	type ProblemStatementSummary struct {
		ID           uint   `json:"id"`
		PSID         string `json:"psid"`
		PSTitle      string `json:"shortDesc"`
		Theme        string `json:"theme"`
		Category     string `json:"category"`
		Organization string `json:"organization"`
		CreatedAt    string `json:"createdAt"`
	}

	var problemStatements []models.ProblemStatements
	if err := config.DB.Where("category ILIKE ?", "%"+category+"%").Find(&problemStatements).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch problem statements",
		})
	}

	// Convert to summary format
	var summaries []ProblemStatementSummary
	for _, ps := range problemStatements {
		summary := ProblemStatementSummary{
			ID:           ps.ID,
			PSID:         ps.PSID,
			PSTitle:      ps.PSTitle,
			Theme:        ps.Theme,
			Category:     ps.Category,
			Organization: ps.Organization,
			CreatedAt:    ps.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}
		summaries = append(summaries, summary)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"problemStatements": summaries,
		"category":          category,
		"count":             len(summaries),
	})
}
