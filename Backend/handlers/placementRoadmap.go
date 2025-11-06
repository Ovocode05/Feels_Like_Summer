package handlers

import (
	"backend/config"
	"backend/models"
	"backend/utils"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// SavePlacementPreferences saves or updates user placement prep preferences
func SavePlacementPreferences(c echo.Context) error {
	userData, ok := c.Get("userData").(*models.AuthenticatedUser)
	if !ok || userData == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}
	userID := userData.UID

	var req models.PlacementPreference
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body: " + err.Error()})
	}

	// Debug logging
	println("=== SavePlacementPreferences Debug ===")
	println("UserID:", userID)
	println("TimelineWeeks:", req.TimelineWeeks)
	println("TimeCommitment:", req.TimeCommitment)
	println("IntensityType:", req.IntensityType)
	println("PrepAreas:", req.PrepAreas)
	println("=============================")

	// Validate required fields
	if req.TimelineWeeks == 0 || req.IntensityType == "" || req.PrepAreas == "" || req.Goals == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing required fields: timeline_weeks, intensity_type, prep_areas, and goals are required"})
	}

	req.UserID = userID

	// Check if preferences already exist
	var existing models.PlacementPreference
	result := config.DB.Where("user_id = ?", userID).First(&existing)

	if result.Error == nil {
		// Update existing preferences
		existing.TimelineWeeks = req.TimelineWeeks
		existing.TimeCommitment = req.TimeCommitment
		existing.IntensityType = req.IntensityType
		existing.PrepAreas = req.PrepAreas
		existing.CurrentLevels = req.CurrentLevels
		existing.ResourcesStarted = req.ResourcesStarted
		existing.TargetCompanies = req.TargetCompanies
		existing.SpecialNeeds = req.SpecialNeeds
		existing.Goals = req.Goals

		if err := config.DB.Save(&existing).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update preferences"})
		}
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message":     "Placement preferences updated successfully",
			"preferences": existing,
		})
	}

	// Create new preferences
	if err := config.DB.Create(&req).Error; err != nil {
		println("ERROR creating placement preferences:", err.Error())
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to save preferences: " + err.Error()})
	}

	println("✅ Successfully created placement preferences with ID:", req.ID)

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"message":     "Placement preferences saved successfully",
		"preferences": req,
	})
}

// GetPlacementPreferences retrieves user placement prep preferences
func GetPlacementPreferences(c echo.Context) error {
	userData, ok := c.Get("userData").(*models.AuthenticatedUser)
	if !ok || userData == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}
	userID := userData.UID

	var preferences models.PlacementPreference
	if err := config.DB.Where("user_id = ?", userID).First(&preferences).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Placement preferences not found"})
	}

	return c.JSON(http.StatusOK, preferences)
}

// GeneratePlacementRoadmap generates or retrieves a cached placement roadmap
func GeneratePlacementRoadmap(c echo.Context) error {
	userData, ok := c.Get("userData").(*models.AuthenticatedUser)
	if !ok || userData == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}
	userID := userData.UID

	// Check rate limiting to prevent spam
	rateLimiter := utils.GetRoadmapRateLimiter()
	if allowed, secondsLeft := rateLimiter.AllowRequest(userID, "placement"); !allowed {
		println("⚠️ Rate limit exceeded for user:", userID, "- seconds left:", secondsLeft)
		return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
			"error":       "Please wait before generating another roadmap",
			"retry_after": secondsLeft,
			"message":     fmt.Sprintf("Please wait %d seconds before requesting another roadmap", secondsLeft),
		})
	}

	println("=== GeneratePlacementRoadmap Debug ===")
	println("UserID:", userID)

	// Get user preferences
	var preferences models.PlacementPreference
	if err := config.DB.Where("user_id = ?", userID).First(&preferences).Error; err != nil {
		println("ERROR: Placement preferences not found for user:", userID)
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Placement preferences not found. Please set your preferences first."})
	}

	println("✅ Found placement preferences with ID:", preferences.ID)

	// Generate hash from preferences
	preferenceHash := generatePlacementPreferenceHash(preferences)
	println("Generated hash:", preferenceHash)

	// First, check if user already has a roadmap with this hash
	var existingUserRoadmap models.Roadmap
	userRoadmapResult := config.DB.Where("user_id = ? AND preference_hash = ? AND roadmap_type = ?", userID, preferenceHash, "placement").
		Order("created_at desc").
		First(&existingUserRoadmap)

	if userRoadmapResult.Error == nil {
		println("✅ Found existing user placement roadmap, returning it")
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message":   "Placement roadmap retrieved from your history",
			"roadmap":   json.RawMessage(existingUserRoadmap.RoadmapData),
			"cached":    true,
			"roadmapId": existingUserRoadmap.ID,
		})
	}

	// Check if roadmap exists in cache
	var cachedRoadmap models.RoadmapCache
	cacheResult := config.DB.Where("preference_hash = ? AND roadmap_type = ?", preferenceHash, "placement").First(&cachedRoadmap)

	if cacheResult.Error == nil {
		println("✅ Found cached placement roadmap, creating user copy")
		// Found cached roadmap
		config.DB.Model(&cachedRoadmap).Update("usage_count", cachedRoadmap.UsageCount+1)

		roadmap := models.Roadmap{
			UserID:         userID,
			RoadmapType:    "placement",
			PreferenceHash: preferenceHash,
			Title:          extractTitleFromRoadmap(cachedRoadmap.RoadmapData),
			RoadmapData:    cachedRoadmap.RoadmapData,
			GeneratedBy:    "gemini-cached",
		}
		config.DB.Create(&roadmap)

		return c.JSON(http.StatusOK, map[string]interface{}{
			"message":   "Placement roadmap retrieved from cache",
			"roadmap":   json.RawMessage(cachedRoadmap.RoadmapData),
			"cached":    true,
			"roadmapId": roadmap.ID,
		})
	}

	// Generate new roadmap using Gemini with deduplication
	// This prevents multiple simultaneous API calls for the same preferences
	println("⚡ Calling Gemini API to generate NEW placement roadmap (with deduplication)...")
	roadmapJSON, err := utils.GeneratePlacementRoadmapWithDeduplication(preferenceHash, func() (string, error) {
		return utils.GeneratePlacementRoadmap(
			preferences.TimelineWeeks,
			preferences.TimeCommitment,
			preferences.IntensityType,
			preferences.PrepAreas,
			preferences.CurrentLevels,
			preferences.ResourcesStarted,
			preferences.TargetCompanies,
			preferences.Goals,
		)
	})
	if err != nil {
		println("ERROR from Gemini:", err.Error())
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate placement roadmap: " + err.Error()})
	}

	println("✅ Received response from Gemini, length:", len(roadmapJSON))

	// Check if this roadmap was generated by another concurrent request
	// and is now in cache (deduplication worked)
	var newCachedRoadmap models.RoadmapCache
	if cacheCheckErr := config.DB.Where("preference_hash = ? AND roadmap_type = ?", preferenceHash, "placement").First(&newCachedRoadmap).Error; cacheCheckErr == nil {
		println("✅ Found newly cached placement roadmap from concurrent request, using it")
		// Another concurrent request already cached this, use it instead
		config.DB.Model(&newCachedRoadmap).Update("usage_count", newCachedRoadmap.UsageCount+1)

		roadmap := models.Roadmap{
			UserID:         userID,
			RoadmapType:    "placement",
			PreferenceHash: preferenceHash,
			Title:          extractTitleFromRoadmap(newCachedRoadmap.RoadmapData),
			RoadmapData:    newCachedRoadmap.RoadmapData,
			GeneratedBy:    "gemini-dedup-cached",
		}
		config.DB.Create(&roadmap)

		return c.JSON(http.StatusOK, map[string]interface{}{
			"message":   "Placement roadmap generated successfully",
			"roadmap":   json.RawMessage(newCachedRoadmap.RoadmapData),
			"cached":    false,
			"roadmapId": roadmap.ID,
		})
	}

	// Clean up the JSON response
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
		RoadmapType:     "placement",
		PreferenceHash:  preferenceHash,
		FieldOfStudy:    preferences.PrepAreas, // Store prep areas in this field
		ExperienceLevel: preferences.IntensityType,
		RoadmapData:     roadmapJSON,
		UsageCount:      1,
	}
	config.DB.Create(&cache)

	// Create user-specific roadmap entry
	roadmap := models.Roadmap{
		UserID:         userID,
		RoadmapType:    "placement",
		PreferenceHash: preferenceHash,
		Title:          extractTitleFromRoadmap(roadmapJSON),
		RoadmapData:    roadmapJSON,
		GeneratedBy:    "gemini",
	}
	config.DB.Create(&roadmap)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":   "Placement roadmap generated successfully",
		"roadmap":   json.RawMessage(roadmapJSON),
		"cached":    false,
		"roadmapId": roadmap.ID,
	})
}

// generatePlacementPreferenceHash creates a hash from key preference fields for caching
func generatePlacementPreferenceHash(prefs models.PlacementPreference) string {
	data := fmt.Sprintf("%d|%d|%s|%s|%s",
		prefs.TimelineWeeks,
		prefs.TimeCommitment,
		strings.ToLower(strings.TrimSpace(prefs.IntensityType)),
		strings.ToLower(strings.TrimSpace(prefs.PrepAreas)),
		strings.ToLower(strings.TrimSpace(prefs.CurrentLevels)))

	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}
