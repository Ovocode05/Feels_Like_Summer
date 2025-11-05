package handlers

import (
	"backend/config"
	"backend/models"
	"math"
	"net/http"
	"strings"
	"time"

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

	// Get all active projects that are NOT created by the student
	var projects []models.Projects
	if err := config.DB.Where("is_active = ? AND creator_id != ?", true, userData.UID).Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch projects",
		})
	}

	// Get ALL of student's applications (all statuses) to filter out
	var applications []models.ProjRequests
	config.DB.Select("p_id").Where("uid = ?", userData.UID).Find(&applications)
	appliedProjects := make(map[string]bool, len(applications))
	for _, app := range applications {
		appliedProjects[app.PID] = true
	}

	// Get recent applications (past 3 months) for similarity matching
	// Only fetch applications that haven't been rejected/accepted for pattern analysis
	threeMonthsAgo := time.Now().AddDate(0, -3, 0)
	var recentApplications []models.ProjRequests
	config.DB.Where("uid = ? AND time_created >= ?", userData.UID, threeMonthsAgo).Find(&recentApplications)

	// Fetch the actual projects the student applied to recently
	var recentAppliedProjects []models.Projects
	recentPIDs := make([]string, 0, len(recentApplications))
	for _, app := range recentApplications {
		recentPIDs = append(recentPIDs, app.PID)
	}
	if len(recentPIDs) > 0 {
		config.DB.Where("project_id IN ?", recentPIDs).Find(&recentAppliedProjects)
	}

	// Calculate match scores for each project
	var recommendations []RecommendedProject
	currentTime := time.Now()

	for _, project := range projects {
		// Skip if already applied (regardless of status - accepted, rejected, interview, etc.)
		if appliedProjects[project.ProjectID] {
			continue
		}

		// Skip projects with past deadlines
		if project.Deadline != nil && *project.Deadline != "" {
			// Try to parse the deadline - assuming format like "2024-12-31" or similar
			deadline, err := time.Parse("2006-01-02", *project.Deadline)
			if err == nil && deadline.Before(currentTime) {
				continue // Skip projects with expired deadlines
			}
			// If we can't parse it, try other common formats
			if err != nil {
				deadline, err = time.Parse("02/01/2006", *project.Deadline)
				if err == nil && deadline.Before(currentTime) {
					continue
				}
			}
			if err != nil {
				deadline, err = time.Parse("01-02-2006", *project.Deadline)
				if err == nil && deadline.Before(currentTime) {
					continue
				}
			}
		}

		matchScore, reasons := calculateMatchScore(student, project, hasPreferences, preferences, recentAppliedProjects)

		// Only include projects with a minimum match score (lowered threshold for better recall)
		if matchScore >= 20.0 {
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

	// Sort recommendations by match score (highest first) - using built-in sort
	for i := 0; i < len(recommendations); i++ {
		for j := i + 1; j < len(recommendations); j++ {
			if recommendations[j].MatchScore > recommendations[i].MatchScore {
				recommendations[i], recommendations[j] = recommendations[j], recommendations[i]
			}
		}
	}

	// Limit to top 20 recommendations for performance
	if len(recommendations) > 20 {
		recommendations = recommendations[:20]
	}

	return c.JSON(http.StatusOK, echo.Map{
		"recommendations": recommendations,
		"count":           len(recommendations),
	})
}

// normalizeString normalizes a string for better matching
func normalizeString(s string) string {
	s = strings.ToLower(s)
	// Remove special characters and extra spaces
	s = strings.ReplaceAll(s, "-", " ")
	s = strings.ReplaceAll(s, "_", " ")
	s = strings.Join(strings.Fields(s), " ")
	return s
}

// fuzzyMatch checks if two strings are similar enough (handles variations like "machine learning" vs "machine-learning")
func fuzzyMatch(str1, str2 string) bool {
	s1 := normalizeString(str1)
	s2 := normalizeString(str2)

	// Exact match
	if s1 == s2 {
		return true
	}

	// One contains the other
	if strings.Contains(s1, s2) || strings.Contains(s2, s1) {
		return true
	}

	// Check word overlap for multi-word strings
	words1 := strings.Fields(s1)
	words2 := strings.Fields(s2)

	if len(words1) > 1 || len(words2) > 1 {
		matchCount := 0
		for _, w1 := range words1 {
			if len(w1) <= 2 { // Skip very short words
				continue
			}
			for _, w2 := range words2 {
				if len(w2) <= 2 {
					continue
				}
				if w1 == w2 || strings.Contains(w1, w2) || strings.Contains(w2, w1) {
					matchCount++
					break
				}
			}
		}
		// If majority of words match, consider it a match
		minWords := len(words1)
		if len(words2) < minWords {
			minWords = len(words2)
		}
		if matchCount > 0 && float64(matchCount)/float64(minWords) >= 0.6 {
			return true
		}
	}

	return false
}

// jaccardSimilarity calculates Jaccard similarity between two string slices
func jaccardSimilarity(set1, set2 []string) float64 {
	if len(set1) == 0 || len(set2) == 0 {
		return 0.0
	}

	// Normalize all strings
	normalizedSet1 := make([]string, len(set1))
	normalizedSet2 := make([]string, len(set2))
	for i, s := range set1 {
		normalizedSet1[i] = normalizeString(s)
	}
	for i, s := range set2 {
		normalizedSet2[i] = normalizeString(s)
	}

	// Count intersection with fuzzy matching
	intersection := 0
	matched := make(map[int]bool)

	for _, s1 := range normalizedSet1 {
		for j, s2 := range normalizedSet2 {
			if matched[j] {
				continue
			}
			if fuzzyMatch(s1, s2) {
				intersection++
				matched[j] = true
				break
			}
		}
	}

	// Union = set1 + set2 - intersection
	union := len(set1) + len(set2) - intersection
	if union == 0 {
		return 0.0
	}

	return float64(intersection) / float64(union)
}

// calculateMatchScore calculates how well a project matches a student's profile
func calculateMatchScore(student models.Students, project models.Projects, hasPreferences bool, preferences models.ResearchPreference, recentAppliedProjects []models.Projects) (float64, []string) {
	var score float64
	var reasons []string

	// Enhanced Weight distribution:
	// Skills Match: 30%
	// Research Interest/Text Similarity: 25%
	// Field of Study: 20%
	// Tags Match: 15%
	// Preferences: 10%
	// Recent Applications Similarity: Bonus up to 15%

	// Early exit optimization: if student has no data, return minimal score
	hasSkills := len(student.Skills) > 0
	hasResearch := student.ResearchInterest != ""
	hasIntention := student.Intention != ""

	if !hasSkills && !hasResearch && !hasIntention {
		return 0.0, []string{"Complete your profile for better matches"}
	}

	// 1. Skills Match (30 points) - Using Jaccard similarity with fuzzy matching
	skillScore := 0.0
	if hasSkills {
		// Collect all project-related terms
		projectTerms := make([]string, 0)
		projectTerms = append(projectTerms, project.Tags...)
		if project.FieldOfStudy != "" {
			projectTerms = append(projectTerms, project.FieldOfStudy)
		}
		if project.Specialization != "" {
			projectTerms = append(projectTerms, project.Specialization)
		}

		// Add significant terms from description
		descWords := tokenize(project.LDesc + " " + project.SDesc)
		for _, word := range descWords {
			if len(word) > 4 { // Only significant words
				projectTerms = append(projectTerms, word)
			}
		}

		// Calculate Jaccard similarity
		similarity := jaccardSimilarity(student.Skills, projectTerms)
		skillScore = similarity * 30.0

		// Count exact and fuzzy matches for better reason
		matchCount := 0
		for _, skill := range student.Skills {
			for _, term := range projectTerms {
				if fuzzyMatch(skill, term) {
					matchCount++
					break
				}
			}
		}

		if matchCount >= 3 {
			reasons = append(reasons, "Multiple matching skills")
		} else if matchCount >= 2 {
			reasons = append(reasons, "Several relevant skills")
		} else if matchCount >= 1 {
			reasons = append(reasons, "Relevant skills match")
		}

		score += skillScore
	}

	// 2. Research Interest & Text Similarity (25 points)
	textScore := 0.0
	if hasResearch {
		researchScore := calculateTextSimilarity(student.ResearchInterest, project.LDesc, project.SDesc)
		textScore = researchScore * 25.0
		score += textScore

		if researchScore > 0.5 {
			reasons = append(reasons, "Strong research interest alignment")
		} else if researchScore > 0.3 {
			reasons = append(reasons, "Moderate research interest match")
		}
	}

	// Also check intention against project description
	if hasIntention {
		intentionScore := calculateTextSimilarity(student.Intention, project.LDesc, project.SDesc)
		if intentionScore > 0.3 {
			score += intentionScore * 10.0
			if len(reasons) < 3 {
				reasons = append(reasons, "Aligns with your career goals")
			}
		}
	} // 3. Field of Study & Specialization Match (20 points)
	fieldScore := 0.0
	if hasPreferences && preferences.FieldOfStudy != "" && project.FieldOfStudy != "" {
		if fuzzyMatch(preferences.FieldOfStudy, project.FieldOfStudy) {
			fieldScore += 20.0
			reasons = append(reasons, "Matches your field of study")
		} else if strings.Contains(normalizeString(project.FieldOfStudy), normalizeString(preferences.FieldOfStudy)) ||
			strings.Contains(normalizeString(preferences.FieldOfStudy), normalizeString(project.FieldOfStudy)) {
			fieldScore += 12.0
			reasons = append(reasons, "Related field of study")
		}
	}

	// Check specialization
	if project.Specialization != "" {
		specNorm := normalizeString(project.Specialization)

		// Check against skills with fuzzy matching
		for _, skill := range student.Skills {
			if fuzzyMatch(skill, project.Specialization) {
				fieldScore += 15.0
				if len(reasons) < 4 {
					reasons = append(reasons, "Specialization matches your skills")
				}
				break
			}
		}

		// Check against research interest
		if student.ResearchInterest != "" &&
			(strings.Contains(normalizeString(student.ResearchInterest), specNorm) ||
				fuzzyMatch(student.ResearchInterest, project.Specialization)) {
			fieldScore += 12.0
			if len(reasons) < 4 {
				reasons = append(reasons, "Specialization matches your research interest")
			}
		}
	}

	score += math.Min(fieldScore, 20.0) // Cap at 20 points

	// 4. Tags Match with Jaccard Similarity (15 points)
	if len(project.Tags) > 0 && len(student.Skills) > 0 {
		tagSimilarity := jaccardSimilarity(student.Skills, project.Tags)
		tagScore := tagSimilarity * 15.0
		score += tagScore

		if tagScore > 10.0 && len(reasons) < 4 {
			reasons = append(reasons, "Strong tag alignment")
		}
	}

	// 5. Preferences Match (10 points)
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

		score += math.Min(preferencesScore, 10.0) // Cap at 10 points
		if preferencesScore >= 7.0 && len(reasons) < 5 {
			reasons = append(reasons, "Aligns with your learning preferences")
		}
	}

	// Bonus: Prior experience in similar projects (up to 10 points)
	// Check both simple projects array and detailed projects
	if len(student.Projects) > 0 || len(student.ProjectsDetails) > 0 {
		maxProjSimilarity := 0.0

		// Check simple projects (just titles)
		for _, proj := range student.Projects {
			similarity := calculateTextSimilarity(proj, project.SDesc, project.LDesc)
			if similarity > maxProjSimilarity {
				maxProjSimilarity = similarity
			}
		}

		// Check detailed projects (title + description)
		for _, projDetail := range student.ProjectsDetails {
			projectText := projDetail.Title + " " + projDetail.Description
			similarity := calculateTextSimilarity(projectText, project.SDesc, project.LDesc)
			if similarity > maxProjSimilarity {
				maxProjSimilarity = similarity
			}
		}

		if maxProjSimilarity > 0.4 {
			bonusScore := maxProjSimilarity * 10.0
			score += bonusScore
			if len(reasons) < 5 {
				reasons = append(reasons, "Similar to your past projects")
			}
		}
	}

	// Recency bonus: boost newer projects slightly (up to 3 points)
	if !project.CreatedAt.IsZero() {
		daysSinceCreation := int(math.Round(float64(project.UpdatedAt.Sub(project.CreatedAt).Hours()) / 24))
		if daysSinceCreation <= 30 {
			recencyBonus := 3.0 * (1.0 - float64(daysSinceCreation)/30.0)
			score += recencyBonus
		}
	}

	// BONUS: Recent Applications Similarity (up to 15 points)
	// Analyze projects the student applied to in the past 3 months to find similar projects
	if len(recentAppliedProjects) > 0 {
		maxSimilarity := 0.0
		var mostSimilarProject string

		for _, appliedProj := range recentAppliedProjects {
			similarity := 0.0
			matchCount := 0

			// 1. Tag similarity
			if len(project.Tags) > 0 && len(appliedProj.Tags) > 0 {
				tagSim := jaccardSimilarity(project.Tags, appliedProj.Tags)
				similarity += tagSim * 40.0 // 40% weight
				if tagSim > 0.3 {
					matchCount++
				}
			}

			// 2. Field of study match
			if project.FieldOfStudy != "" && appliedProj.FieldOfStudy != "" {
				if fuzzyMatch(project.FieldOfStudy, appliedProj.FieldOfStudy) {
					similarity += 25.0 // 25% weight
					matchCount++
				}
			}

			// 3. Specialization match
			if project.Specialization != "" && appliedProj.Specialization != "" {
				if fuzzyMatch(project.Specialization, appliedProj.Specialization) {
					similarity += 20.0 // 20% weight
					matchCount++
				}
			}

			// 4. Description similarity
			descSim := calculateTextSimilarity(project.SDesc+" "+project.LDesc, appliedProj.SDesc, appliedProj.LDesc)
			similarity += descSim * 15.0 // 15% weight

			// Track the most similar project
			if similarity > maxSimilarity {
				maxSimilarity = similarity
				mostSimilarProject = appliedProj.Name
			}
		}

		// Add bonus points based on similarity
		if maxSimilarity > 50.0 {
			bonusPoints := (maxSimilarity / 100.0) * 15.0 // Up to 15 points
			score += bonusPoints
			reasons = append(reasons, "Similar to projects you've applied to recently")

			// Add specific reason if we have the project name
			if mostSimilarProject != "" && maxSimilarity > 70.0 {
				// Replace the generic reason with a more specific one
				if len(reasons) > 0 && reasons[len(reasons)-1] == "Similar to projects you've applied to recently" {
					reasons[len(reasons)-1] = "Similar to \"" + mostSimilarProject + "\" you applied to"
				}
			}
		} else if maxSimilarity > 30.0 {
			bonusPoints := (maxSimilarity / 100.0) * 8.0 // Up to 8 points for moderate similarity
			score += bonusPoints
			if len(reasons) < 5 {
				reasons = append(reasons, "Matches your application interests")
			}
		}
	}

	// Normalize score to 0-100 (should already be close due to weights)
	if score > 100 {
		score = 100
	}

	// Round to 1 decimal place
	score = math.Round(score*10) / 10

	// If no specific reasons were found but score is decent, add a generic reason
	if len(reasons) == 0 && score >= 30 {
		reasons = append(reasons, "Matches your profile")
	}

	// Ensure we have at least one reason if score is above threshold
	if len(reasons) == 0 && score >= 20 {
		reasons = append(reasons, "Potential fit based on your background")
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
