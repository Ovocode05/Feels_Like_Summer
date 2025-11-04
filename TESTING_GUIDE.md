# Recommendation System Testing Guide

## Test Scenarios

### Scenario 1: Machine Learning Student

#### Student Profile
```json
{
  "uid": "stu_001",
  "name": "Alice Johnson",
  "skills": ["Python", "TensorFlow", "Machine Learning", "Data Analysis"],
  "researchInterest": "Deep learning applications in healthcare and medical imaging",
  "intention": "Pursuing PhD in AI/ML",
  "institution": "Stanford University",
  "degree": "MS Computer Science",
  "projects": ["Image classification system", "Medical data analysis"]
}
```

#### Research Preferences
```json
{
  "field_of_study": "Computer Science",
  "experience_level": "Intermediate",
  "interest_areas": "Neural networks, Computer vision, Healthcare AI",
  "goals": "Publish research papers and build practical ML systems",
  "time_commitment": 20
}
```

#### Expected Matches (High Score)
1. **AI-Powered Medical Diagnosis** (90%+)
   - Strong research interest alignment
   - Multiple matching skills (Python, TensorFlow, ML)
   - Matches field of study
   - Similar to past projects

2. **Deep Learning for Radiology** (85%+)
   - Moderate research interest match
   - Multiple matching skills
   - Aligns with healthcare interest

3. **Neural Networks for Drug Discovery** (75%+)
   - Relevant skills match
   - Related field of study
   - Aligns with learning preferences

#### Expected Matches (Low Score - Should Not Appear)
- **Quantum Computing Research** (30%) - Different field
- **Theoretical Mathematics** (20%) - No skill overlap

---

### Scenario 2: Quantum Computing Enthusiast

#### Student Profile
```json
{
  "uid": "stu_002",
  "name": "Bob Chen",
  "skills": ["Quantum Mechanics", "Python", "Qiskit", "Linear Algebra"],
  "researchInterest": "Quantum algorithms and quantum machine learning",
  "intention": "Research career in quantum computing",
  "institution": "MIT",
  "degree": "MS Physics",
  "projects": ["Quantum circuit optimization"]
}
```

#### Research Preferences
```json
{
  "field_of_study": "Physics",
  "experience_level": "Advanced",
  "interest_areas": "Quantum algorithms, Quantum cryptography",
  "goals": "Develop novel quantum algorithms",
  "time_commitment": 30
}
```

#### Expected Matches (High Score)
1. **Quantum Machine Learning** (95%+)
   - Strong research interest alignment
   - Multiple matching skills
   - Matches field of study
   - Advanced level suitable for longer project

2. **Quantum Algorithm Optimization** (88%+)
   - Moderate research interest match
   - Relevant skills
   - Similar to past projects

---

### Scenario 3: Beginner Data Science Student

#### Student Profile
```json
{
  "uid": "stu_003",
  "name": "Carol Martinez",
  "skills": ["Python", "Pandas", "SQL", "Statistics"],
  "researchInterest": "Data analysis for social sciences and public policy",
  "intention": "Work in data analytics",
  "institution": "UC Berkeley",
  "degree": "BS Statistics",
  "projects": []
}
```

#### Research Preferences
```json
{
  "field_of_study": "Statistics",
  "experience_level": "Beginner",
  "interest_areas": "Data visualization, Statistical analysis, Public policy",
  "goals": "Learn practical data science skills",
  "time_commitment": 10
}
```

#### Expected Matches (High Score)
1. **Public Health Data Analysis** (82%+)
   - Strong research interest alignment (social sciences)
   - Matching skills (Python, SQL)
   - Beginner-friendly (short duration)

2. **Survey Data Analysis Project** (75%+)
   - Moderate research interest match
   - Relevant skills (Statistics, Pandas)
   - Appropriate duration

---

## API Testing

### Test 1: Get Recommendations (Authenticated Student)

```bash
# Using curl
curl -X GET http://localhost:8080/v1/profile/student/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "recommendations": [
    {
      "ID": 1,
      "CreatedAt": "2024-01-15T10:00:00Z",
      "name": "AI-Powered Medical Diagnosis",
      "pid": "proj_abc123",
      "sdesc": "Develop ML models for disease diagnosis",
      "ldesc": "This project focuses on creating deep learning systems...",
      "tags": ["Machine Learning", "Healthcare", "Python", "TensorFlow"],
      "fieldOfStudy": "Computer Science",
      "duration": "6 months",
      "user": {
        "uid": "prof_xyz",
        "name": "Dr. Sarah Smith",
        "email": "sarah.smith@university.edu",
        "type": "fac"
      },
      "match_score": 92.5,
      "match_reasons": [
        "Strong research interest alignment",
        "Multiple matching skills",
        "Matches your field of study",
        "Similar to your past projects"
      ]
    }
  ],
  "count": 8
}
```

### Test 2: No Profile Completed

```bash
curl -X GET http://localhost:8080/v1/profile/student/recommendations \
  -H "Authorization: Bearer NEW_STUDENT_TOKEN"
```

**Expected Response:**
```json
{
  "error": "Student profile not found. Please complete your profile first."
}
```

### Test 3: Professor Trying to Access

```bash
curl -X GET http://localhost:8080/v1/profile/student/recommendations \
  -H "Authorization: Bearer PROFESSOR_TOKEN"
```

**Expected Response:**
```json
{
  "error": "Only students can get recommendations"
}
```

### Test 4: Unauthenticated Request

```bash
curl -X GET http://localhost:8080/v1/profile/student/recommendations
```

**Expected Response:**
```json
{
  "error": "User not authenticated"
}
```

---

## Frontend Testing

### Test 1: Dashboard View

1. Navigate to `/student`
2. Verify top 3 recommendations are displayed
3. Check match scores are shown as percentages
4. Verify match reasons are truncated to 2
5. Click "View All Recommendations" button

**Expected Result:**
- 3 project cards with match scores
- Professor names displayed
- Smooth navigation to recommendations page

### Test 2: Recommendations Page

1. Navigate to `/student/recommendations`
2. Verify all recommendations are displayed
3. Check color coding of match scores:
   - Green for 80%+
   - Blue for 60-79%
   - Yellow for 40-59%
4. Verify all match reasons are shown as badges
5. Check project details are displayed correctly
6. Test "View Details" and "Apply Now" buttons

**Expected Result:**
- Full list of recommendations
- Proper color coding
- All information visible
- Buttons navigate correctly

### Test 3: Empty State

1. Create new student account
2. Don't complete profile
3. Navigate to `/student/recommendations`

**Expected Result:**
- Empty state message displayed
- "Complete Your Profile" button shown
- Button links to profile page

### Test 4: Loading State

1. Navigate to `/student/recommendations`
2. Observe loading animation
3. Wait for recommendations to load

**Expected Result:**
- Spinner animation displayed
- "Finding the best projects for you..." message
- Smooth transition to recommendations

---

## Database Verification

### Check Student Profile
```sql
SELECT * FROM students WHERE uid = 'stu_001';
```

### Check Available Projects
```sql
SELECT 
  project_id, 
  name, 
  field_of_study, 
  tags, 
  is_active 
FROM projects 
WHERE is_active = true;
```

### Check Student Applications
```sql
SELECT 
  p_id, 
  status, 
  time_created 
FROM proj_requests 
WHERE uid = 'stu_001';
```

### Check Research Preferences
```sql
SELECT 
  field_of_study,
  experience_level,
  interest_areas,
  goals
FROM research_preferences
WHERE user_id = 'stu_001';
```

---

## Performance Testing

### Test 1: Response Time
```bash
# Measure API response time
time curl -X GET http://localhost:8080/v1/profile/student/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o /dev/null -s
```

**Expected:** < 500ms for 100 projects

### Test 2: Large Dataset
- Create 500+ active projects
- Ensure response time remains acceptable
- Verify top 10 results are returned

### Test 3: Concurrent Requests
```bash
# Run 10 concurrent requests
for i in {1..10}; do
  curl -X GET http://localhost:8080/v1/profile/student/recommendations \
    -H "Authorization: Bearer YOUR_TOKEN" &
done
```

**Expected:** All requests complete successfully

---

## Edge Cases

### Edge Case 1: Student with No Skills
- Should still get recommendations based on research interest
- Lower match scores expected

### Edge Case 2: All Projects Already Applied
- Should return empty recommendations
- Proper message displayed

### Edge Case 3: Very Generic Profile
- Research interest: "Computer Science"
- Skills: ["Programming"]
- Should get lower match scores but still some results

### Edge Case 4: Highly Specific Profile
- Very narrow research interest
- Specialized skills
- May get few but highly relevant recommendations

---

## Match Score Validation

### Validate Scoring Logic

```javascript
// Example validation in frontend
const validateMatchScore = (recommendation) => {
  const score = recommendation.match_score;
  const reasons = recommendation.match_reasons;
  
  // Score should be between 40 and 100
  console.assert(score >= 40 && score <= 100, "Invalid match score");
  
  // Should have at least one reason
  console.assert(reasons.length > 0, "No match reasons provided");
  
  // Higher scores should have more reasons
  if (score >= 80) {
    console.assert(reasons.length >= 3, "High score with few reasons");
  }
};
```

### Test Different Score Ranges

1. **90-100% (Excellent):**
   - Should have 4+ match reasons
   - Most criteria met

2. **70-89% (Good):**
   - Should have 3+ match reasons
   - Several criteria met

3. **50-69% (Fair):**
   - Should have 2+ match reasons
   - Some criteria met

4. **40-49% (Marginal):**
   - Should have 1+ match reasons
   - Minimal criteria met

---

## Integration Testing Checklist

- [ ] Student can view recommendations on dashboard
- [ ] Student can navigate to full recommendations page
- [ ] Match scores are calculated correctly
- [ ] Match reasons are displayed properly
- [ ] Already applied projects are filtered out
- [ ] Student's own projects are filtered out
- [ ] Inactive projects are not recommended
- [ ] Professor information is displayed correctly
- [ ] "View Details" button navigates to project page
- [ ] "Apply Now" button works correctly
- [ ] Empty state is shown when no recommendations
- [ ] Loading state is displayed while fetching
- [ ] Color coding matches score ranges
- [ ] All project details are displayed
- [ ] Tags are shown correctly
- [ ] Deadline dates are formatted properly

---

## Manual Test Script

### Complete Test Flow

1. **Setup:**
   - Start backend server: `go run main.go`
   - Start frontend: `pnpm run dev`
   - Create test database with sample data

2. **Create Student Account:**
   - Register as student
   - Verify email
   - Login

3. **Complete Profile:**
   - Add skills: ["Python", "Machine Learning", "Data Science"]
   - Set research interest: "AI for healthcare"
   - Add past projects
   - Save profile

4. **Set Research Preferences:**
   - Navigate to preferences page
   - Set field: "Computer Science"
   - Set experience: "Intermediate"
   - Set interests: "Deep learning, Medical imaging"
   - Save preferences

5. **View Dashboard:**
   - Navigate to `/student`
   - Verify 3 recommendations appear
   - Check match scores
   - Read match reasons

6. **View All Recommendations:**
   - Click "View All Recommendations"
   - Verify full list appears
   - Check color coding
   - View project details

7. **Apply to Project:**
   - Click "View Details" on a recommendation
   - Fill application form
   - Submit application

8. **Verify Filtering:**
   - Return to recommendations page
   - Verify applied project no longer appears
   - Check other recommendations still show

---

## Success Criteria

✅ **Algorithm Performance:**
- Match scores are logical and consistent
- Higher scored projects are more relevant
- Match reasons accurately describe why project matches

✅ **User Experience:**
- Recommendations load quickly (< 1 second)
- UI is responsive and intuitive
- Empty/loading states work correctly

✅ **Data Accuracy:**
- All project information is correct
- Professor details are accurate
- Applied projects are properly filtered

✅ **Business Logic:**
- Only students can access recommendations
- Profile completion is enforced
- Minimum match threshold is respected

✅ **Edge Cases Handled:**
- No profile completed
- All projects applied
- No active projects
- Unauthenticated access
