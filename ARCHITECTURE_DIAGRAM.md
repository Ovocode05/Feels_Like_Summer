# Project Recommendation System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          STUDENT PROFILE                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ • Skills: ["Python", "Machine Learning", "Data Science"]     │  │
│  │ • Research Interest: "Deep learning for healthcare"          │  │
│  │ • Intention: "PhD in AI"                                     │  │
│  │ • Past Projects: ["Medical imaging analysis"]               │  │
│  │ • Institution: "MIT"                                         │  │
│  │ • Degree: "MS Computer Science"                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESEARCH PREFERENCES (Optional)                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ • Field of Study: "Computer Science"                        │  │
│  │ • Experience Level: "Intermediate"                          │  │
│  │ • Interest Areas: "Neural networks, medical AI"             │  │
│  │ • Goals: "Publish research papers"                          │  │
│  │ • Time Commitment: 20 hours/week                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RECOMMENDATION ALGORITHM                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  STEP 1: Fetch All Active Projects                          │  │
│  │  ├─ Filter out already applied projects                     │  │
│  │  └─ Filter out student's own projects                       │  │
│  │                                                              │  │
│  │  STEP 2: Calculate Match Scores (0-100)                     │  │
│  │  ┌────────────────────────────────────────────────────┐    │  │
│  │  │ Research Interest Match           30%  (30 points) │    │  │
│  │  │ • Text similarity analysis                         │    │  │
│  │  │ • Word overlap with project descriptions           │    │  │
│  │  ├────────────────────────────────────────────────────┤    │  │
│  │  │ Skills Match                       25%  (25 points) │    │  │
│  │  │ • Compare with project tags                        │    │  │
│  │  │ • Check project descriptions                       │    │  │
│  │  │ • 5 points per matching skill                      │    │  │
│  │  ├────────────────────────────────────────────────────┤    │  │
│  │  │ Field of Study Match               20%  (20 points) │    │  │
│  │  │ • Exact match: 20 points                           │    │  │
│  │  │ • Related field: 10 points                         │    │  │
│  │  ├────────────────────────────────────────────────────┤    │  │
│  │  │ Preferences Match                  15%  (15 points) │    │  │
│  │  │ • Interest areas: 8 points                         │    │  │
│  │  │ • Experience level: 4 points                       │    │  │
│  │  │ • Goals alignment: 3 points                        │    │  │
│  │  ├────────────────────────────────────────────────────┤    │  │
│  │  │ Tags Match                         10%  (10 points) │    │  │
│  │  │ • 2 points per matching tag                        │    │  │
│  │  ├────────────────────────────────────────────────────┤    │  │
│  │  │ Prior Experience Bonus             +5   (5 points)  │    │  │
│  │  │ • Similar past projects                            │    │  │
│  │  └────────────────────────────────────────────────────┘    │  │
│  │                                                              │  │
│  │  STEP 3: Generate Match Reasons                             │  │
│  │  └─ Human-readable explanations for each score              │  │
│  │                                                              │  │
│  │  STEP 4: Filter & Sort                                      │  │
│  │  ├─ Minimum score threshold: 40%                            │  │
│  │  ├─ Sort by score (highest first)                           │  │
│  │  └─ Limit to top 10 recommendations                         │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RECOMMENDATION RESULTS                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Project 1: "AI-Powered Medical Diagnosis"                   │  │
│  │  ├─ Match Score: 92%                                         │  │
│  │  ├─ Professor: Dr. Smith                                     │  │
│  │  └─ Reasons:                                                 │  │
│  │     • Strong research interest alignment                     │  │
│  │     • Multiple matching skills                               │  │
│  │     • Matches your field of study                            │  │
│  │     • Similar to your past projects                          │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Project 2: "Deep Learning for Drug Discovery"               │  │
│  │  ├─ Match Score: 87%                                         │  │
│  │  ├─ Professor: Dr. Johnson                                   │  │
│  │  └─ Reasons:                                                 │  │
│  │     • Moderate research interest match                       │  │
│  │     • Multiple matching skills                               │  │
│  │     • Matches your field of study                            │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Project 3: "Neural Networks for Image Analysis"             │  │
│  │  ├─ Match Score: 78%                                         │  │
│  │  ├─ Professor: Dr. Lee                                       │  │
│  │  └─ Reasons:                                                 │  │
│  │     • Some research interest overlap                         │  │
│  │     • Relevant skills match                                  │  │
│  │     • Aligns with your learning preferences                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Dashboard (/student)                                        │  │
│  │  • Shows top 3 recommendations                               │  │
│  │  • Quick match score display                                 │  │
│  │  • Link to full recommendations page                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Recommendations Page (/student/recommendations)             │  │
│  │  • All recommendations with detailed info                    │  │
│  │  • Color-coded match scores                                  │  │
│  │  • All match reasons displayed                               │  │
│  │  • Project details (field, duration, deadline, tags)         │  │
│  │  • "View Details" and "Apply Now" buttons                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Match Score Interpretation

```
┌──────────────────────────────────────────────────────────┐
│  Score Range  │  Label            │  Color   │  Meaning  │
├──────────────────────────────────────────────────────────┤
│  80% - 100%   │  Excellent Match  │  Green   │  Highly   │
│               │                   │          │  Relevant │
├──────────────────────────────────────────────────────────┤
│  60% - 79%    │  Good Match       │  Blue    │  Well     │
│               │                   │          │  Suited   │
├──────────────────────────────────────────────────────────┤
│  40% - 59%    │  Fair Match       │  Yellow  │  Worth    │
│               │                   │          │  Consider │
├──────────────────────────────────────────────────────────┤
│  Below 40%    │  Not Shown        │  N/A     │  Filtered │
│               │                   │          │  Out      │
└──────────────────────────────────────────────────────────┘
```

## API Endpoints

### Backend
```
GET /v1/profile/student/recommendations
Headers: Authorization: Bearer <token>

Response: {
  "recommendations": [
    {
      "ID": 1,
      "name": "Project Name",
      "pid": "proj_xyz",
      "sdesc": "Short description",
      "ldesc": "Long description",
      "tags": ["AI", "Healthcare"],
      "fieldOfStudy": "Computer Science",
      "duration": "6 months",
      "user": {
        "name": "Dr. Smith",
        "email": "smith@university.edu"
      },
      "match_score": 92.5,
      "match_reasons": [
        "Strong research interest alignment",
        "Multiple matching skills"
      ]
    }
  ],
  "count": 10
}
```

### Frontend
```typescript
// In api.ts
getRecommendedProjects(token: string): Promise<{
  recommendations: RecommendedProject[];
  count: number;
}>
```

## Database Tables Used

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    Students     │     │     Projects     │     │  ProjRequests   │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ uid             │     │ project_id       │     │ uid             │
│ skills[]        │────┐│ name             │     │ p_id            │
│ research_int    │    ││ sdesc            │     │ status          │
│ intention       │    ││ ldesc            │     └─────────────────┘
│ projects[]      │    ││ tags[]           │              │
│ institution     │    ││ field_of_study   │              │
│ degree          │    ││ duration         │              │
└─────────────────┘    ││ creator_id       │              │
                       │└──────────────────┘              │
                       │                                  │
                       │  ┌───────────────────────────┐   │
                       │  │ ResearchPreferences       │   │
                       │  ├───────────────────────────┤   │
                       └─▶│ user_id                   │◀──┘
                          │ field_of_study            │
                          │ experience_level          │
                          │ interest_areas            │
                          │ goals                     │
                          │ time_commitment           │
                          └───────────────────────────┘
```

## Text Similarity Algorithm

```
Input Text 1: "Deep learning for medical imaging and diagnosis"
Input Text 2: "AI-powered healthcare diagnostics using neural networks"

Step 1: Tokenization
  Text 1: ["deep", "learning", "medical", "imaging", "diagnosis"]
  Text 2: ["powered", "healthcare", "diagnostics", "neural", "networks"]

Step 2: Remove Stop Words (< 3 chars)
  Text 1: ["deep", "learning", "medical", "imaging", "diagnosis"]
  Text 2: ["powered", "healthcare", "diagnostics", "neural", "networks"]

Step 3: Find Matches
  Common concepts:
  - "medical" ≈ "healthcare" (context match)
  - "diagnosis" ≈ "diagnostics" (similar)
  - "learning" ≈ "neural networks" (related)

Step 4: Calculate Similarity
  Similarity = matches / total_words = 3/5 = 0.6 (60%)
```
