# Feels Like Summer

## Overview
A university-level platform bridging professors, projects, and students, providing a centralized hub for project listings, roadmaps, and research opportunities.

**Importance**: Right projects → Right mentors → Right timing  
Increased student contribution and better visibility & efficiency in research ecosystems

## Major Functions
- Project Repository with filters/tags
- Mentor Availability Tracker
- Application & Selection Workflow
- Roadmap Library (self-learning pathways)
- CV Builder / Profile Manager
- Hackathon Problem Bank

## User Needs
**Students**: Need clarity, guidance, access to real opportunities  
*Outcomes*: Saves time and makes strong portfolio

**Professors**: Need efficient applicant/project management  
*Outcomes*: Focused research groups, less admin burden

## Features
- Department-wise Project Hub
- Smart Search with tags/filters
- Availability Status of professors
- Roadmaps & Resources for self-start
- Hackathon Problem Statements
- Application Workflow with CV builder
- Progress Tracking dashboard

---

## API Documentation

### Base URL
```
http://localhost:8080/v1
```

### Authentication Endpoints

#### 1. User Registration (Signup)
**Endpoint**: `POST /auth/signup`

**Description**: Creates a new user account with encrypted password storage.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "type": "stu"
}
```

**Field Descriptions**:
- `name` (string, required): Full name of the user
- `email` (string, required): Valid email address (must be unique)
- `password` (string, required): User password (will be hashed)
- `type` (string, required): User type - either "fac" (faculty) or "stu" (student)

**Success Response** (201 Created):
```json
{
  "ID": 1,
  "CreatedAt": "2025-10-10T12:00:00Z",
  "UpdatedAt": "2025-10-10T12:00:00Z",
  "DeletedAt": null,
  "userId": "a1b2c3d4e5f6",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "",
  "type": "stu"
}
```

**Error Responses**:
- `400 Bad Request`: 
  ```json
  {"error": "Invalid input"}
  ```
  or
  ```json
  {"error": "Invalid user type. Must be 'fac' or 'stu'"}
  ```
- `409 Conflict`: 
  ```json
  {"error": "User already exists"}
  ```
- `500 Internal Server Error`: 
  ```json
  {"error": "Failed to hash password"}
  ```
  or
  ```json
  {"error": "Failed to generate user ID"}
  ```
  or
  ```json
  {"error": "Database error message"}
  ```

---

#### 2. User Login
**Endpoint**: `POST /auth/login`

**Description**: Authenticates a user and returns user information upon successful login.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Field Descriptions**:
- `email` (string, required): User's registered email address
- `password` (string, required): User's password

**Success Response** (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "ID": 1,
    "CreatedAt": "2025-10-10T12:00:00Z",
    "UpdatedAt": "2025-10-10T12:00:00Z",
    "DeletedAt": null,
    "userId": "a1b2c3d4e5f6",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "",
    "type": "stu"
  }
}
```

**Error Responses**:
- `400 Bad Request`: 
  ```json
  {"error": "Invalid input"}
  ```
- `401 Unauthorized`: 
  ```json
  {"error": "Invalid credentials"}
  ```
- `500 Internal Server Error`: 
  ```json
  {"error": "Failed to generate token"}
  ```

---

#### 3. Token Refresh
**Endpoint**: `POST /auth/refresh`

**Description**: Generates a new JWT token from an existing valid token (extends token expiry).

**Headers**:
```
Authorization: Bearer <your-jwt-token>
```

**Success Response** (200 OK):
```json
{
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `401 Unauthorized`: 
  ```json
  {"error": "Authorization header required"}
  ```
  or
  ```json
  {"error": "Invalid authorization header format"}
  ```
  or
  ```json
  {"error": "Invalid or expired token"}
  ```

---

---

## JWT Authentication

### How Authentication Works
1. **Login**: Send credentials to `/auth/login` to receive a JWT token
2. **Authorization**: Include the token in the `Authorization` header for protected routes
3. **Token Format**: `Authorization: Bearer <your-jwt-token>`
4. **Token Expiry**: Tokens expire after 24 hours
5. **Refresh**: Use `/auth/refresh` to get a new token before expiry

### Token Structure
JWT tokens contain the following claims:
- `userId`: User's unique identifier
- `email`: User's email address
- `type`: User type ("fac" or "stu")
- `exp`: Token expiration time
- `iat`: Token issued at time
- `iss`: Token issuer ("feels-like-summer")

### Protected Routes
Routes that require authentication should include:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Middleware Usage (For Developers)
- **`JWTMiddleware()`**: Requires valid JWT token
- **`OptionalJWTMiddleware()`**: JWT token optional, adds user context if present
- **`RequireUserType("fac", "stu")`**: Requires specific user types

### Environment Variables
Set the following environment variable for production:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Security Features
- **Password Security**: All passwords are hashed using bcrypt with default cost
- **JWT Security**: Tokens are signed with HMAC-SHA256
- **Token Expiry**: Automatic token expiration prevents long-lived access
- **Transaction Safety**: Database transactions prevent race conditions during user creation
- **Data Privacy**: Passwords are never returned in API responses
- **Input Validation**: All requests are validated before processing
- **Unique User IDs**: Cryptographically secure user ID generation

---

## Project Management Endpoints

### Base URL for Projects
```
http://localhost:8080/v1/projects
```

All project endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

---

#### 1. Create Project (Faculty Only)
**Endpoint**: `POST /projects`

**Description**: Creates a new research project. Only faculty members can create projects.

**Authorization**: Faculty only (`type: "fac"`)

**Request Body**:
```json
{
  "name": "AI Research Project",
  "sdesc": "Machine Learning research opportunity",
  "ldesc": "Detailed description of the research project including objectives, methodology, and expected outcomes...",
  "isActive": true
}
```

**Field Descriptions**:
- `name` (string, required): Project title
- `sdesc` (string, required): Short description/summary
- `ldesc` (string, required): Detailed project description
- `isActive` (boolean, required): Whether the project is currently accepting applications

**Success Response** (201 Created):
```json
{
  "ID": 1,
  "CreatedAt": "2025-10-10T12:00:00Z",
  "UpdatedAt": "2025-10-10T12:00:00Z",
  "DeletedAt": null,
  "name": "AI Research Project",
  "pid": "proj_a1b2c3d4e5f6",
  "shortDesc": "Machine Learning research opportunity",
  "longDesc": "Detailed description...",
  "isActive": "true",
  "uid": "faculty_user_id"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input
- `403 Forbidden`: Only faculty can create projects
- `409 Conflict`: Project with this name already exists
- `500 Internal Server Error`: Server error

---

#### 2. List All Active Projects
**Endpoint**: `GET /projects`

**Description**: Retrieves all active projects with faculty information.

**Authorization**: All authenticated users

**Success Response** (200 OK):
```json
{
  "projects": [
    {
      "ID": 1,
      "CreatedAt": "2025-10-10T12:00:00Z",
      "UpdatedAt": "2025-10-10T12:00:00Z",
      "DeletedAt": null,
      "name": "AI Research Project",
      "pid": "proj_a1b2c3d4e5f6",
      "shortDesc": "Machine Learning research opportunity",
      "longDesc": "Detailed description...",
      "isActive": "true",
      "uid": "faculty_uid",
      "user": {
        "ID": 2,
        "userId": "faculty_uid",
        "name": "Dr. Jane Smith",
        "email": "jane@university.edu",
        "type": "fac"
      }
    }
  ],
  "count": 1
}
```

---

#### 3. Get My Projects
**Endpoint**: `GET /projects/my`

**Description**: Retrieves all projects belonging to the authenticated user.

**Authorization**: All authenticated users

**Success Response** (200 OK):
```json
{
  "projects": [
    {
      "ID": 1,
      "name": "My Research Project",
      "pid": "proj_xyz123",
      "shortDesc": "Short description",
      "longDesc": "Long description",
      "isActive": "true",
      "uid": "user_id"
    }
  ],
  "count": 1
}
```

---

#### 4. Get Single Project
**Endpoint**: `GET /projects/:id`

**Description**: Retrieves a specific project by its ID with faculty information.

**Authorization**: All authenticated users

**Parameters**:
- `id` (path parameter): Project ID

**Success Response** (200 OK):
```json
{
  "ID": 1,
  "name": "AI Research Project",
  "pid": "proj_a1b2c3d4e5f6",
  "shortDesc": "Short description",
  "longDesc": "Detailed description",
  "isActive": "true",
  "uid": "faculty_uid",
  "user": {
    "name": "Dr. Jane Smith",
    "email": "jane@university.edu",
    "type": "fac"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Project ID is required
- `404 Not Found`: Project not found

---

#### 5. Update Project
**Endpoint**: `PUT /projects/:id`

**Description**: Updates an existing project. Only the project owner can update it.

**Authorization**: Project owner only

**Parameters**:
- `id` (path parameter): Project ID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Project Name",
  "sdesc": "Updated short description",
  "ldesc": "Updated long description",
  "isActive": false
}
```

**Success Response** (200 OK):
```json
{
  "message": "Project updated successfully",
  "project": {
    "ID": 1,
    "name": "Updated Project Name",
    "pid": "proj_a1b2c3d4e5f6",
    "shortDesc": "Updated short description",
    "longDesc": "Updated long description",
    "isActive": "false",
    "uid": "user_id"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input or missing project ID
- `403 Forbidden`: Not authorized to edit this project
- `404 Not Found`: Project not found
- `409 Conflict`: Project name already exists

---

#### 6. Delete Project
**Endpoint**: `DELETE /projects/:id`

**Description**: Deletes a project. Only the project owner can delete it.

**Authorization**: Project owner only

**Parameters**:
- `id` (path parameter): Project ID

**Success Response** (200 OK):
```json
{
  "message": "Project deleted successfully",
  "projectId": "proj_a1b2c3d4e5f6"
}
```

**Error Responses**:
- `400 Bad Request`: Project ID is required
- `403 Forbidden`: Not authorized to delete this project
- `404 Not Found`: Project not found

---

---

## Database Schema

### Tables Overview

#### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    type VARCHAR(3) CHECK (type IN ('fac', 'stu')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**Purpose**: Stores user authentication and basic profile information.

**Fields**:
- `uid`: Unique user identifier (generated UUID)
- `name`: Full name of the user
- `email`: Email address (used for login)
- `password`: Bcrypt hashed password
- `type`: User type - "fac" (faculty) or "stu" (student)

---

#### 2. Projects Table
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_desc TEXT,
    long_desc TEXT,
    is_active VARCHAR(5) DEFAULT 'true',
    uid VARCHAR(255) NOT NULL REFERENCES users(uid),
    working_users TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**Purpose**: Stores research projects created by faculty members.

**Fields**:
- `project_id`: Unique project identifier (generated with "proj_" prefix)
- `name`: Project title
- `short_desc`: Brief project description
- `long_desc`: Detailed project description
- `is_active`: Whether project is accepting applications ("true"/"false")
- `uid`: Faculty member who created the project
- `working_users`: Array of student UIDs working on the project

---

#### 3. Students Table
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    experience TEXT,
    projects TEXT[] DEFAULT '{}',
    platform_projects INTEGER[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    activities TEXT[] DEFAULT '{}',
    resume VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**Purpose**: Stores extended profile information for student users.

**Fields**:
- `uid`: References the user's UID from users table
- `experience`: Work experience description
- `projects`: Array of personal project names
- `platform_projects`: Array of platform project IDs the student has worked on
- `skills`: Array of technical and soft skills
- `activities`: Array of extracurricular activities
- `resume`: URL link to student's resume document

---

#### 4. Project Requests Table
```sql
CREATE TABLE proj_requests (
    id SERIAL PRIMARY KEY,
    time_created TIMESTAMP NOT NULL,
    status VARCHAR(10) CHECK (status IN ('accepted', 'rejected', 'waitlisted')) DEFAULT 'waitlisted',
    uid VARCHAR(255) NOT NULL REFERENCES users(uid),
    pid VARCHAR(255) NOT NULL REFERENCES projects(project_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    UNIQUE(uid, pid)
);
```

**Purpose**: Stores student applications to projects.

**Fields**:
- `time_created`: When the application was submitted
- `status`: Application status - "waitlisted", "accepted", or "rejected"
- `uid`: Student who applied
- `pid`: Project being applied to
- Unique constraint prevents duplicate applications

---

### Relationships

1. **Users → Projects**: One-to-Many (One faculty can create many projects)
2. **Users → Students**: One-to-One (One user can have one student profile)
3. **Users → Project Requests**: One-to-Many (One student can apply to many projects)
4. **Projects → Project Requests**: One-to-Many (One project can receive many applications)
5. **Projects → Students**: Many-to-Many via `working_users` array (Students can work on multiple projects)

### Indexes

For optimal performance, consider adding these indexes:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_uid ON users(uid);
CREATE INDEX idx_projects_uid ON projects(uid);
CREATE INDEX idx_projects_project_id ON projects(project_id);
CREATE INDEX idx_students_uid ON students(uid);
CREATE INDEX idx_proj_requests_uid ON proj_requests(uid);
CREATE INDEX idx_proj_requests_pid ON proj_requests(pid);
CREATE INDEX idx_proj_requests_status ON proj_requests(status);
```

---

## Profile Management Endpoints

### Base URL for Profiles
```
http://localhost:8080/v1/profile
```

All profile endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

---

#### 1. Get Student Profile
**Endpoint**: `GET /profile/student`

**Description**: Retrieves the authenticated student's profile information.

**Authorization**: Students only (`type: "stu"`)

**Success Response** (200 OK):
```json
{
  "student": {
    "ID": 1,
    "CreatedAt": "2025-10-10T12:00:00Z",
    "UpdatedAt": "2025-10-10T12:00:00Z",
    "DeletedAt": null,
    "uid": "student_uid",
    "workEx": "2 years experience in web development",
    "projects": ["Personal Portfolio", "E-commerce Website"],
    "platformProjects": [1, 3, 5],
    "skills": ["React", "Node.js", "Python", "MongoDB"],
    "activities": ["Coding Club", "Hackathons", "Tech Conferences"],
    "resumeLink": "https://drive.google.com/file/d/abc123/view"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Only students can access student profiles
- `404 Not Found`: Student profile not found
- `500 Internal Server Error`: Database error

---

#### 2. Update Student Profile
**Endpoint**: `PUT /profile/student`

**Description**: Updates or creates a student's complete profile information.

**Authorization**: Students only (`type: "stu"`)

**Request Body**:
```json
{
  "workEx": "3 years experience in full-stack development",
  "projects": ["Personal Portfolio", "E-commerce Website", "Mobile App"],
  "platformProjects": [1, 3, 5, 7],
  "skills": ["React", "Node.js", "Python", "MongoDB", "React Native"],
  "activities": ["Coding Club", "Hackathons", "Tech Conferences", "Open Source"],
  "resumeLink": "https://drive.google.com/file/d/xyz789/view"
}
```

**Field Descriptions**:
- `workEx` (string, optional): Work experience description
- `projects` (array of strings, optional): List of personal projects
- `platformProjects` (array of numbers, optional): IDs of platform projects the student has worked on
- `skills` (array of strings, optional): Technical and soft skills
- `activities` (array of strings, optional): Extracurricular activities and achievements
- `resumeLink` (string, optional): URL link to student's resume

**Success Response** (200 OK - Profile Updated):
```json
{
  "message": "Student profile updated successfully",
  "student": {
    "ID": 1,
    "CreatedAt": "2025-10-10T12:00:00Z",
    "UpdatedAt": "2025-10-11T10:30:00Z",
    "DeletedAt": null,
    "uid": "student_uid",
    "workEx": "3 years experience in full-stack development",
    "projects": ["Personal Portfolio", "E-commerce Website", "Mobile App"],
    "platformProjects": [1, 3, 5, 7],
    "skills": ["React", "Node.js", "Python", "MongoDB", "React Native"],
    "activities": ["Coding Club", "Hackathons", "Tech Conferences", "Open Source"],
    "resumeLink": "https://drive.google.com/file/d/xyz789/view"
  }
}
```

**Success Response** (201 Created - Profile Created):
```json
{
  "message": "Student profile created successfully",
  "student": {
    "ID": 1,
    "CreatedAt": "2025-10-11T10:30:00Z",
    "UpdatedAt": "2025-10-11T10:30:00Z",
    "DeletedAt": null,
    "uid": "student_uid",
    "workEx": "3 years experience in full-stack development",
    "projects": ["Personal Portfolio", "E-commerce Website", "Mobile App"],
    "platformProjects": [1, 3, 5, 7],
    "skills": ["React", "Node.js", "Python", "MongoDB", "React Native"],
    "activities": ["Coding Club", "Hackathons", "Tech Conferences", "Open Source"],
    "resumeLink": "https://drive.google.com/file/d/xyz789/view"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Only students can update student profiles
- `500 Internal Server Error`: Failed to create/update profile

---

#### 3. Update Student Skills
**Endpoint**: `PUT /profile/student/skills`

**Description**: Updates only the skills array for a student's profile.

**Authorization**: Students only (`type: "stu"`)

**Request Body**:
```json
{
  "skills": ["React", "Vue.js", "Python", "Django", "PostgreSQL", "Docker"]
}
```

**Field Descriptions**:
- `skills` (array of strings, required): Updated list of technical and soft skills

**Success Response** (200 OK):
```json
{
  "message": "Skills updated successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Only students can update student profiles
- `404 Not Found`: Student profile not found
- `500 Internal Server Error`: Failed to update skills

---

#### 4. Update Student Resume
**Endpoint**: `PUT /profile/student/resume`

**Description**: Updates only the resume link for a student's profile.

**Authorization**: Students only (`type: "stu"`)

**Request Body**:
```json
{
  "resumeLink": "https://drive.google.com/file/d/new_resume_id/view"
}
```

**Field Descriptions**:
- `resumeLink` (string, required): URL link to the updated resume

**Success Response** (200 OK):
```json
{
  "message": "Resume link updated successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Only students can update student profiles
- `404 Not Found`: Student profile not found
- `500 Internal Server Error`: Failed to update resume link

---

#### 5. Add Platform Project to Profile
**Endpoint**: `POST /profile/student/project`

**Description**: Adds a platform project ID to the student's profile.

**Authorization**: Students only (`type: "stu"`)

**Request Body**:
```json
{
  "projectId": 5
}
```

**Field Descriptions**:
- `projectId` (number, required): ID of the platform project to add

**Success Response** (200 OK):
```json
{
  "message": "Project added to student profile successfully",
  "student": {
    "ID": 1,
    "CreatedAt": "2025-10-10T12:00:00Z",
    "UpdatedAt": "2025-10-11T10:30:00Z",
    "DeletedAt": null,
    "uid": "student_uid",
    "workEx": "3 years experience in full-stack development",
    "projects": ["Personal Portfolio", "E-commerce Website"],
    "platformProjects": [1, 3, 5],
    "skills": ["React", "Node.js", "Python", "MongoDB"],
    "activities": ["Coding Club", "Hackathons"],
    "resumeLink": "https://drive.google.com/file/d/abc123/view"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Only students can update student profiles
- `404 Not Found`: Project not found or student profile not found
- `409 Conflict`: Project already added to student profile
- `500 Internal Server Error`: Database error or failed to add project

---

## Application Management Endpoints

### Base URL for Applications
```
http://localhost:8080/v1
```

All application endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

---

#### 1. Apply to Project
**Endpoint**: `POST /projects/:id/apply`

**Description**: Allows a student to apply to a specific project.

**Authorization**: Students only (`type: "stu"`)

**Parameters**:
- `id` (path parameter): Project ID to apply to

**Success Response** (201 Created):
```json
{
  "message": "Application submitted successfully",
  "application": {
    "ID": 1,
    "CreatedAt": "2025-10-11T12:00:00Z",
    "UpdatedAt": "2025-10-11T12:00:00Z",
    "DeletedAt": null,
    "timeCreated": "2025-10-11T12:00:00Z",
    "status": "waitlisted",
    "uid": "student_uid",
    "pid": "proj_abc123"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Project ID is required
- `403 Forbidden`: Only students can apply to projects
- `404 Not Found`: Project not found or not active
- `409 Conflict`: You have already applied to this project
- `500 Internal Server Error`: Failed to submit application

---

#### 2. Get Project Applications (Faculty Only)
**Endpoint**: `GET /projects/:id/applications`

**Description**: Retrieves all applications for a specific project with student details.

**Authorization**: Faculty only (`type: "fac"`) and project owner

**Parameters**:
- `id` (path parameter): Project ID

**Success Response** (200 OK):
```json
{
  "project": {
    "ID": 1,
    "name": "AI Research Project",
    "pid": "proj_abc123",
    "shortDesc": "Machine Learning research",
    "longDesc": "Detailed description...",
    "isActive": "true",
    "uid": "faculty_uid"
  },
  "applications": [
    {
      "id": 1,
      "timeCreated": "2025-10-11T12:00:00Z",
      "status": "waitlisted",
      "uid": "student_uid_1",
      "pid": "proj_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "stu",
      "workEx": "2 years web development",
      "projects": ["Portfolio", "E-commerce"],
      "platformProjects": [1, 3],
      "skills": ["React", "Node.js", "Python"],
      "activities": ["Coding Club", "Hackathons"],
      "resumeLink": "https://drive.google.com/file/d/abc123/view"
    }
  ],
  "count": 1
}
```

**Error Responses**:
- `400 Bad Request`: Project ID is required
- `403 Forbidden`: Only faculty can view project applications
- `404 Not Found`: Project not found or you don't have permission
- `500 Internal Server Error`: Failed to fetch applications

---

#### 3. Update Application Status (Faculty Only)
**Endpoint**: `PUT /projects/:id/applications/:appId`

**Description**: Updates the status of a student's application to a project.

**Authorization**: Faculty only (`type: "fac"`) and project owner

**Parameters**:
- `id` (path parameter): Project ID
- `appId` (path parameter): Application ID

**Request Body**:
```json
{
  "status": "accepted"
}
```

**Field Descriptions**:
- `status` (string, required): New application status. Must be one of: "accepted", "rejected", "waitlisted"

**Success Response** (200 OK):
```json
{
  "message": "Application status updated successfully",
  "application": {
    "ID": 1,
    "CreatedAt": "2025-10-11T12:00:00Z",
    "UpdatedAt": "2025-10-11T13:00:00Z",
    "DeletedAt": null,
    "timeCreated": "2025-10-11T12:00:00Z",
    "status": "accepted",
    "uid": "student_uid",
    "pid": "proj_abc123"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Project ID and Application ID are required, or invalid status
- `403 Forbidden`: Only faculty can update application status
- `404 Not Found`: Project not found, you don't have permission, or application not found
- `500 Internal Server Error`: Failed to update application status

**Note**: When an application is accepted, the student is automatically added to the project's working users list.

---

#### 4. Get My Applications (Student Only)
**Endpoint**: `GET /applications/my`

**Description**: Retrieves all applications submitted by the authenticated student with project and professor details.

**Authorization**: Students only (`type: "stu"`)

**Success Response** (200 OK):
```json
{
  "applications": [
    {
      "ID": 1,
      "CreatedAt": "2025-10-11T12:00:00Z",
      "UpdatedAt": "2025-10-11T13:00:00Z",
      "DeletedAt": null,
      "timeCreated": "2025-10-11T12:00:00Z",
      "status": "accepted",
      "uid": "student_uid",
      "pid": "proj_abc123",
      "project": {
        "ID": 1,
        "name": "AI Research Project",
        "pid": "proj_abc123",
        "shortDesc": "Machine Learning research",
        "longDesc": "Detailed description...",
        "isActive": "true",
        "uid": "faculty_uid",
        "workUsers": ["student_uid"]
      },
      "professor": {
        "ID": 2,
        "uid": "faculty_uid",
        "name": "Dr. Jane Smith",
        "email": "jane@university.edu",
        "type": "fac"
      }
    }
  ],
  "count": 1
}
```

**Error Responses**:
- `403 Forbidden`: Only students can view their applications
- `500 Internal Server Error`: Failed to fetch applications

---

### Response Format
All API responses follow a consistent JSON format:
- **Success responses** include the requested data or confirmation message
- **Error responses** include an `error` field with a descriptive message
- **Timestamps** are in ISO 8601 format (UTC)

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request format or missing required fields
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., email already registered)
- `500 Internal Server Error`: Server-side error occurred

---

## API Usage Examples

### 1. Complete User Registration and Project Application Flow

#### Step 1: Register as a Student
```bash
curl -X POST http://localhost:8080/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@student.edu",
    "password": "securepassword123",
    "type": "stu"
  }'
```

#### Step 2: Login and Get Token
```bash
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@student.edu",
    "password": "securepassword123"
  }'
```

#### Step 3: Update Student Profile
```bash
curl -X PUT http://localhost:8080/v1/profile/student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "workEx": "2 years of web development experience",
    "projects": ["Personal Portfolio", "E-commerce Website"],
    "skills": ["React", "Node.js", "Python", "MongoDB"],
    "activities": ["Coding Club Member", "Hackathon Winner"],
    "resumeLink": "https://drive.google.com/file/d/abc123/view"
  }'
```

#### Step 4: Browse Available Projects
```bash
curl -X GET http://localhost:8080/v1/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 5: Apply to a Project
```bash
curl -X POST http://localhost:8080/v1/projects/proj_abc123/apply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 6: Check Application Status
```bash
curl -X GET http://localhost:8080/v1/applications/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Faculty Project Management Flow

#### Step 1: Register as Faculty
```bash
curl -X POST http://localhost:8080/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Smith",
    "email": "jane@faculty.edu",
    "password": "securepassword123",
    "type": "fac"
  }'
```

#### Step 2: Create a Project
```bash
curl -X POST http://localhost:8080/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "AI Research in Healthcare",
    "sdesc": "Machine learning applications in medical diagnosis",
    "ldesc": "This project focuses on developing machine learning models for early disease detection using medical imaging data. Students will work on data preprocessing, model training, and evaluation.",
    "isActive": true
  }'
```

#### Step 3: View Project Applications
```bash
curl -X GET http://localhost:8080/v1/projects/proj_abc123/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 4: Accept/Reject Applications
```bash
curl -X PUT http://localhost:8080/v1/projects/proj_abc123/applications/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "accepted"
  }'
```

### 3. Error Handling Examples

#### Invalid Authentication
```json
{
  "error": "Authorization header required"
}
```

#### Insufficient Permissions
```json
{
  "error": "Only faculty can create projects"
}
```

#### Duplicate Application
```json
{
  "error": "You have already applied to this project"
}
```

#### Validation Error
```json
{
  "error": "Invalid user type. Must be 'fac' or 'stu'"
}
```

---

## Best Practices

### 1. Authentication
- Always include the `Authorization: Bearer <token>` header for protected routes
- Refresh tokens before they expire (24-hour expiry)
- Store tokens securely (not in localStorage for production)
- Handle 401 responses by redirecting to login

### 2. Request Format
- Always set `Content-Type: application/json` header for POST/PUT requests
- Validate input on the client side before sending requests
- Handle network errors gracefully
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)

### 3. Response Handling
- Always check HTTP status codes before processing response data
- Handle all documented error responses
- Parse JSON responses safely
- Implement retry logic for 5xx errors

### 4. Data Management
- Cache frequently accessed data (like project lists)
- Implement pagination for large datasets (future enhancement)
- Validate user permissions before showing UI elements
- Keep local state synchronized with server state

### 5. Security Considerations
- Never log or store passwords in plain text
- Use HTTPS in production
- Implement rate limiting on client side
- Validate all user inputs
- Use secure storage for sensitive data

---

## Rate Limiting

### Current Implementation
- No rate limiting currently implemented
- Recommended for production deployment

### Suggested Limits
- Authentication endpoints: 5 requests per minute per IP
- Profile endpoints: 30 requests per minute per user
- Project endpoints: 60 requests per minute per user
- Application endpoints: 10 requests per minute per user

---

## Deployment Considerations

### Environment Variables
```bash
# Required
JWT_SECRET=your-super-secret-jwt-signing-key
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=feels_like_summer

# Optional
PORT=8080
ENV=production
```

### Database Setup
1. Create PostgreSQL database
2. Run migrations (GORM auto-migrate)
3. Set up proper indexes for performance
4. Configure backup strategies

### Security Headers
Recommended headers for production:
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Problem Statements Management Endpoints

### Base URL for Problem Statements
```
http://localhost:8080/v1/problem-statements
```

The Problem Statements API provides access to hackathon problem statements and coding challenges. **Summary information is publicly accessible, but full details are only revealed when specifically requested.**

---

#### 1. List All Problem Statements (Summary View)
**Endpoint**: `GET /problem-statements`

**Description**: Retrieves all problem statements with summary information only. Full descriptions are hidden until specifically requested.

**Authorization**: Public (no authentication required)

**Success Response** (200 OK):
```json
{
  "problemStatements": [
    {
      "id": 1,
      "psid": "ps_a1b2c3d4e5f6",
      "shortDesc": "Smart Traffic Management System",
      "theme": "Smart Cities",
      "category": "IoT & AI",
      "organization": "City Planning Department",
      "createdAt": "2025-10-11T12:00:00Z"
    },
    {
      "id": 2,
      "psid": "ps_b2c3d4e5f6a7",
      "shortDesc": "Sustainable Energy Monitor",
      "theme": "Green Technology",
      "category": "Hardware & Software",
      "organization": "Environmental Agency",
      "createdAt": "2025-10-11T13:00:00Z"
    }
  ],
  "count": 2
}
```

**Note**: The `longDesc` field (full problem description) is intentionally excluded from this endpoint to maintain privacy until users show specific interest.

**Error Responses**:
- `500 Internal Server Error`: Failed to fetch problem statements

---

#### 2. Get Problem Statement Details
**Endpoint**: `GET /problem-statements/:id`

**Description**: Retrieves full details of a specific problem statement, including the complete description and uploader information. This endpoint reveals all information when a user clicks on a specific problem.

**Authorization**: Public (no authentication required)

**Parameters**:
- `id` (path parameter): Problem Statement ID (can be numeric ID or PSID like "ps_abc123")

**Success Response** (200 OK):
```json
{
  "id": 1,
  "psid": "ps_a1b2c3d4e5f6",
  "shortDesc": "Smart Traffic Management System",
  "longDesc": "Design an AI-powered system to optimize traffic flow in urban areas using real-time data from sensors and cameras. The solution should reduce congestion by 30% and improve emergency vehicle response times. Requirements include: 1) Real-time traffic monitoring, 2) Predictive analytics for congestion, 3) Integration with existing traffic infrastructure, 4) Mobile app for citizens, 5) Dashboard for traffic controllers. Expected deliverables: Working prototype, documentation, and presentation.",
  "theme": "Smart Cities",
  "category": "IoT & AI",
  "organization": "City Planning Department",
  "createdAt": "2025-10-11T12:00:00Z",
  "updatedAt": "2025-10-11T12:00:00Z",
  "uploader": {
    "name": "Dr. Jane Smith",
    "email": "jane@university.edu",
    "type": "fac"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Problem statement ID is required
- `404 Not Found`: Problem statement not found
- `500 Internal Server Error`: Failed to fetch problem statement

---

#### 3. Search Problem Statements by Category
**Endpoint**: `GET /problem-statements/search?category=categoryName`

**Description**: Retrieves problem statements filtered by category with summary information only.

**Authorization**: Public (no authentication required)

**Query Parameters**:
- `category` (required): Category to filter by (case-insensitive partial match)

**Example Request**:
```
GET /problem-statements/search?category=AI
```

**Success Response** (200 OK):
```json
{
  "problemStatements": [
    {
      "id": 1,
      "psid": "ps_a1b2c3d4e5f6",
      "shortDesc": "Smart Traffic Management System",
      "theme": "Smart Cities",
      "category": "IoT & AI",
      "organization": "City Planning Department",
      "createdAt": "2025-10-11T12:00:00Z"
    }
  ],
  "category": "AI",
  "count": 1
}
```

**Error Responses**:
- `400 Bad Request`: Category parameter is required
- `500 Internal Server Error`: Failed to fetch problem statements

---

#### 4. Create Problem Statement
**Endpoint**: `POST /problem-statements`

**Description**: Creates a new problem statement. Available to all authenticated users.

**Authorization**: All authenticated users

**Request Body**:
```json
{
  "shortDesc": "Blockchain Voting System",
  "longDesc": "Develop a secure, transparent, and tamper-proof voting system using blockchain technology. The system should ensure voter anonymity while maintaining vote integrity. Requirements: 1) Voter authentication system, 2) Secure ballot casting, 3) Real-time vote counting, 4) Audit trail, 5) Mobile and web interfaces. Deliverables: Working blockchain implementation, security analysis, user interface, and deployment guide.",
  "theme": "Digital Democracy",
  "category": "Blockchain & Security",
  "organization": "Election Commission"
}
```

**Field Descriptions**:
- `shortDesc` (string, required): Brief problem title/summary
- `longDesc` (string, required): Detailed problem description with requirements and deliverables
- `theme` (string, required): Overall theme or domain of the problem
- `category` (string, required): Technical category or field
- `organization` (string, optional): Organization that posed the problem

**Success Response** (201 Created):
```json
{
  "message": "Problem statement created successfully",
  "problemStatement": {
    "ID": 3,
    "CreatedAt": "2025-10-11T14:00:00Z",
    "UpdatedAt": "2025-10-11T14:00:00Z",
    "DeletedAt": null,
    "psid": "ps_c3d4e5f6a7b8",
    "shortDesc": "Blockchain Voting System",
    "longDesc": "Develop a secure, transparent, and tamper-proof voting system...",
    "theme": "Digital Democracy",
    "category": "Blockchain & Security",
    "uploadedBy": "user_uid_123",
    "organization": "Election Commission"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body or missing required fields
- `401 Unauthorized`: User not authenticated
- `409 Conflict`: Problem statement with this title already exists for this user
- `500 Internal Server Error`: Failed to create problem statement

---

#### 5. Get My Problem Statements
**Endpoint**: `GET /problem-statements/my`

**Description**: Retrieves all problem statements created by the authenticated user with full details.

**Authorization**: All authenticated users

**Success Response** (200 OK):
```json
{
  "problemStatements": [
    {
      "ID": 1,
      "CreatedAt": "2025-10-11T12:00:00Z",
      "UpdatedAt": "2025-10-11T12:00:00Z",
      "DeletedAt": null,
      "psid": "ps_a1b2c3d4e5f6",
      "shortDesc": "Smart Traffic Management System",
      "longDesc": "Design an AI-powered system to optimize traffic flow...",
      "theme": "Smart Cities",
      "category": "IoT & AI",
      "uploadedBy": "user_uid_123",
      "organization": "City Planning Department"
    }
  ],
  "count": 1
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Failed to fetch problem statements

---

#### 6. Update Problem Statement
**Endpoint**: `PUT /problem-statements/:id`

**Description**: Updates an existing problem statement. Only the owner can update their problem statements.

**Authorization**: Problem owner only

**Parameters**:
- `id` (path parameter): Problem Statement ID (numeric ID or PSID)

**Request Body** (all fields optional):
```json
{
  "shortDesc": "Updated Smart Traffic Management System",
  "longDesc": "Updated detailed description with new requirements...",
  "theme": "Smart Cities 2.0",
  "category": "AI & Machine Learning",
  "organization": "Updated Organization Name"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Problem statement updated successfully",
  "problemStatement": {
    "ID": 1,
    "CreatedAt": "2025-10-11T12:00:00Z",
    "UpdatedAt": "2025-10-11T15:00:00Z",
    "DeletedAt": null,
    "psid": "ps_a1b2c3d4e5f6",
    "shortDesc": "Updated Smart Traffic Management System",
    "longDesc": "Updated detailed description with new requirements...",
    "theme": "Smart Cities 2.0",
    "category": "AI & Machine Learning",
    "uploadedBy": "user_uid_123",
    "organization": "Updated Organization Name"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body or missing problem statement ID
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: You can only update your own problem statements
- `404 Not Found`: Problem statement not found
- `500 Internal Server Error`: Failed to update problem statement

---

#### 7. Delete Problem Statement
**Endpoint**: `DELETE /problem-statements/:id`

**Description**: Deletes a problem statement. Owners can delete their own problem statements, and faculty can delete any problem statement.

**Authorization**: Problem owner or faculty members

**Parameters**:
- `id` (path parameter): Problem Statement ID (numeric ID or PSID)

**Success Response** (200 OK):
```json
{
  "message": "Problem statement deleted successfully",
  "psid": "ps_a1b2c3d4e5f6"
}
```

**Error Responses**:
- `400 Bad Request`: Problem statement ID is required
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: You can only delete your own problem statements
- `404 Not Found`: Problem statement not found
- `500 Internal Server Error`: Failed to delete problem statement

---

### Problem Statement Categories

Common categories include:
- **AI & Machine Learning**: Artificial intelligence, neural networks, computer vision
- **IoT & Hardware**: Internet of Things, embedded systems, sensor networks
- **Blockchain & Security**: Cryptography, distributed systems, cybersecurity
- **Web & Mobile Development**: Frontend, backend, mobile applications
- **Data Science & Analytics**: Big data, data visualization, statistical analysis
- **Green Technology**: Sustainability, renewable energy, environmental solutions
- **Healthcare & Biotech**: Medical devices, health informatics, biotechnology
- **Fintech**: Financial technology, payment systems, investment platforms
- **Education Technology**: E-learning, educational tools, student management
- **Smart Cities**: Urban planning, traffic management, public services

### Problem Statement Themes

Popular themes include:
- **Smart Cities**: Urban innovation and city management solutions
- **Digital Health**: Healthcare technology and medical innovations
- **Sustainable Development**: Environmental and sustainability challenges
- **Financial Inclusion**: Banking and financial access solutions
- **Education for All**: Educational accessibility and learning tools
- **Digital Democracy**: Governance and civic engagement platforms
- **Agriculture Tech**: Farming and food security innovations
- **Disaster Management**: Emergency response and crisis management
- **Transportation**: Mobility and logistics solutions
- **Energy Efficiency**: Power management and optimization

---

## Database Schema Updates

### Problem Statements Table
```sql
CREATE TABLE problem_statements (
    id SERIAL PRIMARY KEY,
    psid VARCHAR(255) UNIQUE NOT NULL,
    ps_title VARCHAR(255) NOT NULL,
    ps_long_desc TEXT NOT NULL,
    theme VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL REFERENCES users(uid),
    organization VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

**Purpose**: Stores hackathon problem statements and coding challenges.

**Fields**:
- `psid`: Unique problem statement identifier (generated with "ps_" prefix)
- `ps_title`: Brief problem title (mapped to shortDesc in API)
- `ps_long_desc`: Detailed problem description with requirements
- `theme`: Overall theme or domain of the problem
- `category`: Technical category or field
- `uploaded_by`: User who created the problem statement
- `organization`: Organization that posed the problem (optional)

**Indexes**:
```sql
CREATE INDEX idx_problem_statements_uploaded_by ON problem_statements(uploaded_by);
CREATE INDEX idx_problem_statements_category ON problem_statements(category);
CREATE INDEX idx_problem_statements_theme ON problem_statements(theme);
CREATE INDEX idx_problem_statements_psid ON problem_statements(psid);
```

---

## API Usage Examples - Problem Statements

### 1. Browse and Explore Problem Statements Flow

#### Step 1: Browse All Problem Statements (Summary View)
```bash
curl -X GET http://localhost:8080/v1/problem-statements
```

#### Step 2: Filter by Category
```bash
curl -X GET "http://localhost:8080/v1/problem-statements/search?category=AI"
```

#### Step 3: Get Full Details (When User Clicks)
```bash
curl -X GET http://localhost:8080/v1/problem-statements/ps_a1b2c3d4e5f6
```

### 2. Create and Manage Problem Statements Flow

#### Step 1: Login and Get Token
```bash
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@hackathon.com",
    "password": "securepassword"
  }'
```

#### Step 2: Create Problem Statement
```bash
curl -X POST http://localhost:8080/v1/problem-statements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "shortDesc": "AI-Powered Healthcare Diagnosis",
    "longDesc": "Develop an AI system that can analyze medical images and patient data to assist doctors in early disease detection. The system should process X-rays, MRIs, and lab results to provide diagnostic suggestions with confidence scores. Requirements: 1) Medical image processing, 2) Machine learning model training, 3) Integration with hospital systems, 4) Compliance with medical data privacy, 5) User-friendly interface for medical staff.",
    "theme": "Digital Health",
    "category": "AI & Machine Learning",
    "organization": "Regional Medical Center"
  }'
```

#### Step 3: View Your Problem Statements
```bash
curl -X GET http://localhost:8080/v1/problem-statements/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 4: Update Problem Statement
```bash
curl -X PUT http://localhost:8080/v1/problem-statements/ps_abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "shortDesc": "Updated AI Healthcare Diagnosis System",
    "longDesc": "Updated description with additional requirements..."
  }'
```

### 3. Privacy-First Design

The Problem Statements API follows a **privacy-first approach**:

1. **Public Summary**: Anyone can see problem titles, themes, and categories
2. **Protected Details**: Full descriptions are only revealed when specifically requested
3. **Owner Control**: Only creators can modify their problem statements
4. **Faculty Override**: Faculty members can delete any inappropriate content

This design allows for:
- **Open Discovery**: Users can browse and find interesting problems
- **Content Protection**: Full details remain private until there's genuine interest
- **Quality Control**: Faculty oversight ensures appropriate content
- **User Ownership**: Creators maintain control over their contributions

---


### Future Versions
- Pagination support
- Advanced filtering and searching
- Real-time notifications
- File upload endpoints
- Batch operations


