-- name: CreateUser :one
insert into users (name, email, password, role)
values ($1, $2, $3, $4)
returning *;

-- name: UpdateUserProfile :one
Update users
set department = $1,
    year = $2,
    major = $3,
    research_interest = $4,
    isAvailable = $5,
    links = $6,
    skills = $7,
    updated_at = now()
where id = $8
returning *;