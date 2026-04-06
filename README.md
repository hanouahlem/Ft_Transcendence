*This project has been created as part of the 42 curriculum by ahbey, manbengh, wlarbi-a, cumoncoq, nabboud.*

# ft_transcendence

Full-stack 42 group project built with:

- Next.js frontend on port `3000`
- Express + Prisma backend on port `3001`
- PostgreSQL on port `5432`

## Project Structure

- `frontend/`: Next.js app, pages, and UI components
- `backend/`: Express API, Prisma client, controllers, middleware, and uploads
- `docker-compose.yml`: local Docker stack
- `Makefile`: common Docker and local run commands

## Current Features

- user registration and login with JWT auth
- protected current-user route
- friends search, add, accept, delete, and pending requests
- posts feed with create, delete, like, and unlike
- media upload support for posts

## Prerequisites

- Docker and Docker Compose
- Node.js v20.20.0 or higher
- npm

## Quick Start

Docker:

```bash
make up
```

Useful commands:

```bash
make down
make logs
make ps
make db
```

## Environment

- local backend env lives in `backend/.env`
- backend template lives in `backend/.env.example`
- optional frontend template lives in `frontend/.env.local.example`
- detailed setup notes live in `DEV_DOCS.md`

## Main Docs

- `DEV_DOCS.md`: environment setup and run modes
- `other/transcendance.md`: 42 subject and requirements
- `other/lessons/`: team learning notes
- `AGENTS.md`: project-specific working conventions

---
# Notes

## serveur frontend 

cd frontend -> npm run dev == serveur qui affiche les pages

## serveur back

cd backend -> npm run dev == serveur qui recois les info du front et lui renvoi 

## Tools

//view the databases by browser//

Prisma studio : 
docker compose up -d
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma studio


--------------------------------------------------------------------------------------



*This project has been created as part of the 42 curriculum by ahbey, manbengh, wlarbi-a, cumoncoq, nabboud.*

# Description

Full-stack 42 group project — a social network web application built with Next.js, Express, Prisma and PostgreSQL.

### Key features

- User registration and login with JWT auth
- Friends system (search, add, accept, delete, pending requests)
- Posts feed (create, delete, like, unlike)
- Media upload support for posts

# Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js v20.20.0 or higher
- npm

### Installation

1. Clone the repository
```bash
git clone <Url_repo> ft_transcendence
cd ft_transcendence
```

2. Set up environment variables
```bash
cp backend/.env.example backend/.env
```

3. Fill in the required variables in `backend/.env`

### Running the project

Docker:
```bash
make up
```

Useful commands:
```bash
make down
make logs
make ps
make db
```

### Environment setup

- Local backend env lives in `backend/.env`
- Backend template lives in `backend/.env.example`
- Optional frontend template lives in `frontend/.env.local.example`
- Detailed setup notes live in `DEV_DOCS.md`

# Resources

- https://docs.astro.build/fr/guides/backend/prisma-postgres/
- https://laconsole.dev/formations/express/middlewares
- https://nodemailer.com/




### AI usage

# Team Information

| Login | Role | Responsibilities |
|-------|------|-----------------|
| ahbey | | |
| manbengh | | |
| wlarbi-a | | |
| cumoncoq | | |
| nabboud | | |

# Project Management

### Work organization

The team met 2 to 3 times per week to track progress, align on frontend pages design,
discuss new modules to add, and help each other fix bugs. At the beginning of each week, tasks were distributed and each member was assigned a mission for the days ahead.
The project idea (a social network) and the choice of modules were decided collectively,
with each member sharing their opinion.

### Tools used
- GitHub for version control and work distribution

### Communication channels

- Discord (private group with all team members)

# Technical Stack


### Frontend

- Next.js (port `3000`)
- React with TypeScript
- TailwindCSS for styling
- ESLint for code quality

### Backend

- Express (port `3001`)
- Node.js
- Prisma ORM
- JWT authentication
- Middleware for request handling

### Database

- PostgreSQL (port `5432`)

### Other libraries

- Nodemailer (email notifications)
- Prisma Studio (database visualization)
- Docker & Docker Compose (containerization)

### Justification of technical choices

- **Next.js**: Full-stack framework with built-in API routes, SSR capabilities, and excellent TypeScript support
- **Express**: Lightweight, flexible Node.js framework with extensive middleware ecosystem
- **Prisma**: Modern ORM providing type-safe database queries with auto-generated client
- **PostgreSQL**: Reliable, open-source relational database with strong ACID compliance
- **TypeScript**: Adds type safety and improves code maintainability
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **JWT**: Stateless authentication mechanism, ideal for API-based applications
- **Docker**: Ensures consistency across development, testing, and production environments

# Database Schema

# Features List

| Feature | Description | Implemented by |
|---------|-------------|----------------|
| User registration and login | JWT authentication | ahbey |
| Protected current-user route | | |
| Friends system | Search, add, accept, delete, pending requests | manbengh|
| Posts feed | Create, delete, like, unlike | nabboud |
| Media upload | Upload support for posts | nabboud |

# Modules


**Total: pts**

# Individual Contributions

### ahbey

### manbengh

### wlarbi-a

### cumoncoq

### nabboud