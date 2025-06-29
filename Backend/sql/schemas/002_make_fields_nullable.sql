-- +goose Up
ALTER TABLE users
ALTER COLUMN research_interest DROP NOT NULL;

-- +goose Down
ALTER TABLE users
ALTER COLUMN research_interest SET NOT NULL;
