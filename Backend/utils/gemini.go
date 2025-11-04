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
	apiKey := getApiKeys()
	if len(apiKey) == 0 {
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

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", apiKey)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("gemini API error: %s", string(body))
	}

	var geminiResp GeminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return "", err
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", errors.New("no response from Gemini")
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
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
