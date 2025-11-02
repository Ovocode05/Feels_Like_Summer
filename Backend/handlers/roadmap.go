package handlers

import (
	"backend/config"
	"backend/models"
	"backend/utils"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// SavePreferences saves or updates user research preferences
func SavePreferences(c echo.Context) error {
	// Get user data from context
	userData, ok := c.Get("userData").(*models.AuthenticatedUser)
	if !ok || userData == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}
	userID := userData.UID

	var req models.ResearchPreference
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body: " + err.Error()})
	}

	// Debug logging
	println("=== SavePreferences Debug ===")
	println("UserID:", userID)
	println("FieldOfStudy:", req.FieldOfStudy)
	println("ExperienceLevel:", req.ExperienceLevel)
	println("CurrentYear:", req.CurrentYear)
	println("Goals:", req.Goals)
	println("TimeCommitment:", req.TimeCommitment)
	println("InterestAreas:", req.InterestAreas)
	println("=============================")

	// Validate required fields
	if req.FieldOfStudy == "" || req.ExperienceLevel == "" || req.Goals == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing required fields: field_of_study, experience_level, and goals are required"})
	}

	req.UserID = userID

	// Check if preferences already exist
	var existing models.ResearchPreference
	result := config.DB.Where("user_id = ?", userID).First(&existing)

	if result.Error == nil {
		// Update existing preferences
		existing.FieldOfStudy = req.FieldOfStudy
		existing.ExperienceLevel = req.ExperienceLevel
		existing.CurrentYear = req.CurrentYear
		existing.Goals = req.Goals
		existing.TimeCommitment = req.TimeCommitment
		existing.InterestAreas = req.InterestAreas
		existing.PriorExperience = req.PriorExperience
		existing.PreferredFormat = req.PreferredFormat

		if err := config.DB.Save(&existing).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update preferences"})
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message":     "Preferences updated successfully",
			"preferences": existing,
		})
	}

	// Create new preferences
	if err := config.DB.Create(&req).Error; err != nil {
		println("ERROR creating preferences:", err.Error())
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save preferences: " + err.Error()})
	}

	println("✅ Successfully created preferences with ID:", req.ID)
	
	// Verify the preferences were actually saved
	var verify models.ResearchPreference
	if err := config.DB.Where("user_id = ?", userID).First(&verify).Error; err != nil {
		println("⚠️ WARNING: Could not verify saved preferences:", err.Error())
	} else {
		println("✅ Verified preferences exist in DB with ID:", verify.ID)
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message":     "Preferences saved successfully",
		"preferences": req,
	})
}

// GetPreferences retrieves user research preferences
func GetPreferences(c echo.Context) error {
	// Get user data from context
	userData, ok := c.Get("userData").(*models.AuthenticatedUser)
	if !ok || userData == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}
	userID := userData.UID

	var preferences models.ResearchPreference
	if err := config.DB.Where("user_id = ?", userID).First(&preferences).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Preferences not found"})
	}

	return c.JSON(http.StatusOK, preferences)
}

// GenerateRoadmap generates or retrieves a cached roadmap
func GenerateRoadmap(c echo.Context) error {
	// Get user data from context
	userData, ok := c.Get("userData").(*models.AuthenticatedUser)
	if !ok || userData == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}
	userID := userData.UID

	println("=== GenerateRoadmap Debug ===")
	println("UserID:", userID)

	// Get user preferences
	var preferences models.ResearchPreference
	if err := config.DB.Where("user_id = ?", userID).First(&preferences).Error; err != nil {
		println("ERROR: Preferences not found for user:", userID, "Error:", err.Error())
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Preferences not found. Please set your preferences first."})
	}

	println("✅ Found preferences with ID:", preferences.ID)
	println("FieldOfStudy:", preferences.FieldOfStudy)
	println("=============================")

	// Generate hash from preferences
	preferenceHash := generatePreferenceHash(preferences)

	// Check if roadmap exists in cache
	var cachedRoadmap models.RoadmapCache
	cacheResult := config.DB.Where("preference_hash = ?", preferenceHash).First(&cachedRoadmap)

	if cacheResult.Error == nil {
		// Found cached roadmap, increment usage count
		config.DB.Model(&cachedRoadmap).Update("usage_count", cachedRoadmap.UsageCount+1)

		// Create a user-specific roadmap entry
		roadmap := models.Roadmap{
			UserID:         userID,
			PreferenceHash: preferenceHash,
			Title:          extractTitleFromRoadmap(cachedRoadmap.RoadmapData),
			RoadmapData:    cachedRoadmap.RoadmapData,
			GeneratedBy:    "gemini-cached",
		}
		config.DB.Create(&roadmap)

		return c.JSON(http.StatusOK, map[string]interface{}{
			"message":   "Roadmap retrieved from cache",
			"roadmap":   json.RawMessage(cachedRoadmap.RoadmapData),
			"cached":    true,
			"roadmapId": roadmap.ID,
		})
	}

	// Generate new roadmap using Gemini
	println("Calling Gemini API to generate roadmap...")
	roadmapJSON, err := utils.GenerateRoadmap(
		preferences.FieldOfStudy,
		preferences.ExperienceLevel,
		preferences.Goals,
		preferences.InterestAreas,
		preferences.TimeCommitment,
	)
	if err != nil {
		println("ERROR from Gemini:", err.Error())
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate roadmap: " + err.Error()})
	}

	println("✅ Received response from Gemini, length:", len(roadmapJSON))

	// Clean up the JSON response (remove markdown code blocks if present)
	roadmapJSON = strings.TrimPrefix(roadmapJSON, "```json\n")
	roadmapJSON = strings.TrimPrefix(roadmapJSON, "```json")
	roadmapJSON = strings.TrimPrefix(roadmapJSON, "```\n")
	roadmapJSON = strings.TrimPrefix(roadmapJSON, "```")
	roadmapJSON = strings.TrimSuffix(roadmapJSON, "\n```")
	roadmapJSON = strings.TrimSuffix(roadmapJSON, "```")
	roadmapJSON = strings.TrimSpace(roadmapJSON)

	// Validate JSON
	var validateJSON map[string]interface{}
	if err := json.Unmarshal([]byte(roadmapJSON), &validateJSON); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Invalid JSON from Gemini"})
	}

	// Cache the roadmap
	cache := models.RoadmapCache{
		PreferenceHash:  preferenceHash,
		FieldOfStudy:    preferences.FieldOfStudy,
		ExperienceLevel: preferences.ExperienceLevel,
		RoadmapData:     roadmapJSON,
		UsageCount:      1,
	}
	config.DB.Create(&cache)

	// Create user-specific roadmap entry
	roadmap := models.Roadmap{
		UserID:         userID,
		PreferenceHash: preferenceHash,
		Title:          extractTitleFromRoadmap(roadmapJSON),
		RoadmapData:    roadmapJSON,
		GeneratedBy:    "gemini",
	}
	config.DB.Create(&roadmap)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":   "Roadmap generated successfully",
		"roadmap":   json.RawMessage(roadmapJSON),
		"cached":    false,
		"roadmapId": roadmap.ID,
	})
}

// GetUserRoadmaps retrieves all roadmaps for a user
func GetUserRoadmaps(c echo.Context) error {
	// Get user data from context
	userData, ok := c.Get("userData").(*models.AuthenticatedUser)
	if !ok || userData == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}
	userID := userData.UID

	var roadmaps []models.Roadmap
	if err := config.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&roadmaps).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve roadmaps"})
	}

	return c.JSON(http.StatusOK, roadmaps)
}

// generatePreferenceHash creates a hash from key preference fields for caching
func generatePreferenceHash(prefs models.ResearchPreference) string {
	// Normalize and combine key fields
	data := strings.ToLower(strings.TrimSpace(prefs.FieldOfStudy)) + "|" +
		strings.ToLower(strings.TrimSpace(prefs.ExperienceLevel)) + "|" +
		strings.ToLower(strings.TrimSpace(prefs.Goals)) + "|" +
		strings.ToLower(strings.TrimSpace(prefs.InterestAreas))

	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

// extractTitleFromRoadmap extracts the title from roadmap JSON
func extractTitleFromRoadmap(roadmapJSON string) string {
	var roadmap struct {
		Title string `json:"title"`
	}
	if err := json.Unmarshal([]byte(roadmapJSON), &roadmap); err != nil {
		return "Research Roadmap"
	}
	return roadmap.Title
}
