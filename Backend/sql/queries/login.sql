-- name: GetUserByEmail :one
Select * from Users where email = $1 Limit 1;