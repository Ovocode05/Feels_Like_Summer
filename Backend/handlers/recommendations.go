package handlers

import (
	"backend/config"
	"backend/models"
	"math"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// RecommendedProject represents a project with its match score
type RecommendedProject struct {
	models.Projects
	User         models.User `json:"user"`
	MatchScore   float64     `json:"match_score"`
	MatchReasons []string    `json:"match_reasons"`
}

// GetRecommendedProjects returns personalized project recommendations for a student
func GetRecommendedProjects(c echo.Context) error {
	// Get authenticated user from context
	userDataInterface := c.Get("userData")
	if userDataInterface == nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"error": "User not authenticated",
		})
	}

	userData := userDataInterface.(*models.AuthenticatedUser)

	// Ensure user is a student
	if userData.Type != "stu" {
		return c.JSON(http.StatusForbidden, echo.Map{
			"error": "Only students can get recommendations",
		})
	}

	// Get student profile
	var student models.Students
	if err := config.DB.Where("uid = ?", userData.UID).First(&student).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": "Student profile not found. Please complete your profile first.",
		})
	}

	// Get research preferences if they exist
	var preferences models.ResearchPreference
	hasPreferences := config.DB.Where("user_id = ?", userData.UID).First(&preferences).Error == nil

	// Get all active projects
	var projects []models.Projects
	if err := config.DB.Where("is_active = ?", true).Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch projects",
		})
	}

	// Get student's applications to filter out already applied projects
	var applications []models.ProjRequests
	config.DB.Where("uid = ?", userData.UID).Find(&applications)
	appliedProjects := make(map[string]bool)
	for _, app := range applications {
		appliedProjects[app.PID] = true
	}

	// Calculate match scores for each project
	var recommendations []RecommendedProject
	for _, project := range projects {
		// Skip if already applied
		if appliedProjects[project.ProjectID] {
			continue
		}

		// Skip if it's the student's own project (shouldn't happen but safety check)
		if project.CreatorID == userData.UID {
			continue
		}

		matchScore, reasons := calculateMatchScore(student, project, hasPreferences, preferences)

		// Only include projects with a minimum match score
		if matchScore >= 40.0 {
			// Get professor info
			var user models.User
			if err := config.DB.Where("uid = ?", project.CreatorID).First(&user).Error; err != nil {
				continue // Skip if user not found
			}

			recommendations = append(recommendations, RecommendedProject{
				Projects:     project,
				User:         user,
				MatchScore:   matchScore,
				MatchReasons: reasons,
			})
		}
	}

	// Sort recommendations by match score (highest first)
	for i := 0; i < len(recommendations); i++ {
		for j := i + 1; j < len(recommendations); j++ {
			if recommendations[j].MatchScore > recommendations[i].MatchScore {
				recommendations[i], recommendations[j] = recommendations[j], recommendations[i]
			}
		}
	}

	// Limit to top 10 recommendations
	if len(recommendations) > 10 {
		recommendations = recommendations[:10]
	}

	return c.JSON(http.StatusOK, echo.Map{
		"recommendations": recommendations,
		"count":           len(recommendations),
	})
}

// calculateMatchScore calculates how well a project matches a student's profile
func calculateMatchScore(student models.Students, project models.Projects, hasPreferences bool, preferences models.ResearchPreference) (float64, []string) {
	var score float64
	var reasons []string

	// Weight distribution:
	// Research Interest: 30%
	// Skills: 25%
	// Field of Study: 20%
	// Preferences: 15%
	// Tags: 10%

	// 1. Research Interest Match (30 points)
	if student.ResearchInterest != "" {
		researchScore := calculateTextSimilarity(student.ResearchInterest, project.LDesc, project.SDesc)
		if researchScore > 0.7 {
			score += 30.0
			reasons = append(reasons, "Strong research interest alignment")
		} else if researchScore > 0.4 {
			score += 20.0
			reasons = append(reasons, "Moderate research interest match")
		} else if researchScore > 0.2 {
			score += 10.0
			reasons = append(reasons, "Some research interest overlap")
		}
	}

	// 2. Skills Match (25 points)
	if len(student.Skills) > 0 {
		matchingSkills := 0
		for _, skill := range student.Skills {
			for _, tag := range project.Tags {
				if strings.Contains(strings.ToLower(tag), strings.ToLower(skill)) ||
					strings.Contains(strings.ToLower(skill), strings.ToLower(tag)) {
					matchingSkills++
					break
				}
			}
			// Also check in project description
			if strings.Contains(strings.ToLower(project.LDesc), strings.ToLower(skill)) {
				matchingSkills++
			}
		}

		if matchingSkills > 0 {
			skillScore := math.Min(25.0, float64(matchingSkills)*5.0)
			score += skillScore
			if matchingSkills >= 3 {
				reasons = append(reasons, "Multiple matching skills")
			} else {
				reasons = append(reasons, "Relevant skills match")
			}
		}
	}

	// 3. Field of Study Match (20 points)
	if hasPreferences && preferences.FieldOfStudy != "" && project.FieldOfStudy != "" {
		if strings.EqualFold(preferences.FieldOfStudy, project.FieldOfStudy) {
			score += 20.0
			reasons = append(reasons, "Matches your field of study")
		} else if strings.Contains(strings.ToLower(project.FieldOfStudy), strings.ToLower(preferences.FieldOfStudy)) ||
			strings.Contains(strings.ToLower(preferences.FieldOfStudy), strings.ToLower(project.FieldOfStudy)) {
			score += 10.0
			reasons = append(reasons, "Related field of study")
		}
	}

	// 4. Preferences Match (15 points)
	if hasPreferences {
		preferencesScore := 0.0

		// Check interest areas
		if preferences.InterestAreas != "" {
			interestScore := calculateTextSimilarity(preferences.InterestAreas, project.LDesc, project.SDesc)
			if interestScore > 0.5 {
				preferencesScore += 8.0
			} else if interestScore > 0.3 {
				preferencesScore += 5.0
			}
		}

		// Check experience level match
		if preferences.ExperienceLevel != "" {
			// Match beginner with shorter projects, advanced with longer ones
			if strings.Contains(strings.ToLower(preferences.ExperienceLevel), "beginner") {
				if project.Duration != "" && (strings.Contains(strings.ToLower(project.Duration), "short") ||
					strings.Contains(strings.ToLower(project.Duration), "3") ||
					strings.Contains(strings.ToLower(project.Duration), "6")) {
					preferencesScore += 4.0
				}
			} else if strings.Contains(strings.ToLower(preferences.ExperienceLevel), "advanced") {
				if project.Duration != "" && (strings.Contains(strings.ToLower(project.Duration), "long") ||
					strings.Contains(strings.ToLower(project.Duration), "12")) {
					preferencesScore += 4.0
				}
			} else {
				preferencesScore += 3.0
			}
		}

		// Check goals alignment
		if preferences.Goals != "" {
			goalScore := calculateTextSimilarity(preferences.Goals, project.LDesc, project.SDesc)
			if goalScore > 0.4 {
				preferencesScore += 3.0
			}
		}

		score += preferencesScore
		if preferencesScore >= 10.0 {
			reasons = append(reasons, "Aligns with your learning preferences")
		}
	}

	// 5. Tags Match (10 points)
	if len(project.Tags) > 0 {
		// Check if tags match research interest or intention
		tagScore := 0.0
		for _, tag := range project.Tags {
			tagLower := strings.ToLower(tag)
			if strings.Contains(strings.ToLower(student.ResearchInterest), tagLower) ||
				strings.Contains(strings.ToLower(student.Intention), tagLower) {
				tagScore += 2.0
			}
		}
		tagScore = math.Min(10.0, tagScore)
		score += tagScore
	}

	// Bonus: Prior experience in similar projects (5 points)
	if len(student.Projects) > 0 {
		for _, proj := range student.Projects {
			if calculateTextSimilarity(proj, project.SDesc, project.LDesc) > 0.3 {
				score += 5.0
				reasons = append(reasons, "Similar to your past projects")
				break
			}
		}
	}

	// Normalize score to 0-100
	if score > 100 {
		score = 100
	}

	// Round to 1 decimal place
	score = math.Round(score*10) / 10

	// If no specific reasons were found but score is decent, add a generic reason
	if len(reasons) == 0 && score >= 40 {
		reasons = append(reasons, "Good overall match for your profile")
	}

	return score, reasons
}

// calculateTextSimilarity calculates similarity between texts based on word overlap
func calculateTextSimilarity(text1 string, texts ...string) float64 {
	if text1 == "" {
		return 0.0
	}

	// Tokenize text1
	words1 := tokenize(text1)
	if len(words1) == 0 {
		return 0.0
	}

	// Combine all comparison texts
	combinedText := strings.Join(texts, " ")
	words2 := tokenize(combinedText)
	if len(words2) == 0 {
		return 0.0
	}

	// Count matching words
	matches := 0
	for _, word1 := range words1 {
		if len(word1) < 4 { // Skip short words
			continue
		}
		for _, word2 := range words2 {
			if word1 == word2 {
				matches++
				break
			}
		}
	}

	// Calculate similarity ratio
	similarity := float64(matches) / float64(len(words1))
	return similarity
}

// tokenize splits text into lowercase words
func tokenize(text string) []string {
	// Convert to lowercase and split by spaces/punctuation
	text = strings.ToLower(text)
	text = strings.ReplaceAll(text, ",", " ")
	text = strings.ReplaceAll(text, ".", " ")
	text = strings.ReplaceAll(text, ";", " ")
	text = strings.ReplaceAll(text, ":", " ")
	text = strings.ReplaceAll(text, "!", " ")
	text = strings.ReplaceAll(text, "?", " ")
	text = strings.ReplaceAll(text, "(", " ")
	text = strings.ReplaceAll(text, ")", " ")
	text = strings.ReplaceAll(text, "[", " ")
	text = strings.ReplaceAll(text, "]", " ")

	words := strings.Fields(text)

	// Filter out common stop words
	stopWords := map[string]bool{
		"the": true, "a": true, "an": true, "and": true, "or": true,
		"but": true, "in": true, "on": true, "at": true, "to": true,
		"for": true, "of": true, "with": true, "by": true, "from": true,
		"is": true, "are": true, "was": true, "were": true, "be": true,
		"been": true, "being": true, "have": true, "has": true, "had": true,
		"do": true, "does": true, "did": true, "will": true, "would": true,
		"could": true, "should": true, "may": true, "might": true, "must": true,
		"can": true, "this": true, "that": true, "these": true, "those": true,
	}

	var filtered []string
	for _, word := range words {
		if !stopWords[word] && len(word) > 2 {
			filtered = append(filtered, word)
		}
	}

	return filtered
}
