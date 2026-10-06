# Feels Like Summer

Feels Like Summer is a research and project matching platform built to connect students with professors, opportunities, and academic pathways in a more structured and efficient way. It helps students find relevant research work based on their profile, interests, and skills, while giving professors a cleaner way to publish projects, review applicants, and identify strong candidates. The platform also includes roadmap generation for research and placement preparation, making it more than a listing app and more like a decision support system for academic growth.

## Project snapshot

- 2 user groups: students and professors
- 1 core workflow: profile, discover, apply, track, plan
- 3 main outcomes: better matching, faster decisions, stronger academic direction

## What is built

- Student profile and academic interest tracking
- Project publishing for professors with deadlines and requirements
- Recommendation engine for project matching
- Application workflow with status handling
- Research and placement roadmap generation

## Proof of technical depth

- 5 database queries per recommendation request instead of 1000+
- 15 concurrent goroutines used for scoring eligible projects
- 5 minute TTL on recommendation cache
- Warm recommendation requests return in around 5 to 10 ms
- Cold recommendation requests return in around 200 to 400 ms
- 100+ concurrent users supported in the design target
- GORM indexes added for project, user, and request lookups

## Backend focus

- Go backend with Echo framework
- PostgreSQL database with GORM
- JWT based authentication
- Batch reads instead of N plus 1 queries
- Cache invalidation on profile updates
- Parallel scoring with semaphore controlled concurrency

## Product value

- Students find relevant projects faster
- Professors discover stronger applicants sooner
- Academic opportunities are easier to match to the right person
- Roadmaps reduce uncertainty in research and career planning

## Tech stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Go, Echo, GORM, PostgreSQL
- AI: Gemini for roadmap generation
- Auth: JWT

## Architecture

- Frontend handles dashboards, project browsing, and roadmap views
- Backend handles auth, profiles, applications, matching, and recommendation logic
- Recommendation flow: profile data -> project filtering -> score -> sort -> cache

## File structure

```text
Feels_Like_Summer/
├── Backend/
│   ├── config/
│   ├── handlers/
│   ├── interfaces/
│   ├── middleware/
│   ├── models/
│   ├── routers/
│   ├── utils/
│   ├── main.go
│   ├── go.mod
│   └── *.md
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── pnpm-lock.yaml
├── README.md
└── .gitignore
```

