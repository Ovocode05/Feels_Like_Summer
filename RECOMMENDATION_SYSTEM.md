# Project Recommendation System Implementation

## Overview
A comprehensive project recommendation system that provides personalized project suggestions to students based on their profile, skills, research interests, and preferences.

## Backend Implementation

### 1. Recommendation Handler (`Backend/handlers/recommendations.go`)

#### Main Endpoint
- **Route**: `GET /v1/profile/student/recommendations`
- **Authentication**: Required (JWT)
- **User Type**: Student only

#### Algorithm Components

The recommendation algorithm uses a multi-factor scoring system with the following weights:

1. **Research Interest Match (30%)**: 
   - Analyzes text similarity between student's research interest and project descriptions
   - Uses tokenization and word overlap analysis
   - Scoring: 30 points for strong match, 20 for moderate, 10 for some overlap

2. **Skills Match (25%)**:
   - Compares student skills with project tags and descriptions
   - Awards 5 points per matching skill (max 25 points)
   - Checks both exact matches and partial matches

3. **Field of Study Match (20%)**:
   - Compares student's preferred field with project field
   - 20 points for exact match, 10 for related fields
   - Uses ResearchPreference data if available

4. **Research Preferences Match (15%)**:
   - Interest areas alignment (8 points max)
   - Experience level matching with project duration (4 points max)
   - Goals alignment (3 points max)

5. **Tags Match (10%)**:
   - Matches project tags with research interest and intentions
   - 2 points per matching tag (max 10 points)

6. **Prior Experience Bonus (5%)**:
   - Awards 5 bonus points if student has similar past projects

#### Features

- **Smart Filtering**:
  - Excludes already applied projects
  - Excludes student's own projects
  - Minimum match score threshold of 40%

- **Text Analysis**:
  - Tokenization with stop word filtering
  - Case-insensitive matching
  - Filters out common words for better relevance

- **Match Reasons**:
  - Provides human-readable explanations for each recommendation
  - Examples: "Strong research interest alignment", "Multiple matching skills", "Matches your field of study"

- **Sorting & Limiting**:
  - Sorts by match score (highest first)
  - Returns top 10 recommendations

### 2. Data Models Used

#### Students Model
```go
type Students struct {
    Uid              string
    Institution      string
    Degree           string
    Skills           []string
    ResearchInterest string
    Intention        string
    Projects         []string
    // ... other fields
}
```

#### ResearchPreference Model
```go
type ResearchPreference struct {
    UserID          string
    FieldOfStudy    string
    ExperienceLevel string
    Goals           string
    InterestAreas   string
    // ... other fields
}
```

#### Projects Model
```go
type Projects struct {
    ProjectID      string
    Name           string
    SDesc          string
    LDesc          string
    Tags           []string
    FieldOfStudy   string
    Duration       string
    // ... other fields
}
```

### 3. Response Structure

```json
{
  "recommendations": [
    {
      "ID": 1,
      "name": "Project Name",
      "pid": "project_id",
      "sdesc": "Short description",
      "ldesc": "Long description",
      "tags": ["tag1", "tag2"],
      "fieldOfStudy": "Computer Science",
      "duration": "6 months",
      "user": {
        "uid": "prof_id",
        "name": "Professor Name",
        "email": "prof@example.com"
      },
      "match_score": 85.5,
      "match_reasons": [
        "Strong research interest alignment",
        "Multiple matching skills",
        "Matches your field of study"
      ]
    }
  ],
  "count": 10
}
```

## Frontend Implementation

### 1. API Integration (`frontend/src/api/api.ts`)

Added new function:
```typescript
export const getRecommendedProjects = async (token: string)
```

Added TypeScript interface:
```typescript
export type RecommendedProject = {
  // Project details
  name: string;
  pid: string;
  sdesc: string;
  ldesc: string;
  tags: string[];
  // Match information
  match_score: number;
  match_reasons: string[];
  // Professor info
  user: {
    name: string;
    email: string;
  };
  // ... other fields
}
```

### 2. Student Dashboard Update (`frontend/src/app/student/page.tsx`)

#### Added Features:
- Real-time recommendation fetching
- Loading states for recommendations
- Top 3 recommendations display
- Match score visualization with percentage
- Match reasons display
- Link to dedicated recommendations page

#### UI Components:
- Match score badge with star icon
- Truncated match reasons (first 2)
- Professor name display
- "View All Recommendations" button

### 3. Dedicated Recommendations Page (`frontend/src/app/student/recommendations/page.tsx`)

#### Features:
- **Complete Recommendations List**: Shows all recommended projects
- **Detailed Match Information**: 
  - Large match score display with color coding
  - Match quality labels (Excellent/Good/Fair Match)
  - All match reasons displayed as badges
  
- **Rich Project Details**:
  - Field of study
  - Duration
  - Specialization
  - Application deadline
  - Project tags
  
- **Color-Coded Match Scores**:
  - 80%+: Green (Excellent Match)
  - 60-79%: Blue (Good Match)
  - 40-59%: Yellow (Fair Match)
  
- **Empty State Handling**:
  - Prompts users to complete profile if no recommendations
  - Loading animation while fetching

- **Action Buttons**:
  - "View Details" - Navigate to project page
  - "Apply Now" - Quick apply to project

#### UI/UX Enhancements:
- Hover effects on project cards
- Responsive grid layout
- Icon-based information display
- Professional color scheme
- Smooth transitions and animations

## Routing Updates

### Backend Route
```go
// In routers/profileRouter.go
studentGroup.GET("/recommendations", handlers.GetRecommendedProjects)
```

### Frontend Routes
- Dashboard: `/student` - Shows top 3 recommendations
- Full page: `/student/recommendations` - Shows all recommendations

## Key Benefits

1. **Personalized Matching**: Uses multiple factors for accurate recommendations
2. **Explainable AI**: Provides clear reasons for each match
3. **Smart Filtering**: Avoids duplicate applications and irrelevant projects
4. **Scalable Algorithm**: Efficient text analysis and scoring
5. **User-Friendly UI**: Clear visualization of match quality
6. **Profile-Driven**: Encourages students to complete their profiles

## Usage Flow

1. Student completes profile with:
   - Skills
   - Research interests
   - Intentions
   - Past projects
   - Research preferences (optional)

2. System analyzes:
   - All active projects
   - Student's profile data
   - Application history

3. Algorithm calculates:
   - Match scores for each project
   - Reasons for each match
   - Ranks by relevance

4. Student views:
   - Top recommendations on dashboard
   - Full list on recommendations page
   - Can apply directly from recommendations

## Future Enhancements

1. **Machine Learning**: Train on successful applications to improve matching
2. **Collaborative Filtering**: "Students like you also applied to..."
3. **Time-Based Ranking**: Factor in application deadlines
4. **Feedback Loop**: Learn from student interactions with recommendations
5. **Advanced Filters**: Allow students to filter by duration, field, etc.
6. **Email Notifications**: Alert students about new matching projects
7. **Save Recommendations**: Bookmark interesting projects for later

## Testing Recommendations

To test the recommendation system:

1. Create a student account and complete profile
2. Add skills like "Machine Learning", "Data Science"
3. Set research interest to something specific
4. Create/ensure active projects exist in the system
5. Visit `/student/recommendations` to see personalized matches

## Performance Considerations

- **Caching**: Consider caching recommendations for 1-2 hours
- **Pagination**: Currently returns top 10, can be extended
- **Indexing**: Ensure database indexes on frequently queried fields
- **Async Processing**: For large datasets, consider background processing
