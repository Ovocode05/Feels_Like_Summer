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
http://localhost:8080/api/v1
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
http://localhost:8080/api/v1/projects
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

### Database Schema

#### Projects Table
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_desc TEXT,
    long_desc TEXT,
    is_active VARCHAR(5) DEFAULT 'true',
    uid VARCHAR(255) NOT NULL REFERENCES users(uid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

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


