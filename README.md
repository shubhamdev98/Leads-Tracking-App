# Leads Tracking App

A modern, production-ready **Leads Tracking App** backed by a robust REST API. Built with **React 18**, **TypeScript**, **Node.js**, **Express 5**, and **SQLite** (via WebAssembly engine with disk persistence).

---

## Repository

- **GitHub Repository**: [https://github.com/shubhamdev98/Leads-Tracking-App](https://github.com/shubhamdev98/Leads-Tracking-App)

---

## Table of Contents

- [Evaluation Criteria &amp; Architectural Verification](#evaluation-criteria--architectural-verification)
  - [1. API Design &amp; Correctness](#1-api-design--correctness)
  - [2. Database Modeling (Lead ⟷ Notes Relation)](#2-database-modeling-lead--notes-relation)
  - [3. Frontend Usability](#3-frontend-usability)
  - [4. Code Quality &amp; Architecture](#4-code-quality--architecture)
  - [5. Edge Cases Handled](#5-edge-cases-handled)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How to Start (Choose Your Path)](#how-to-start-choose-your-path)
  - [Path 1: Local Development (Best for Coding &amp; Testing)](#path-1-local-development-best-for-coding--testing)
  - [Path 2: Docker Compose (Fullstack Production)](#path-2-docker-compose-fullstack-production)
  - [Path 3: Standalone Frontend in Docker (Nginx)](#path-3-standalone-frontend-in-docker-nginx)
  - [Path 4: Local Production Server](#path-4-local-production-server)
- [Database Management](#database-management)
  - [Database Seeding](#database-seeding)
  - [Terminal Database Visualizer](#terminal-database-visualizer)
- [Automated Test Suite (Jest)](#automated-test-suite-jest)
- [REST API Reference](#rest-api-reference)
  - [Endpoints Summary](#endpoints-summary)
  - [API Examples (curl)](#api-examples-curl)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Evaluation Criteria & Architectural Verification

### 1. API Design & Correctness

- **Strict RESTful Conventions**: Predictable routes with appropriate HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).
- **Standard HTTP Status Codes**:
  - `200 OK`: Successful retrieval, updates, deletions.
  - `201 Created`: Successful resource creation (returns created entity with server-generated `id` and `createdAt`).
  - `400 Bad Request`: Validation errors (missing fields, invalid RFC 5322 email syntax, invalid status values).
  - `401 Unauthorized`: Missing or invalid credentials when Basic Authentication is active.
  - `404 Not Found`: Requesting a lead or note ID that does not exist.
  - `500 Internal Server Error`: Unhandled server exceptions caught by global error middleware.
- **Centralized Error Handling**: Custom `AppError`, `ValidationError`, `NotFoundError`, and `UnauthorizedError` classes ensure consistent JSON payloads:
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "details": {
      "email": "Valid email address is required"
    }
  }
  ```

---

### 2. Database Modeling (Lead ⟷ Notes Relation)

- **Engine**: SQLite running via WebAssembly with filesystem persistence (`leads.db`) and WAL mode (`PRAGMA journal_mode = WAL`) for safe concurrent reads and writes.
- **Foreign Key Constraints**: Enabled on every connection (`PRAGMA foreign_keys = ON`).
- **One-to-Many Relationship**:

  - `leads` table stores core contact and pipeline state.
  - `notes` table references `leads(id)` with `ON DELETE CASCADE`:

  ```sql
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    createdAt TEXT NOT NULL,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_notes_leadId ON notes(leadId);
  CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  ```
- **Integrity Guarantee**: Deleting a lead automatically purges all associated notes at the database level, preventing orphaned records.

---

### 3. Frontend Usability

- **Design Philosophy**: Minimal, modern developer CRM interface built for readability and quick workflows.
- **Design System Tokens**:
  - Primary background: `#FFFFFF`
  - Subtle sections: `#F8F8F8`
  - Main text: `#111111`
  - Secondary text: `#666666`
  - Borders: `#E5E5E5`
  - Radii: Crisp `4px` on all buttons, inputs, and cards (`0px` on tables).
- **Status Badges**:
  - **New**: `#1D4ED8` text on `#EFF6FF` background (`#BFDBFE` border)
  - **Contacted**: `#B45309` text on `#FFFBEB` background (`#FDE68A` border)
  - **Qualified**: `#15803D` text on `#F0FDF4` background (`#BBF7D0` border)
  - **Lost**: `#B91C1C` text on `#FEF2F2` background (`#FECACA` border)
- **Workflows**:
  - Instant client-side text search by name or email.
  - One-click pipeline stage filtering.
  - Dedicated lead profile with quick pipeline status switcher.
  - Inline activity notes composer with chronological feed.
  - Responsive layouts optimized for desktop, tablet, and mobile.

---

### 4. Code Quality & Architecture

- **Pure Functional TypeScript**: Controllers, services, and repositories are structured as pure exported functions rather than class methods:
  - `leadApiController.ts` & `noteApiController.ts`: Export request handler functions and factory helpers.
  - `leadService.ts` & `noteService.ts`: Pure business logic functions with factory wrappers for isolated test injection.
  - `leadRepository.ts` & `noteRepository.ts`: Pure data access functions.
- **Separation of Concerns**:
  - `controllers/`: HTTP parsing, status code assignment, and response formatting.
  - `services/`: Business validation, sanitization, and workflow logic.
  - `repositories/`: Direct SQLite parameterized SQL queries.
  - `db/`: Connection lifecycle, schema execution, and disk persistence.
  - `middleware/`: Authentication, centralized error handling, and 404 routing.
  - `types/`: Shared TypeScript domain interfaces.

---

### 5. Edge Cases Handled

1. **Non-Existent Lead (`404 Not Found`)**:
   - `GET /api/leads/:id` returns `404` with structured error message `{ "success": false, "error": "Lead with ID '...' not found" }`.
   - The React UI displays a structured error card with a "Back to Leads" navigation button.
2. **Notes on Non-Existent Lead (`404 Not Found`)**:
   - Requesting `GET /api/leads/:id/notes` or `POST /api/leads/:id/notes` verifies lead existence first, returning `404` if the parent lead does not exist.
3. **Empty Notes State (`200 OK`)**:
   - Leads with zero activity notes return `200 OK` with an empty array `[]`.
   - The UI presents an empty notes state inviting the user to write their first note.
4. **Cascading Deletion**:
   - Verified by automated tests: deleting a lead automatically deletes all associated activity notes without orphaned records.
5. **Validation Errors (`400 Bad Request`)**:
   - Missing required fields, RFC 5322 regex email syntax failures, or invalid status values return `400 Bad Request` with field-level feedback.
6. **Authentication Rejection (`401 Unauthorized`)**:
   - When Basic Auth is enabled, requests without valid credentials return `401 Unauthorized`.

---

## Tech Stack

| Layer                         | Technologies                                                                              |
| :---------------------------- | :---------------------------------------------------------------------------------------- |
| **Frontend**            | React 18, TypeScript, Vite, Lucide React, Minimal Design System (Inter font)              |
| **Backend**             | Node.js (v18+ / v20+ / v22+ / v24+), Express 5, TypeScript                                |
| **Architecture**        | Functional Programming (pure functions, modular request handlers, higher-order factories) |
| **Database**            | SQLite (WASM engine, WAL mode, foreign keys enabled, cascading deletes)                   |
| **Testing**             | Jest, Supertest, ts-jest (in-memory SQLite test fixtures)                                 |
| **DevOps / Containers** | Docker, Docker Compose, Nginx Alpine                                                      |

---

## Project Structure

```
Interview/
├── backend/                       # Express 5 REST API (Functional TypeScript)
│   ├── src/
│   │   ├── config/                # Environment configuration & defaults
│   │   ├── controllers/           # API request handlers (Functional)
│   │   ├── db/                    # SQLite engine, schema, migrations, seeders & visualizer
│   │   ├── middleware/            # Basic Auth, Error Handler, 404 Handler
│   │   ├── repositories/          # Data Access Layer (Functional)
│   │   ├── routes/                # Express API router definitions
│   │   ├── services/              # Business logic & RFC email validation (Functional)
│   │   ├── types/                 # Domain TypeScript interfaces
│   │   ├── app.ts                 # Express application setup & static SPA routing
│   │   └── server.ts              # Server lifecycle & graceful shutdown
│   ├── tests/                     # Automated Jest test suite (27 tests)
│   │   ├── helpers/               # In-memory SQLite test fixtures
│   │   ├── auth.test.ts           # Basic Auth middleware tests
│   │   ├── leads.test.ts          # Leads CRUD, search, filter & pagination tests
│   │   └── notes.test.ts          # Notes CRUD & cascade delete tests
│   ├── data/                      # Persistent SQLite storage directory (leads.db)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                      # React 18 Single-Page Application
│   ├── src/
│   │   ├── api/                   # Type-safe REST API client
│   │   ├── components/            # UI components (Header, LeadsList, LeadDetail, CreateLeadPage, StatsCards)
│   │   ├── types/                 # Frontend TypeScript interfaces
│   │   ├── App.tsx                # Main view router & layout
│   │   ├── index.css              # Minimal developer CRM design system (Inter, 4px radii)
│   │   └── main.tsx               # Application bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts             # Vite config with /api development proxy
├── infra/                         # All deployment, container & operational infrastructure
│   ├── .dockerignore              # Docker ignore rules
│   ├── Dockerfile                 # Unified multi-stage production container build
│   ├── Dockerfile.dockerignore    # BuildKit context ignore
│   ├── docker-compose.yml         # Container orchestration with db_data volume
│   ├── nginx.conf                 # Nginx SPA router & API reverse-proxy configuration
│   └── scripts/                   # Workspace development & installation scripts
│       ├── dev.js                 # Concurrent runner for frontend + backend
│       └── install.js             # Workspace dependency installer
├── package.json                   # Root workspace scripts
└── README.md                      # Documentation
```

---

## How to Start (Choose Your Path)

### Path 1: Local Development (Best for Coding & Testing)

Runs both the Vite development server and the Express API server concurrently with instant hot-reloading:

```
[ Browser: http://localhost:5173 ]
        │
        ├── UI Hot-Reload (Vite Dev Server)
        │
        └── /api/*  ──(Vite Proxy)──► [ Express Backend: http://localhost:3000 ]
                                                       │
                                               [ SQLite: leads.db ]
```

#### 1. Install Dependencies

```bash
npm install
```

*(Automatically installs backend and frontend packages via root workspace script).*

#### 2. (Optional) Seed the Database

```bash
npm run seed
```

#### 3. Start Both Servers Concurrently

```bash
npm run dev
```

#### 4. Access the App

- **Web Portal**: [http://localhost:5173/](http://localhost:5173/)
- **REST API**: [http://localhost:3000/api/leads](http://localhost:3000/api/leads)

> [!TIP]
> Vite automatically proxies `/api/*` network requests to `http://localhost:3000`, so no CORS configuration is needed during local development.

---

### Path 2: Docker Compose (Fullstack Production)

Packages the fullstack application into a single container where Express serves both the REST API endpoints and the compiled React SPA:

#### 1. Build the Production Bundles Locally

```bash
npm run build
```

#### 2. Start the Docker Container

```bash
docker compose -f infra/docker-compose.yml up --build
```

#### Fresh Rebuild & Restart (No Cache)

```bash
# Stop existing containers
docker compose -f infra/docker-compose.yml down

# Rebuild fresh without cache and launch
docker compose -f infra/docker-compose.yml build --no-cache
docker compose -f infra/docker-compose.yml up
```

#### 3. Access the Portal

- **Web Portal**: [http://localhost:3000/](http://localhost:3000/)
- **API Status**: [http://localhost:3000/api](http://localhost:3000/api)
- **Leads API**: [http://localhost:3000/api/leads](http://localhost:3000/api/leads)

#### 4. Stop the Container

```bash
docker compose -f infra/docker-compose.yml down
```

> [!NOTE]
> Database changes persist across container restarts inside the named Docker volume `db_data`.

---

### Path 3: Standalone Frontend in Docker (Nginx)

To run the frontend separately through Nginx on port 8080:

```bash
# 1. Stop and remove any existing container
docker rm -f leads-tracking-frontend

# 2. Build the frontend image fresh without cache
docker build --no-cache -t leads-tracking-frontend -f infra/Dockerfile --target frontend-standalone .

# 3. Run the Nginx container
docker run -d -p 8080:80 --name leads-tracking-frontend leads-tracking-frontend
```

Access at [http://localhost:8080/](http://localhost:8080/).

---

### Path 4: Local Production Server

To run the production bundle locally without Docker:

```bash
# 1. Build both frontend and backend
npm run build

# 2. Start production Express server
npm start
```

Visit [http://localhost:3000/](http://localhost:3000/).

---

## Database Management

### Database Seeding

Populate the SQLite database with 8 realistic customer leads across different pipeline stages and 18 chronological activity notes:

```bash
npm run seed
```

Output:

```
Database seeded successfully.
```

### Terminal Database Visualizer

To inspect the SQLite database tables directly from the command line without external GUI tools:

```bash
npm run db:view
```

Displays formatted tables showing lead records, statuses, dates, and associated activity notes in your terminal.

---

## Automated Test Suite (Jest)

The project includes 27 comprehensive automated tests using **Jest**, **Supertest**, and an **in-memory SQLite database** ensuring total test isolation:

```bash
npm test
```

### Test Coverage Highlights

- **Lead Validation**: Required fields (`name`, `email`, `phone`), RFC 5322 email syntax, and invalid status checks.
- **Leads CRUD**: Creation (`201`), Listing (`200`), Fetch by ID (`200`/`404`), Updates via PATCH (`200`/`400`/`404`), Deletion (`200`/`404`).
- **Search & Status Filtering**: Real-time name/email substring match and pipeline stage filtering.
- **Pagination**: Page size and page index calculations with metadata.
- **Cascading Deletions**: Verifies notes are automatically removed when their parent lead is deleted.
- **Basic Authentication**: Tests 401 Unauthorized for missing/invalid credentials and 200 OK for valid credentials.

```
Test Suites: 3 passed, 3 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Ran all test suites.
```

---

## REST API Reference

### Endpoints Summary

| Method     | Endpoint                         | Description                                                               | Status Codes              |
| :--------- | :------------------------------- | :------------------------------------------------------------------------ | :------------------------ |
| `GET`    | `/api`                         | API root status & registered endpoints                                    | `200`                   |
| `GET`    | `/api/leads`                   | List leads (supports `?search=`, `?status=`, `?page=`, `?limit=`) | `200`                   |
| `POST`   | `/api/leads`                   | Create a new lead                                                         | `201`, `400`          |
| `GET`    | `/api/leads/:id`               | Get single lead by ID                                                     | `200`, `404`          |
| `PATCH`  | `/api/leads/:id`               | Update lead contact fields or status                                      | `200`, `400`, `404` |
| `DELETE` | `/api/leads/:id`               | Delete a lead (cascades to all notes)                                     | `200`, `404`          |
| `GET`    | `/api/leads/:id/notes`         | Get all chronological notes for a lead                                    | `200`, `404`          |
| `POST`   | `/api/leads/:id/notes`         | Add an activity note to a lead                                            | `201`, `400`, `404` |
| `DELETE` | `/api/leads/:id/notes/:noteId` | Delete a specific activity note                                           | `200`, `404`          |
| `GET`    | `/api/leads/stats`             | Pipeline metrics aggregation                                              | `200`                   |

---

### API Examples (curl)

#### 1. List Leads (with Search, Status Filter & Pagination)

```bash
# Get all leads
curl -X GET "http://localhost:3000/api/leads"

# Filter by pipeline status (new, contacted, qualified, lost)
curl -X GET "http://localhost:3000/api/leads?status=qualified"

# Search by name or email
curl -X GET "http://localhost:3000/api/leads?search=Sarah"

# Paginated results
curl -X GET "http://localhost:3000/api/leads?page=1&limit=5"
```

**Paginated Response (`200 OK`):**

```json
{
  "data": [
    {
      "id": "b7bb2dc8-b727-4581-8522-768da8fcebb8",
      "name": "Liam Gallagher",
      "email": "liam.g@soundtrack-studios.co.uk",
      "phone": "+44 161 496 0123",
      "status": "new",
      "createdAt": "2026-10-30T07:32:22.504Z",
      "updatedAt": "2026-10-30T07:32:22.504Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 9,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. Create a Lead

```bash
curl -X POST "http://localhost:3000/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evelyn Harper",
    "email": "evelyn@harperdesign.co",
    "phone": "+1 (555) 345-6789",
    "status": "new"
  }'
```

**Response (`201 Created`):**

```json
{
  "id": "06db3562-a04f-454b-b97e-d9ee63f1a7e0",
  "name": "Evelyn Harper",
  "email": "evelyn@harperdesign.co",
  "phone": "+1 (555) 345-6789",
  "status": "new",
  "createdAt": "2026-10-31T07:36:30.712Z",
  "updatedAt": "2026-10-31T07:36:30.712Z"
}
```

#### 3. Get Single Lead by ID

```bash
curl -X GET "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0"
```

**Response (`200 OK`):**

```json
{
  "id": "06db3562-a04f-454b-b97e-d9ee63f1a7e0",
  "name": "Evelyn Harper",
  "email": "evelyn@harperdesign.co",
  "phone": "+1 (555) 345-6789",
  "status": "new",
  "createdAt": "2026-10-31T07:36:30.712Z",
  "updatedAt": "2026-10-31T07:36:30.712Z"
}
```

#### 4. Update Lead (PATCH)

Supports partial or complete updates for lead details (`name`, `email`, `phone` / `mobile`, `status`):

```bash
curl -X PATCH "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evelyn Harper",
    "email": "evelyn.harper@newdomain.com",
    "phone": "+1 (555) 987-6543",
    "status": "qualified"
  }'
```

**Response (`200 OK`):**

```json
{
  "id": "06db3562-a04f-454b-b97e-d9ee63f1a7e0",
  "name": "Evelyn Harper",
  "email": "evelyn.harper@newdomain.com",
  "phone": "+1 (555) 987-6543",
  "status": "qualified",
  "createdAt": "2026-10-31T07:36:30.712Z",
  "updatedAt": "2026-10-31T07:40:15.118Z"
}
```

#### 5. Delete Lead

```bash
curl -X DELETE "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0"
```

**Response (`200 OK`):**

```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "id": "06db3562-a04f-454b-b97e-d9ee63f1a7e0"
}
```

#### 6. Add an Activity Note

```bash
curl -X POST "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Attended product demo. Requested enterprise security documentation."
  }'
```

**Response (`201 Created`):**

```json
{
  "id": "c1387d7b-99d6-444a-a6c8-54b0fcfaae48",
  "leadId": "06db3562-a04f-454b-b97e-d9ee63f1a7e0",
  "content": "Attended product demo. Requested enterprise security documentation.",
  "createdAt": "2026-10-31T07:42:01.309Z"
}
```

#### 7. Get All Notes for a Lead

```bash
curl -X GET "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0/notes"
```

**Response (`200 OK`):**

```json
[
  {
    "id": "c1387d7b-99d6-444a-a6c8-54b0fcfaae48",
    "leadId": "06db3562-a04f-454b-b97e-d9ee63f1a7e0",
    "content": "Attended product demo. Requested enterprise security documentation.",
    "createdAt": "2026-10-31T07:42:01.309Z"
  }
]
```

#### 8. Pipeline Statistics

```bash
curl -X GET "http://localhost:3000/api/leads/stats"
```

**Response (`200 OK`):**

```json
{
  "total": 8,
  "new": 1,
  "contacted": 2,
  "qualified": 4,
  "lost": 1
}
```

#### 9. Basic Authentication

When enabled via `BASIC_AUTH_ENABLED=true` in `backend/.env`:

```bash
# Missing credentials -> 401 Unauthorized
curl -i -X GET "http://localhost:3000/api/leads"

# Valid credentials (admin:admin123) -> 200 OK
curl -X GET "http://localhost:3000/api/leads" -u admin:admin123
```

---

## Environment Variables

Configure environment variables in `backend/.env` (or via Docker environment):

| Variable               | Default             | Description                                                     |
| :--------------------- | :------------------ | :-------------------------------------------------------------- |
| `PORT`               | `3000`            | Port for backend Express application                            |
| `NODE_ENV`           | `development`     | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_PATH`      | `./data/leads.db` | File path for SQLite database file (or `:memory:`)            |
| `BASIC_AUTH_ENABLED` | `false`           | Enable HTTP Basic Authentication for API routes                 |
| `ADMIN_USERNAME`     | `admin`           | Username for Basic Authentication                               |
| `ADMIN_PASSWORD`     | `admin123`        | Password for Basic Authentication                               |
| `VITE_API_URL`       | *(empty)*         | Optional API origin override for frontend standalone builds     |
