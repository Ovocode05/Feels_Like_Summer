-- name: CreateUser :one
Insert into Users (id, Name, email, password, role)
values ($1, $2, $3, $4, $5)
returning *;

-- name: UpdateUserProfile :one
Update Users
set department = $1,
    year = $2,
    major = $3,
    research_interest = $4,
    is_available = $5,
    links = $6,
    skills = $7,
    updated_at = now()
where email = $8
returning *;