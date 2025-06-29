-- +goose Up
create table Users (
    id UUID primary key,
    Name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    year INT CHECK (year > 0 AND year <= 4),
    major VARCHAR(50),
    research_interest VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'prof')),
    is_available BOOLEAN DEFAULT true,
    links JSONB,
    skills JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- +goose Down
drop table Users;