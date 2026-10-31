# 🚀 LeadFlow — Lead Management Portal & REST API

A modern, full-stack **Lead Management Portal** backed by a robust REST API, built with **Node.js**, **Express**, **TypeScript**, **SQLite** (via `better-sqlite3`), and server-rendered **EJS** with dynamic client-side interactions.

---

## 🌟 Key Features

### 1. Leads CRUD
- **Create**: Add leads with full validation (`name`, `email`, `phone`, `status`).
- **Read**: List leads with search, filtering, and pagination; view detailed profile per lead.
- **Update**: Edit contact information and update pipeline status (`new`, `contacted`, `qualified`, `lost`).
- **Delete**: Remove leads with automatic cascading deletion of associated notes.

### 2. Notes per Lead
- Attach unlimited chronological activity notes to each lead (`id`, `leadId`, `content`, `createdAt`).
- Individual note deletion.
- Clean empty states when leads have zero notes.

### 3. Web Portal (Server-rendered EJS + Modern CSS)
- **Leads List Page (`/leads`)**:
  - Live statistics dashboard (Total, New, Contacted, Qualified, Lost).
  - Search by name or email with live clear button.
  - Status filter tabs with status counters and active pill highlights.
  - Responsive table with custom avatars, formatted timestamps, and quick action icons.
  - Pagination controls (Previous, page numbers, Next, total counts).
- **Create Lead Page (`/leads/new`)**:
  - Polished form with field-level validation and status selector cards.
- **Lead Detail Page (`/leads/:id`)**:
  - Contact cards, instant status dropdown switcher, and edit/delete actions.
  - Notes activity feed and responsive "Add Note" form.
- **Edit Lead Page (`/leads/:id/edit`)**:
  - Pre-filled form to update name, email, phone, and status.

### 4. 🎁 Bonus Features Implemented
- ✅ **TypeScript**: Fully typed domain models, controllers, and services with `strict: true`.
- ✅ **Pagination**: Configurable `page` and `limit` query parameters with pagination metadata.
- ✅ **Basic Authentication**: Configurable HTTP Basic Auth middleware for both API and portal.
- ✅ **Unit & Integration Tests**: 27 Jest + Supertest test cases covering routes, edge cases, and validations.
- ✅ **Containerization**: Production-ready `Dockerfile` and `docker-compose.yml`.
- ✅ **Database Seeding**: Built-in CLI seed script (`npm run seed`) and empty-state UI buttons.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js (v18+ / v20+ / v22+ / v24+) |
| **Language** | TypeScript (ES2022) |
| **Framework** | Express 5 |
| **Database** | SQLite via `better-sqlite3` (with WAL mode & Foreign Key constraints) |
| **View Engine** | Server-rendered EJS with responsive Vanilla CSS Design System |
| **Testing** | Jest + Supertest (In-memory SQLite test suites) |
| **Container** | Docker & Docker Compose |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd Interview
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/leads.db

# Optional Basic Authentication
BASIC_AUTH_ENABLED=false
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. Seed Sample Data (Optional)

Populate the database with 8 realistic leads and 18 activity notes:

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The portal and API will be available at:
- 🌐 **Web Portal**: [http://localhost:3000/leads](http://localhost:3000/leads)
- 📡 **REST API**: [http://localhost:3000/api/leads](http://localhost:3000/api/leads)

---

## 🧪 Running Tests

The test suite runs with an in-memory SQLite database (`:memory:`), ensuring complete isolation, zero disk pollution, and sub-second execution:

```bash
npm test
```

### Test Coverage Highlights:
- **`tests/leads.test.ts`**: CRUD operations, required field validations, email regex validation, status validation, search filters, pagination.
- **`tests/notes.test.ts`**: Note addition, retrieval, missing lead 404, empty note 400, and foreign key cascading deletion.
- **`tests/auth.test.ts`**: Basic Auth challenges, 401 unauthorized handling, `WWW-Authenticate` headers, and authorized 200 responses.

---

## 📦 Docker Deployment

Run the portal in a containerized production environment:

```bash
# Build and start container
docker compose up --build -d

# View logs
docker compose logs -f

# Stop container
docker compose down
```

The SQLite database persists in the Docker volume `lead_data`.

---

## 📚 REST API Reference & `curl` Examples

### Leads Endpoints

#### 1. List Leads
Supports filtering by `search` (name or email), `status` (`new`, `contacted`, `qualified`, `lost`), and pagination (`page`, `limit`).

```bash
# Get all leads
curl -X GET "http://localhost:3000/api/leads"

# Filter by status
curl -X GET "http://localhost:3000/api/leads?status=qualified"

# Search by name or email
curl -X GET "http://localhost:3000/api/leads?search=Sarah"

# Paginated results (Bonus feature)
curl -X GET "http://localhost:3000/api/leads?page=1&limit=5"
```

**Paginated Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "1ad21275-48ac-4091-9aae-d505f69a7639",
      "name": "Sarah Connor",
      "email": "sarah.connor@cyberdyne-defense.com",
      "phone": "+1 (555) 234-5678",
      "status": "new",
      "createdAt": "2026-10-23T05:49:23.185Z",
      "updatedAt": "2026-10-23T05:49:23.185Z"
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

---

#### 2. Create a Lead
Validates that `name` (min 2 chars), `email` (RFC format), and `phone` are provided. `status` defaults to `new` if omitted.

```bash
curl -X POST "http://localhost:3000/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bruce Wayne",
    "email": "bruce.wayne@wayneenterprises.com",
    "phone": "+1 (555) 019-9000",
    "status": "qualified"
  }'
```

**Response (201 Created):**
```json
{
  "id": "59cb4a52-9dae-4cf7-9a40-2c7009e4526d",
  "name": "Bruce Wayne",
  "email": "bruce.wayne@wayneenterprises.com",
  "phone": "+1 (555) 019-9000",
  "status": "qualified",
  "createdAt": "2026-10-31T06:00:00.000Z",
  "updatedAt": "2026-10-31T06:00:00.000Z"
}
```

---

#### 3. Get Lead by ID

```bash
curl -X GET "http://localhost:3000/api/leads/59cb4a52-9dae-4cf7-9a40-2c7009e4526d"
```

**Response (200 OK):**
```json
{
  "id": "59cb4a52-9dae-4cf7-9a40-2c7009e4526d",
  "name": "Bruce Wayne",
  "email": "bruce.wayne@wayneenterprises.com",
  "phone": "+1 (555) 019-9000",
  "status": "qualified",
  "createdAt": "2026-10-31T06:00:00.000Z",
  "updatedAt": "2026-10-31T06:00:00.000Z"
}
```

If not found:
```json
// Status: 404 Not Found
{
  "success": false,
  "error": "Lead with ID 'non-existent-id' not found"
}
```

---

#### 4. Update a Lead (PATCH)
Update one or more fields (`name`, `email`, `phone`, `status`).

```bash
curl -X PATCH "http://localhost:3000/api/leads/59cb4a52-9dae-4cf7-9a40-2c7009e4526d" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contacted",
    "phone": "+1 (555) 999-0000"
  }'
```

**Response (200 OK):**
```json
{
  "id": "59cb4a52-9dae-4cf7-9a40-2c7009e4526d",
  "name": "Bruce Wayne",
  "email": "bruce.wayne@wayneenterprises.com",
  "phone": "+1 (555) 999-0000",
  "status": "contacted",
  "createdAt": "2026-10-31T06:00:00.000Z",
  "updatedAt": "2026-10-31T06:02:15.123Z"
}
```

---

#### 5. Delete a Lead
Deletes the lead and automatically cascades deletion to all attached notes.

```bash
curl -X DELETE "http://localhost:3000/api/leads/59cb4a52-9dae-4cf7-9a40-2c7009e4526d"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "id": "59cb4a52-9dae-4cf7-9a40-2c7009e4526d"
}
```

---

### Notes Endpoints

#### 6. Get Notes for a Lead
Returns all notes chronologically (newest first). If the lead exists with 0 notes, returns an empty array `[]`. If the lead doesn't exist, returns `404 Not Found`.

```bash
curl -X GET "http://localhost:3000/api/leads/1ad21275-48ac-4091-9aae-d505f69a7639/notes"
```

**Response (200 OK):**
```json
[
  {
    "id": "f51a44e6-81cf-4186-b4d0-a03525b68234",
    "leadId": "1ad21275-48ac-4091-9aae-d505f69a7639",
    "content": "Lead captured through company website contact form.",
    "createdAt": "2026-10-23T08:49:23.185Z"
  }
]
```

---

#### 7. Add a Note to a Lead

```bash
curl -X POST "http://localhost:3000/api/leads/1ad21275-48ac-4091-9aae-d505f69a7639/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Follow-up demo scheduled for Thursday at 2 PM EST."
  }'
```

**Response (201 Created):**
```json
{
  "id": "7c180da2-c67d-4c3d-bd88-fa0812e1be71",
  "leadId": "1ad21275-48ac-4091-9aae-d505f69a7639",
  "content": "Follow-up demo scheduled for Thursday at 2 PM EST.",
  "createdAt": "2026-10-31T06:05:00.000Z"
}
```

---

### 🔒 Basic Authentication Example (Bonus Feature)

When `BASIC_AUTH_ENABLED=true` in `.env`:

```bash
# Request without credentials -> 401 Unauthorized
curl -i -X GET "http://localhost:3000/api/leads"
# Returns: HTTP/1.1 401 Unauthorized
# WWW-Authenticate: Basic realm="Lead Management Portal"

# Request with Basic Auth credentials (-u admin:admin123) -> 200 OK
curl -u admin:admin123 -X GET "http://localhost:3000/api/leads"
```

---

## 🏛️ Project Architecture & Design Decisions

```
Interview/
├── src/
│   ├── config/             # Centralized environment & app config
│   ├── types/              # Domain models, DTOs & filter interfaces
│   ├── db/                 # SQLite connection, schema initialization & seed script
│   ├── repositories/       # Data Access Layer (LeadRepository, NoteRepository)
│   ├── services/           # Business Logic & Input Validation (LeadService, NoteService)
│   ├── middleware/         # Basic Auth, centralized error handling & 404 handler
│   ├── controllers/        # REST API controllers & Server-rendered Portal controllers
│   ├── routes/             # REST API routes (/api/...) & Web Portal routes (/leads/...)
│   ├── views/              # EJS templates (layouts, index, show, new, edit, error)
│   ├── public/             # CSS design system & client interactivity JS
│   ├── app.ts              # Express application factory (exported for tests)
│   └── server.ts           # HTTP server startup & graceful shutdown
├── tests/
│   ├── helpers/            # In-memory test DB & test app factory
│   ├── leads.test.ts       # Leads CRUD & validation test suite
│   ├── notes.test.ts       # Notes CRUD & cascading delete test suite
│   └── auth.test.ts        # Basic authentication test suite
├── Dockerfile              # Production Alpine container
├── docker-compose.yml      # Container orchestration
└── package.json
```

### Key Architectural Strengths:
1. **Layered Architecture**: Strict separation of concerns (Repositories $\rightarrow$ Services $\rightarrow$ Controllers $\rightarrow$ Routes).
2. **Robust Foreign Keys**: SQLite configured with `PRAGMA foreign_keys = ON;` and `ON DELETE CASCADE` ensures data integrity between leads and notes.
3. **Graceful Error Handling**: Custom `ValidationError` (400), `NotFoundError` (404), and `UnauthorizedError` (401) with structured JSON responses for APIs and styled error pages for browsers.
4. **Performance**: SQLite WAL (`Write-Ahead Logging`) mode enabled for concurrent reads and writes.

---

## 📄 License
ISC License.
