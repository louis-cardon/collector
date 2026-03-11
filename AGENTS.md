# AGENTS.md

## Project overview

This repository contains the v1 prototype of **Collector.shop**, a marketplace for collectible items between individuals.

The goal of this repository is to implement a **focused technical prototype**, not the full product.

The critical business flow is:

1. a `seller` authenticates
2. the seller creates an article
3. the article is stored with status `PENDING_REVIEW`
4. an `admin` reviews the article
5. the admin approves or rejects the article
6. approved articles become visible in the public catalog

## Functional scope

### In scope
Implement only the following features:

- authentication
- role-based authorization with roles `seller` and `admin`
- admin-managed categories
- seller article creation
- admin review of pending articles
- admin approval or rejection of articles
- public catalog listing approved articles only
- audit logging for sensitive admin actions
- automated tests
- CI/CD foundation
- deployment readiness

### Out of scope
Do **not** implement the following unless explicitly requested later:

- payment
- chat
- notifications
- fraud detection
- recommendations
- advanced seller shop management
- internationalization
- advanced accessibility
- multi-factor authentication
- microservices
- distributed tracing
- production-grade scaling architecture

## Technical stack

### Repository strategy
- use a **monorepo**
- keep frontend and backend separated in dedicated folders
- use **npm workspaces**

### Frontend
- Next.js
- TypeScript
- App Router
- React Hook Form
- Zod
- fetch or a light API client

### Backend
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- DTO + ValidationPipe
- JWT authentication handled by the backend
- role-based authorization with NestJS guards
- Swagger / OpenAPI
- Pino for structured logs

### Testing
- Jest for backend unit tests
- `@nestjs/testing` for NestJS tests
- Supertest for API integration tests
- Jest + React Testing Library for selected frontend tests
- Playwright for at least one end-to-end critical path

### Quality and CI/CD
- ESLint
- Prettier
- SonarQube
- GitHub Actions
- dependency vulnerability scan

## Core business rules

### Roles
Supported roles:
- `seller`
- `admin`

### Article statuses
Supported statuses:
- `PENDING_REVIEW`
- `APPROVED`
- `REJECTED`

Do not introduce additional statuses unless explicitly requested.

### Public visibility
- only `APPROVED` articles are visible in the public catalog
- `PENDING_REVIEW` and `REJECTED` articles are never publicly visible

### Article requirements
An article must contain at least:
- title
- description
- price
- shipping cost
- category
- at least one image reference

### Security rules
- all security decisions must be enforced server-side
- the frontend must never be the source of truth for authorization
- no secrets in source code
- use environment variables
- validate data both on frontend and backend
- log sensitive admin actions

## Architecture constraints

### General
- keep frontend and backend clearly separated
- keep code modular and easy to understand
- avoid premature abstraction
- prefer explicit business logic over clever patterns
- keep the codebase easy for one developer to defend in a technical presentation

### Backend modules
Prefer the following backend modules:
- `auth`
- `users`
- `categories`
- `articles`
- `admin`
- `audit`
- `health`

### Database
At minimum, support these entities:
- `User`
- `Category`
- `Article`
- `ArticleImage`
- `AuditLog`

Use Prisma migrations.

## Delivery order

When building the project, follow this order:

1. initialize monorepo and workspace structure
2. scaffold frontend and backend
3. configure Prisma and PostgreSQL
4. implement database schema and migrations
5. implement authentication and roles
6. implement admin category management
7. implement seller article creation
8. implement admin review flow
9. implement public catalog
10. add backend unit tests
11. add API integration tests
12. add selected frontend tests
13. add one end-to-end critical path
14. add CI/CD workflows
15. add deployment readiness items

Do not skip directly to advanced infrastructure before the critical business path works end-to-end.

## Testing expectations

The repository must provide evidence for the critical path:
- seller logs in
- seller creates article
- admin sees pending article
- admin approves article
- article becomes visible in public catalog

At minimum:
- backend unit tests
- API integration tests
- one E2E critical path

## CI/CD expectations

The project should be compatible with a GitHub Actions pipeline containing:
- install
- lint
- build
- backend unit tests
- API integration tests
- frontend tests
- coverage
- SonarQube analysis
- vulnerability scan
- optional deployment job
- optional smoke test

## Code quality rules

- prefer strong typing everywhere
- keep duplication low
- use clear names for modules, services, DTOs, and components
- write small and readable commits if asked
- avoid dead code and commented-out code
- do not add unnecessary dependencies
- keep SonarQube compatibility in mind
- document non-obvious technical choices in code comments only when needed

## Commands and developer experience

When adding scripts, prefer consistent root-level commands through npm workspaces.

Expected root scripts will likely include:
- `dev`
- `build`
- `lint`
- `test`
- `test:coverage`
- `test:e2e`

## What Codex should avoid

- do not invent extra business features
- do not switch authentication strategy away from JWT backend auth
- do not replace PostgreSQL with another database
- do not introduce microservices
- do not introduce Redux or heavy frontend state management unless explicitly needed
- do not add Docker/Kubernetes complexity unless explicitly requested
- do not rewrite the architecture without being asked

## Documentation awareness

Use the `docs/` folder as the functional and technical source of truth.
The most important documents for implementation are:
- `docs/01-cadrage-poc.md`
- `docs/02-backlog.md`
- `docs/03-architecture-technique.md`
- `docs/04-metrics-qualite.md`
- `docs/05-devsecops-cicd.md`
- `docs/08-strategie-tests-et-validation.md`

## Working style

Before implementing a large feature:
1. inspect the existing structure
2. keep consistency with the repository conventions
3. implement the smallest coherent increment
4. add or update tests
5. avoid broad refactors unless necessary

If requirements are ambiguous, prefer the smallest implementation that matches the documented scope.
