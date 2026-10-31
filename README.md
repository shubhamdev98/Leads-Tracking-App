# 🚀 Lead Management REST API (Backend)

A robust, production-grade **Lead Management REST API** built with **Node.js**, **Express**, **TypeScript**, and **SQLite** (via `better-sqlite3`).

---

## 🌟 Features

### 1. Leads CRUD
- **Create**: Register leads with full validation (`name`, `email`, `phone`, `status`).
- **Read**: List leads with search, status filtering, and pagination; fetch individual lead details.
- **Update**: Modify lead contact details and pipeline status (`new`, `contacted`, `qualified`, `lost`).
- **Delete**: Remove leads with automatic cascading deletion of associated notes.

### 2. Notes per Lead
- Attach unlimited chronological activity notes to each lead (`id`, `leadId`, `content`, `createdAt`).
- Retrieve notes per lead (ordered newest first).
- Gracefully handles leads with zero notes (`[]`).
- Delete individual notes.

### 3. Validation & Error Handling
- Strict RFC 5322 email format validation.
- All required fields validated (`name`, `email`, `phone`, `content`).
- Proper HTTP status codes: `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `401 Unauthorized`.
- Graceful handling of missing leads and invalid routes.

### 4. 🎁 Bonus Features
- ✅ **TypeScript**: Fully typed domain models, controllers, and services with `strict: true`.
- ✅ **Pagination**: Configurable `page` and `limit` query parameters with pagination metadata.
- ✅ **Basic Authentication**: Middleware supporting HTTP Basic Auth (`admin:admin123`, toggleable via `BASIC_AUTH_ENABLED`).
- ✅ **Automated Test Suite**: 27 Jest + Supertest test cases running against an isolated in-memory SQLite database.
- ✅ **Database Seeding**: Built-in CLI seed script (`npm run seed`) populating 8 realistic leads and 18 activity notes.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Runtime** | Node.js (v18+ / v20+ / v22+ / v24+) |
| **Framework** | Express 5 |
| **Language** | TypeScript (ES2022, strict mode) |
| **Database** | SQLite via `better-sqlite3` (with WAL mode & Foreign Key constraints) |
| **Testing** | Jest + Supertest (In-memory SQLite test suites) |

---

## 📁 Directory Structure

```
Interview/
├── backend/                # Backend API directory
│   ├── src/
│   │   ├── config/         # Centralized environment config
│   │   ├── types/          # Domain models, DTOs & filter interfaces
│   │   ├── db/             # SQLite connection, schema initialization & seed script
│   │   ├── repositories/   # Data Access Layer (LeadRepository, NoteRepository)
│   │   ├── services/       # Business Logic & Input Validation (LeadService, NoteService)
│   │   ├── middleware/     # Basic Auth, Error Handler, 404 Handler
│   │   ├── controllers/    # REST API controllers
│   │   ├── routes/         # Express API routes
│   │   ├── app.ts          # Express application setup
│   │   └── server.ts       # Server entry point & graceful shutdown
│   ├── tests/              # Automated Test Suite (Jest + Supertest)
│   │   ├── helpers/        # In-memory test DB & test app factory
│   │   ├── leads.test.ts   # Leads CRUD & validation tests
│   │   ├── notes.test.ts   # Notes CRUD & cascading delete tests
│   │   └── auth.test.ts    # Basic authentication tests
│   ├── data/               # SQLite database directory (leads.db)
│   ├── .env                # Environment variables
│   ├── .env.example        # Environment variable templates
│   ├── tsconfig.json       # Backend TypeScript configuration
│   ├── jest.config.js      # Jest test configuration
│   └── package.json        # Backend dependencies & scripts
├── package.json            # Root proxy scripts
└── README.md               # Documentation & curl examples
```

---

## 🚀 Quick Start

### 1. Install Dependencies

You can run commands from the repository root:

```bash
npm install
```

*(Or from the `backend/` directory: `cd backend && npm install`)*

### 2. Configure Environment

Environment settings are configured in `backend/.env` (default settings provided out-of-the-box):

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

Populate the database with realistic sample leads and activity notes:

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server starts on port 3000:
- 📡 **API Root**: [http://localhost:3000/](http://localhost:3000/)
- 📡 **Leads API**: [http://localhost:3000/api/leads](http://localhost:3000/api/leads)

### 5. Build & Start for Production

```bash
npm run build
npm start
```

---

## 🧪 Running Tests

The test suite runs with an in-memory SQLite database (`:memory:`), ensuring complete isolation, zero disk pollution, and sub-second execution:

```bash
npm test
```

### Test Coverage (27 Tests):
- **`tests/leads.test.ts`**: CRUD operations, required field validations, email regex validation, status validation, search filters, pagination.
- **`tests/notes.test.ts`**: Note addition, retrieval, missing lead 404, empty note 400, and foreign key cascading deletion.
- **`tests/auth.test.ts`**: Basic Auth challenges, 401 unauthorized handling, `WWW-Authenticate` headers, and authorized 200 responses.

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

### 🔒 Basic Authentication (Optional Bonus Feature)

When `BASIC_AUTH_ENABLED=true` in `backend/.env`:

```bash
# Request without credentials -> 401 Unauthorized
curl -i -X GET "http://localhost:3000/api/leads"

# Request with Basic Auth credentials (-u admin:admin123) -> 200 OK
curl -u admin:admin123 -X GET "http://localhost:3000/api/leads"
```

---

## 📄 License
ISC License.
