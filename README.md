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
- `409 Conflict`: Resource already exists (e.g., email already registered)
- `500 Internal Server Error`: Server-side error occurred


