-- +goose Up
create table users (
    id serial primary key,
    name varchar(100) not null,
    email varchar(100) not null unique,
    password varchar(255) not null,
    department varchar(100),
    year int check (year > 0 and year <= 4),
    major varchar(50),
    research_interest varchar(255) not null,
    role varchar(20) not null check (role in ('student', 'prof')),
    isAvailable boolean,
    links JSONB,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    skills JSONB
);

-- +goose Down
drop table if exists users;
