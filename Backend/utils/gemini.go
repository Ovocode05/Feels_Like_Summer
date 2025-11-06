package utils

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

type GeminiRequest struct {
	Contents []GeminiContent `json:"contents"`
}

type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func getApiKeys() []string {
	keys := os.Getenv("GEMINI_API_KEY")
	if keys == "" {
		return nil
	}
	parts := strings.Split(keys, ",")
	for i := range parts {
		parts[i] = strings.TrimSpace(parts[i])
	}
	return parts
}

// GenerateRoadmap calls Gemini 2.5 Flash to generate a research roadmap
func GenerateRoadmap(fieldOfStudy, experienceLevel, goals, interestAreas string, timeCommitment int) (string, error) {
	apiKeys := getApiKeys()
	if len(apiKeys) == 0 {
		return "", errors.New("GEMINI_API_KEY not set")
	}

	prompt := buildRoadmapPrompt(fieldOfStudy, experienceLevel, goals, interestAreas, timeCommitment)

	reqBody := GeminiRequest{
		Contents: []GeminiContent{
			{
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	var lastErr error
	// Try each API key in sequence
	for i, apiKey := range apiKeys {
		url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", apiKey)
		resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			lastErr = fmt.Errorf("API key %d failed: %w", i+1, err)
			continue // Try next key
		}

		// Check response status
		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			lastErr = fmt.Errorf("API key %d returned status %d: %s", i+1, resp.StatusCode, string(body))
			continue // Try next key
		}

		// Parse response
		var geminiResp GeminiResponse
		if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
			resp.Body.Close()
			lastErr = fmt.Errorf("API key %d decode error: %w", i+1, err)
			continue // Try next key
		}
		resp.Body.Close()

		// Check for valid response content
		if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("API key %d returned empty response", i+1)
			continue // Try next key
		}

		// Success! Return the response
		return geminiResp.Candidates[0].Content.Parts[0].Text, nil
	}

	// All keys failed
	return "", fmt.Errorf("all API keys failed, last error: %w", lastErr)
}

func buildRoadmapPrompt(fieldOfStudy, experienceLevel, goals, interestAreas string, timeCommitment int) string {
	return fmt.Sprintf(`You are an expert research advisor. Generate a CONCISE, HIERARCHICAL research roadmap for a student.

Field of Study: %s
Experience Level: %s
Goals: %s
Interest Areas: %s
Time Commitment: %d hours per week

Create a roadmap with MAIN TOPICS and SUBTOPICS in JSON format:
{
  "title": "Your Path to %s Mastery",
  "description": "A structured learning roadmap tailored to your goals",
  "total_time": "4-6 months",
  "nodes": [
    {
      "id": "main_1",
      "title": "Main Topic Title",
      "description": "Brief 1-sentence overview of this main area",
      "category": "foundation",
      "duration": "4 weeks total",
      "resources": [
        "YouTube: Channel Name - Playlist Title",
        "Course: Platform - Course Name",
        "Website: SiteName.com - Tutorial Series",
        "Book: Title by Author",
        "Practice: Website for hands-on exercises"
      ],
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "next_nodes": ["sub_1_1", "sub_1_2"]
    }
  ]
}

CRITICAL STRUCTURE - CREATE THIS EXACT CONNECTED FLOW:

Structure with 8 nodes:
1. MAIN_1 (foundation) → next_nodes: ["sub_1_1", "sub_1_2", "main_2"]
2. SUB_1_1 (foundation) → next_nodes: ["main_2"]
3. SUB_1_2 (foundation) → next_nodes: ["main_2"]
4. MAIN_2 (core) → next_nodes: ["sub_2_1", "sub_2_2", "main_3"]
5. SUB_2_1 (core) → next_nodes: ["main_3"]
6. SUB_2_2 (core) → next_nodes: ["main_3"]
7. MAIN_3 (advanced) → next_nodes: ["sub_3_1"]
8. SUB_3_1 (specialization) → next_nodes: []

IMPORTANT: 
- Each MAIN topic MUST connect DIRECTLY to the NEXT main topic (main_1 → main_2, main_2 → main_3)
- Main topics also connect to their subtopics
- Subtopics also connect back to the next main topic
- This creates a clear progression path with main topics forming the spine

EXAMPLE VISUAL FLOW:
        MAIN_1 ──────────────→ MAIN_2 ──────────────→ MAIN_3
          ↓                      ↓                      ↓
      ┌────┴────┐            ┌────┴────┐           SUB_3_1
   SUB_1_1  SUB_1_2      SUB_2_1  SUB_2_2
      ↓        ↓              ↓        ↓
      └────────┴──────────────┴────────┘

CATEGORY ASSIGNMENT:
- main_1, sub_1_1, sub_1_2 → category: "foundation"
- main_2, sub_2_1, sub_2_2 → category: "core"
- main_3 → category: "advanced"
- sub_3_1 → category: "specialization"

RESOURCE REQUIREMENTS:
- Include 4-6 diverse, REAL resources per node
- MUST include YouTube channels/videos with actual names
- Include interactive websites (freeCodeCamp, Kaggle, LeetCode, etc.)
- Include popular online platforms (Coursera, Udemy, edX)

RESOURCE FORMAT EXAMPLES:
- "YouTube: freeCodeCamp.org - Python for Beginners"
- "YouTube: 3Blue1Brown - Neural Networks Series"
- "Course: Coursera - Machine Learning by Andrew Ng"
- "Website: Kaggle.com - Intro to ML Competition"
- "Practice: LeetCode.com - Python Track"

KEEP IT CONCISE:
- Descriptions: MAX 1 sentence (10-15 words)
- Node titles: 3-6 words max
- Skills: 3-4 specific skills per node
- Duration: Realistic based on %d hrs/week

Return ONLY valid JSON, no markdown.`,
		fieldOfStudy, experienceLevel, goals, interestAreas, timeCommitment, fieldOfStudy, timeCommitment)
}

// GeneratePlacementRoadmap calls Gemini 2.5 Flash to generate a placement preparation roadmap
func GeneratePlacementRoadmap(timelineWeeks, timeCommitment int, intensityType, prepAreas, currentLevels, resourcesStarted, targetCompanies, goals string) (string, error) {
	apiKeys := getApiKeys()
	if len(apiKeys) == 0 {
		return "", errors.New("GEMINI_API_KEY not set")
	}

	prompt := buildPlacementRoadmapPrompt(timelineWeeks, timeCommitment, intensityType, prepAreas, currentLevels, resourcesStarted, targetCompanies, goals)

	reqBody := GeminiRequest{
		Contents: []GeminiContent{
			{
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	var lastErr error
	// Try each API key in sequence
	for i, apiKey := range apiKeys {
		url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", apiKey)
		resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			lastErr = fmt.Errorf("API key %d failed: %w", i+1, err)
			continue
		}

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			lastErr = fmt.Errorf("API key %d returned status %d: %s", i+1, resp.StatusCode, string(body))
			continue
		}

		var geminiResp GeminiResponse
		if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
			resp.Body.Close()
			lastErr = fmt.Errorf("API key %d decode error: %w", i+1, err)
			continue
		}
		resp.Body.Close()

		if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("API key %d returned empty response", i+1)
			continue
		}

		return geminiResp.Candidates[0].Content.Parts[0].Text, nil
	}

	return "", fmt.Errorf("all API keys failed, last error: %w", lastErr)
}

func buildPlacementRoadmapPrompt(timelineWeeks, timeCommitment int, intensityType, prepAreas, currentLevels, resourcesStarted, targetCompanies, goals string) string {
	return fmt.Sprintf(`You are an expert career counselor and placement preparation advisor. Generate a PERSONALIZED, WEEK-BY-WEEK placement/internship preparation roadmap.

STUDENT PROFILE:
- Timeline: %d weeks until placements/internships
- Time Commitment: %d hours per week
- Intensity Type: %s (regular=8-10hrs, intense=15-20hrs, weekend=5-6hrs)
- Preparation Areas: %s
- Current Skill Levels: %s
- Resources Started: %s
- Target Companies: %s
- Goals: %s

CONTEXT:
- Aptitude = Quantitative, Logical Reasoning, Verbal Ability
- DSA = Data Structures & Algorithms, Coding rounds
- Core CS = DBMS, OS, Computer Networks, OOP, System Design
- Resume = Building projects, formatting resume
- Interview = Technical interviews, HR rounds, behavioral questions
- Company-specific = Puzzles, case studies, company-specific patterns

Create a roadmap with SEQUENTIAL WEEKLY NODES in JSON format:
{
  "title": "Your %d-Week Placement Prep Roadmap",
  "description": "Personalized preparation plan tailored to your timeline and goals",
  "total_time": "%d weeks",
  "nodes": [
    {
      "id": "week_1",
      "title": "Week 1: Foundations & Setup",
      "description": "Build strong fundamentals in core areas",
      "category": "foundation",
      "duration": "Week 1 (%d hours total)",
      "resources": [
        "YouTube: freeCodeCamp - DSA for Beginners",
        "Practice: LeetCode - Array Easy Problems (Solve 20 problems)",
        "Sheet: Striver's A2Z DSA Sheet - Arrays Section",
        "Website: GeeksForGeeks - Time Complexity Tutorial",
        "Mock Test: IndiaBix - Aptitude Mock Test 1"
      ],
      "skills": ["Arrays", "Time Complexity", "Basic Problem Solving", "Aptitude Basics"],
      "next_nodes": ["week_2"]
    },
    {
      "id": "week_2",
      "title": "Week 2: Building Momentum",
      "description": "Expand knowledge and increase practice volume",
      "category": "foundation",
      "duration": "Week 2 (%d hours total)",
      "resources": [
        "YouTube: Abdul Bari - Sorting Algorithms",
        "Practice: LeetCode - String Easy/Medium (Solve 25 problems)",
        "Practice: PrepInsta - Aptitude Questions Daily",
        "YouTube: Gate Smashers - DBMS Basics",
        "Mock Test: TestPot - Full Length Mock 1"
      ],
      "skills": ["Strings", "Sorting", "DBMS Fundamentals", "Speed & Accuracy"],
      "next_nodes": ["week_3"]
    }
  ]
}

CRITICAL REQUIREMENTS:

1. SEQUENTIAL STRUCTURE:
   - Create EXACTLY %d nodes (one per week)
   - IDs MUST be: "week_1", "week_2", "week_3", ..., "week_%d"
   - Each week connects to ONLY the next week: week_1 → week_2 → week_3 → ... → week_%d
   - LAST WEEK has next_nodes: []
   - NO other connection patterns, STRICTLY sequential

2. CATEGORY DISTRIBUTION (for %d weeks):
   - First 25%%: "foundation" - Basics and fundamentals
   - Next 35%%: "core" - Main preparation, intensive practice
   - Next 25%%: "advanced" - Advanced topics, mock interviews
   - Final 15%%: "specialization" - Company-specific, final revision

3. PREP AREA FOCUS (based on: %s):
   - DSA: Focus on LeetCode, Striver Sheet, NeetCode patterns
   - Aptitude: PrepInsta, IndiaBix, RS Aggarwal, mock tests
   - Core CS: DBMS, OS, CN, OOP concepts with GeeksForGeeks, Gate Smashers
   - Resume: Project building, resume formatting, portfolio
   - Interview: Mock interviews, system design, HR prep
   - Balance weekly hours across ALL selected areas

4. INTENSITY-BASED PACING (%s):
   - regular: Steady pace, focus on understanding over speed
   - intense: Fast-paced, more daily problems, aggressive timeline
   - weekend: Condensed weekend schedule, intensive sessions

5. CURRENT LEVEL ADAPTATION (%s):
   - Beginner: Start with absolute basics, more foundational resources, easier problems
   - Intermediate: Skip pure basics, focus on medium problems, faster progression
   - Confident: Jump to advanced topics, hard problems, system design early

6. RESOURCES (MUST BE REAL, FREE & SPECIFIC):

   DSA Resources:
   - "YouTube: freeCodeCamp - Data Structures Full Course"
   - "YouTube: Abdul Bari - Algorithms Playlist"
   - "YouTube: Striver (take U forward) - A2Z DSA Sheet Series"
   - "Practice: LeetCode.com - Top Interview 150 Questions"
   - "Practice: GeeksForGeeks - Practice DSA Problems"
   - "Sheet: Striver's A2Z DSA Sheet (takeuforward.org)"
   - "Sheet: Love Babbar's 450 DSA Questions"
   - "Website: NeetCode.io - Patterns & Solutions"
   - "Practice: CodeForces - Competitive Programming"

   Aptitude Resources:
   - "YouTube: Arun Sharma - Quantitative Aptitude Lectures"
   - "Practice: IndiaBix.com - All Aptitude Topics"
   - "Practice: PrepInsta - Company-wise Placement Papers"
   - "Book: RS Aggarwal - Quantitative Aptitude PDF"
   - "Website: Hitbullseye.com - Logical Reasoning"
   - "Mock Test: TestPot.com - Full Length Mocks"
   - "Practice: Smartkeeda - Quant & Reasoning"

   Core CS Resources:
   - "YouTube: Gate Smashers - DBMS Complete Course"
   - "YouTube: Neso Academy - OS Full Playlist"
   - "YouTube: Knowledge Gate - Computer Networks"
   - "Notes: GeeksForGeeks - DBMS Interview Questions"
   - "Practice: Sanfoundry - OS MCQs & Practice"
   - "Website: Tutorialspoint - OOP Concepts"
   - "YouTube: Jenny's Lectures - CN Full Course"

   Resume & Projects:
   - "Tool: ResumeWorded.com - Free Resume Review"
   - "Template: Overleaf.com - LaTeX Resume Templates"
   - "Ideas: GitHub.com - Awesome Project Ideas Lists"
   - "Guide: CareerCup - Resume Building Tips"
   - "Tool: Canva.com - Resume Builder (Free)"

   Interview Resources:
   - "YouTube: Gaurav Sen - System Design Primer"
   - "YouTube: TechLead - Interview Tips & Tricks"
   - "Website: InterviewBit.com - Mock Interviews"
   - "Practice: Pramp.com - Free Peer Mock Interviews"
   - "Guide: GeeksForGeeks - Common HR Interview Questions"
   - "YouTube: Exponent - Behavioral Interview Guide"
   - "Practice: interviewing.io - Anonymous Technical Interviews"

7. WEEKLY STRUCTURE:
   - Title: "Week X: [Main Focus Area]"
   - Description: ONE sentence about the week's primary objective
   - Duration: "Week X (Y hours total)"
   - 5-7 diverse resources per week (mix of YouTube, Practice, Sheets, Mocks)
   - 3-5 specific, measurable skills to gain
   - Clear weekly milestones (e.g., "Solve 30 easy problems", "Complete 3 mock tests")

8. RESOURCES INTEGRATION:
%s

9. TARGET COMPANY INTEGRATION:
%s

10. TIME SPLIT STRATEGY:
   - If multiple prep areas selected, show how to divide %d hours/week
   - E.g., for DSA+Aptitude: "%d hrs DSA + %d hrs Aptitude per week"
   - Adjust based on current levels and goals

EXAMPLE WEEK STRUCTURE:
{
  "id": "week_1",
  "title": "Week 1: DSA Foundations - Arrays & Basics",
  "description": "Master array fundamentals and solve 30 easy problems across patterns",
  "category": "foundation",
  "duration": "Week 1 (%d hours total - Split: 6hrs DSA + 4hrs Aptitude)",
  "resources": [
    "YouTube: Striver - Arrays Complete Playlist (Watch first 5 videos)",
    "Practice: LeetCode - Array Tag Easy (Solve 30 problems)",
    "Sheet: Striver A2Z Sheet - Arrays Section (Complete)",
    "YouTube: Abdul Bari - Array Algorithms Explained",
    "Practice: IndiaBix - Quant Basics (50 questions daily)",
    "Mock Test: PrepInsta - Mock Test 1"
  ],
  "skills": ["Arrays", "Two Pointers", "Sliding Window", "Time Complexity O(n)", "Aptitude Speed"],
  "next_nodes": ["week_2"]
}

CRITICAL FINAL CHECKS:
- MUST have EXACTLY %d nodes
- Each node MUST connect ONLY to the next sequential week
- Last week (week_%d) MUST have next_nodes: []
- Resources MUST be real, accessible, and free
- Each week MUST have clear, measurable goals
- Balance ALL selected prep areas throughout
- Adjust difficulty based on current levels
- Include weekly hour distribution if multiple areas selected

Return ONLY valid JSON, no markdown, no explanations.`,
		timelineWeeks, timeCommitment, intensityType, prepAreas, currentLevels,
		resourcesStarted, targetCompanies, goals,
		timelineWeeks, timelineWeeks, timeCommitment, timeCommitment,
		timelineWeeks, timelineWeeks, timelineWeeks,
		timelineWeeks, prepAreas, intensityType, currentLevels,
		getResourcesStartedGuidance(resourcesStarted),
		getCompanySpecificGuidance(targetCompanies),
		timeCommitment, timeCommitment/2, timeCommitment/2,
		timeCommitment,
		timelineWeeks, timelineWeeks)
}

func getResourcesStartedGuidance(resourcesStarted string) string {
	if resourcesStarted == "" || resourcesStarted == "[]" {
		return "No resources started yet - begin with recommended foundational resources"
	}
	return fmt.Sprintf(`Resources Already Started: %s
   - Build upon these resources rather than starting from scratch
   - Continue with next sections/levels of started resources
   - Reference progress already made in these resources
   - Complement with additional resources for complete coverage`, resourcesStarted)
}

func getCompanySpecificGuidance(targetCompanies string) string {
	if targetCompanies == "" || targetCompanies == "[]" {
		return "No specific companies targeted - focus on general placement preparation"
	}
	return fmt.Sprintf(`Target Companies: %s
   - Research common interview patterns for these companies on GeeksForGeeks
   - Include company-specific prep starting from Week 3-4 onwards
   - Add company interview experiences from LeetCode Discuss forums
   - If targeting: ZS Associates/DE Shaw - Include puzzles & probability
   - If targeting: Product Companies - Heavy DSA focus
   - If targeting: Service Companies - Balance DSA + Aptitude + Core CS
   - If targeting: Consulting Firms - Add case studies & guesstimates
   - In final weeks, do company-specific mock tests`, targetCompanies)
}
