*This project has been created as part of the 42 curriculum by ahbey, manbengh, wlarbi-a, cumoncoq, nabboud.*

# ft_transcendence

## Description

This project is a full-stack web application developed as part of the 42 curriculum. It is a social network platform where users can create an account, customize their profile, and interact with others, users can publish posts with images, like and comment on content, and communicate through a real-time chat system using WebSockets. A friends system allows users to connect with each other, while notifications keep them informed about interactions.

---

## Team Information and Roles

| Login    | Role                 | Responsibilities                                |
|----------|----------------------|-------------------------------------------------|
| manbengh | PO, Developer        | Public API, notifications                       |
| nabboud  | PO, Developer        | Upload images, dashboard, browser compatibility | 
| ahbey    | PM, Developer        | ORM (Prisma), 2FA, sentiment analysis           |
| wlarbi-a | PM, Developer        | i18n, RTL,                                      |
| cumoncoq | Tech Lead, Developer | WebSockets, chat, OAuth, design system          |

---

## Project Management

### Work organization

The team worked collaboratively with regular meetings (2–3 times per week) to track progress and resolve issues. Tasks were distributed weekly based on modules and individual strengths, we used GitHub to manage the project, organize tasks, and track contributions from each team member. Communication was handled through Discord, allowing quick discussions and efficient coordination between members.

### Tools used

- GitHub
- Docker
- Prisma Studio

### Communication

- Discord

---

## Technical Stack

### Frontend
- Next.js
- React + TypeScript
- TailwindCSS

### Backend
- Node.js
- Express
- Prisma ORM

### Database
- PostgreSQL

### Justification

- Next.js: modern full-stack framework
- Express: flexible backend
- Prisma: type-safe ORM
- PostgreSQL: reliable database
- Docker: required for deployment

---

## Database Schema

### Main tables

- **User**
  - id
  - username
  - email
  - password
  - avatar
  - bio
  - createdAt

- **Post**
  - id
  - content
  - image
  - authorId
  - createdAt

- **Comment**
  - id
  - content
  - userId
  - postId
  - createdAt

- **Like**
  - id
  - userId
  - postId

- **Friends**
  - id
  - senderId
  - receiverId
  - status

- **Notification**
  - id
  - userId
  - actorId
  - postId
  - type
  - read
  - createdAt

- **Conversation**
  - id
  - directKey
  - createdAt

- **Message**
  - id
  - conversationId
  - senderId
  - content
  - createdAt


### Relationships:

- User → Post (1:N)
- Post → Comment (1:N)
- User → Comment (1:N)
- User → Like (1:N)
- Post → Like (1:N)
- User → Friends (N:N)
- User → Notification (1:N)
- User → Message (1:N)
- Conversation → Message (1:N)

---

## Features List

| Feature            | Description                           | Implemented by     |
|--------------------|---------------------------------------|--------------------|
| 2FA                | Two-factor authentication             | ahbey              |
| OAuth              | Login, register with Intra and GitHub | cumoncoq           |
| Profiles           | update profile, password, bio, usename| ahbey              |
| Posts              | Create and delete posts               | nabboud            |
| Likes&comments     | Social interactions                   | nabboud            |
| Friends system     | Add, accept, and delete friends       | ahbey, manbengh    |
| Real-time chat     | Real-time messaging using WebSockets  | cumoncoq           |
| Notifications      | User alerts                           | manbengh, cumoncoq |
| Image upload       | Media posts                           | nabboud            |
| Search advance     | Users and posts                       | nabboud, wlarbi-a  |
| Dashboard          | User analytics                        | nabboud            |
| i18n               | Multi-language                        | wlarbi-a           |
| RTL                | Right-to-left support                 | wlarbi-a           |
| Browser support    | Multi-browser compatibility           | wlarbi-a           |
| Public API         | External access                       | manbengh           |
| Sentiment analysis | Comment moderation                    | ahbey              |

---


## Modules

### Major (2 pts)

- Framework frontend + backend (all team)
- User Management - manbengh, ahbey, cumoncoq, nabboud
- Public API – manbengh
- User interaction – cumoncoq
- Real-time features (WebSockets) – cumoncoq

### Minor (1 pt)

- Prisma ORM – ahbey
- File upload – nabboud
- Notifications – manbengh, cumoncoq
- OAuth – cumoncoq
- 2FA – ahbey
- Dashboard analytics – nabboud
- i18n – wlarbi-a
- RTL – wlarbi-a
- Multi-browser support – nabboud
- Design system – cumoncoq
- Sentiment analysis – ahbey
- Search advance - nabboud, wlarbi-a

### Total Points

Total = 22 points (minimum required: 14)

---

## Modules Justification

## Modules Justification

- **WebSockets**: enables real-time features such as chat and live notifications between users.
- **Public API**: allows external access to the platform data and demonstrates API design and security.
- **Prisma ORM**: simplifies database management with type safety and clean queries.
- **File upload**: allows users to share images, which is essential for a social network.
- **Notifications**: improves user engagement by informing users of interactions in real time.
- **OAuth**: provides secure and convenient authentication using external providers.
- **2FA**: enhances account security.
- **Dashboard analytics**: gives users insights into their activity.
- **i18n / RTL**: improves accessibility for international users.
- **Multi-browser support**: ensures compatibility across different environments.
- **User interaction**: core feature allowing communication between users.
- **Design system**: ensures UI consistency and reusability.
- **Sentiment analysis**: helps moderate comments and detect negative content.
- **Advanced search**: improves usability by allowing users to find content efficiently.

---

## Individual Contributions

### ahbey
- Prisma ORM
- 2FA
- Sentiment analysis

### manbengh
- Public API
- Notifications
- Friends system

### wlarbi-a
- i18n
- RTL support

### cumoncoq
- WebSockets
- Chat
- OAuth
- Design system

### nabboud
- Image upload
- Dashboard
- Posts

---

## Resources

- Prisma — https://www.prisma.io/docs
- Express — https://expressjs.com/
- Next.js — https://nextjs.org/docs
- React — https://react.dev/
- TypeScript — https://www.typescriptlang.org/docs/
- Tailwind CSS — https://tailwindcss.com/docs
- Node.js — https://nodejs.org/en/docs
- PostgreSQL — https://www.postgresql.org/docs/
- https://docs.astro.build/fr/guides/backend/prisma-postgres/
- https://laconsole.dev/formations/express/middlewares

---

## AI Usage

AI was used to assist with documentation structure and feature organization. All generated content was reviewed and validated by the team.

---

## Instructions

### Prerequisites

- Docker
- Docker Compose
- Node.js
- npm

### Run project

#### First Run (SSL initialization)

```bash
make init up 
```
This command initializes the SSL certificates required for secure HTTPS connections.


```bash
make up
```

This will start:
- Frontend (Next.js)
- Backend (Express API)
- PostgreSQL database

Useful Commands

```bash
make init      # Generate SSL certificates (first run only)
make down      # Stop containers
make logs      # View logs
make ps        # List running containers
make restart   # Restart services
make fclean    # Full cleanup (containers, images, volumes)
make re        # Clean and restart the project
```