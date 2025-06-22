-- name: CreateUser :one
insert into users (name, email, password, department, year, major, research_interest, role, isAvailable, links, skills)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
returning *;

-- name: GetUserByEmail :one
select * from users where email = $1;