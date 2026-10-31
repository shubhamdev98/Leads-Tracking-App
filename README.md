# 🚀 LeadFlow — Lead Management Portal (Fullstack)

A modern, production-ready **Lead Management Portal** backed by a REST API. Built with **React 18**, **TypeScript**, **Node.js**, **Express 5**, and **SQLite** (via WebAssembly engine with disk persistence).

---

## 🌟 Highlights & Features

### 1. Leads CRUD Operations

- **Create**: Add new customer leads with comprehensive input validation (`name`, `email`, `phone`, `status`).
- **Read**: List leads with real-time search (by name or email), status filtering (`all`, `new`, `contacted`, `qualified`, `lost`), and pagination controls.
- **Update**: Modify lead contact details and change pipeline status dynamically.
- **Delete**: Remove leads with automatic cascading deletion of all associated notes.

### 2. Activity Notes per Lead

- Attach unlimited chronological activity notes to each lead (`id`, `leadId`, `content`, `createdAt`).
- Retrieve all notes per lead (ordered newest first).
- Gracefully handles leads with zero notes.
- Individual note deletion.

### 3. Web Portal (React Frontend)

- **Leads List Page**:
  - Live search input by name or email with quick clear.
  - Interactive status tabs (`All`, `New`, `Contacted`, `Qualified`, `Lost`) with visual indicators.
  - Interactive leads table with user avatars, status badges, timestamps, and action buttons.
  - Summary metric cards displaying total counts across each pipeline stage.
  - Pagination toolbar with dynamic page navigation.
- **Lead Detail Page**:
  - Full lead profile summary card with formatted contact information.
  - Instant status pipeline switcher dropdown.
  - Add Note form with validation and quick submission.
  - Activity & Notes timeline displaying timestamps and note contents.
  - Safe lead deletion button with confirmation dialog.
- **Create Lead Page**:
  - Validated form with real-time feedback for required fields and RFC email format.
  - Pipeline status radio selector grid.
  - Optional first interaction note recorded simultaneously upon creation.

### 4. API Endpoints

| Method     | Endpoint                                    | Description                                                     |
| ---------- | ------------------------------------------- | --------------------------------------------------------------- |
| `GET`    | `/api/leads?search=&status=&page=&limit=` | Get leads with search, status filter, and pagination            |
| `POST`   | `/api/leads`                              | Create a new lead                                               |
| `GET`    | `/api/leads/:id`                          | Get single lead by ID                                           |
| `PATCH`  | `/api/leads/:id`                          | Update lead fields (`name`, `email`, `phone`, `status`) |
| `DELETE` | `/api/leads/:id`                          | Delete a lead and cascade delete its notes                      |
| `GET`    | `/api/leads/:id/notes`                    | Get all notes for a specific lead                               |
| `POST`   | `/api/leads/:id/notes`                    | Add a note to a specific lead                                   |
| `DELETE` | `/api/leads/:id/notes/:noteId`            | Delete an individual note                                       |
| `GET`    | `/api/leads/stats`                        | Get aggregate pipeline metrics                                  |

### 5. Validation & Error Handling

- Strict RFC 5322 email validation.
- All required fields validated (`name` min 2 chars, `email`, `phone`, `content`).
- Standardized HTTP status codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`.
- Structured JSON error responses: `{ "error": "Error message", "details": ... }`.

### 6. 🎁 Bonus Features Included

- ✅ **Pagination**: Configurable `page` and `limit` query parameters with total count and page metadata.
- ✅ **Basic Authentication**: Middleware supporting HTTP Basic Auth (`admin:admin123`, toggleable via `BASIC_AUTH_ENABLED`).
- ✅ **Automated Test Suite**: 27 unit tests with Jest + Supertest running on isolated in-memory SQLite (`100% passing`).
- ✅ **Database Seeding**: CLI seed script (`npm run seed`) populating 8 realistic leads and 18 activity notes.
- ✅ **Dockerfile & Docker Compose**: Multi-stage production build and container orchestration.
- ✅ **TypeScript**: Strict mode enabled across both frontend and backend.

---

## 🛠️ Technology Stack

| Layer               | Technologies                                                        |
| ------------------- | ------------------------------------------------------------------- |
| **Frontend**  | React 18, TypeScript, Vite, Lucide Icons, Custom Design System CSS  |
| **Backend**   | Node.js (v18+ / v20+ / v22+ / v24+), Express 5, TypeScript          |
| **Database**  | SQLite (with WAL mode, indexes, foreign keys, and cascading delete) |
| **Testing**   | Jest, Supertest, ts-jest                                            |
| **Dev Tools** | Concurrently, Docker, Docker Compose                                |

---

## 📁 Project Structure

```
Interview/
├── backend/                   # Express REST API
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── controllers/       # API controllers (Leads, Notes)
│   │   ├── db/                # SQLite connection, schema & seed script
│   │   ├── middleware/        # Basic Auth, Error Handler, 404 Handler
│   │   ├── repositories/      # Data Access Layer (LeadRepository, NoteRepository)
│   │   ├── routes/            # Express routes
│   │   ├── services/          # Business logic & validation (LeadService, NoteService)
│   │   ├── types/             # Domain TypeScript interfaces
│   │   ├── app.ts             # Express app setup & static file serving
│   │   └── server.ts          # Server entry point
│   ├── tests/                 # Automated Jest test suite (27 tests)
│   │   ├── helpers/           # In-memory SQLite test DB setup
│   │   ├── auth.test.ts       # Basic Auth tests
│   │   ├── leads.test.ts      # Leads CRUD & validation tests
│   │   └── notes.test.ts      # Notes CRUD & cascade delete tests
│   ├── data/                  # SQLite database directory (leads.db)
│   ├── jest.config.js         # Jest configuration
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # Backend TypeScript configuration
├── frontend/                  # React Single-Page Application
│   ├── src/
│   │   ├── api/               # Typed REST API client
│   │   ├── components/        # React components (Header, LeadsList, LeadDetail, CreateLeadPage, etc.)
│   │   ├── types/             # Frontend TypeScript types
│   │   ├── App.tsx            # Main App layout & view router
│   │   ├── index.css          # Design system & CSS styles
│   │   └── main.tsx           # React entry point
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   ├── tsconfig.json          # Frontend TypeScript configuration
│   └── vite.config.ts         # Vite configuration with /api reverse proxy
├── scripts/                   # Development & installation runner scripts
│   ├── dev.js                 # Concurrent dev runner
│   └── install.js             # Workspace installer
├── Dockerfile                 # Multi-stage production container build
├── docker-compose.yml         # Container orchestration
├── package.json               # Root scripts
└── README.md                  # Documentation
```

---

## ⚡ Quick Start

### 1. Install Dependencies

From the project root:

```bash
npm install
```

*(This automatically installs dependencies for both backend and frontend)*

### 2. Seed Sample Data (Optional)

Populate the SQLite database with 8 realistic customer leads and 18 activity notes:

```bash
npm run seed
```

### 3. Start Development Servers

```bash
npm run dev
```

Both servers will start concurrently:

- 🌐 **Frontend Web Portal**: [http://localhost:5173/](http://localhost:5173/)
- 📡 **Backend REST API**: [http://localhost:3000/api/leads](http://localhost:3000/api/leads)

*(Vite dev server automatically proxies `/api/*` requests to port 3000)*

---

## 🧪 Running Automated Tests

Run the complete Jest test suite:

```bash
npm test
```

### Test Results (27 Passing Tests)

```
PASS tests/leads.test.ts
  Leads API Endpoints
    POST /api/leads
      √ should create a lead successfully with status 201
      √ should default status to "new" if not provided
      √ should return 400 when required fields are missing
      √ should return 400 for invalid email format
      √ should return 400 for invalid lead status
    GET /api/leads
      √ should return all leads as an array by default
      √ should filter leads by status
      √ should search leads by name
      √ should search leads by email
      √ should support pagination bonus feature when page is requested
    GET /api/leads/:id
      √ should return lead by ID
      √ should return 404 for non-existent lead
    PATCH /api/leads/:id
      √ should update lead status and details
      √ should return 400 when updating with invalid email
      √ should return 404 when updating non-existent lead
    DELETE /api/leads/:id
      √ should delete lead successfully
      √ should return 404 when deleting non-existent lead

PASS tests/notes.test.ts
  Notes API Endpoints
    GET /api/leads/:id/notes
      √ should return 404 when lead does not exist
      √ should return an empty array for a lead with no notes
      √ should return all notes for a lead in chronological order
    POST /api/leads/:id/notes
      √ should add a note to a lead and return 201
      √ should return 400 when note content is empty or whitespace
      √ should return 404 when adding note to non-existent lead
    Cascading Deletion of Notes
      √ should automatically cascade delete all notes when parent lead is deleted

PASS tests/auth.test.ts
  Basic Authentication Middleware (Bonus Feature)
    √ should return 401 Unauthorized when credentials are not supplied
    √ should return 401 Unauthorized with invalid credentials
    √ should grant access and return 200 with valid credentials

Test Suites: 3 passed, 3 total
Tests:       27 passed, 27 total
```

---

## 📦 Production Build & Run

### Build Both Packages

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

The Express server on port 3000 will serve both the backend REST API (`/api/*`) and the built React frontend (`/*`).

---

## 🐳 Docker Deployment

You can build and run the entire application in a container with a single command:

```bash
docker compose up --build
```

Then visit [http://localhost:3000/](http://localhost:3000/) in your browser.

---

## 📖 API Examples (`curl`)

### 1. List Leads (with Search, Status Filter & Pagination)

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

**Example Response (`200 OK`):**

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

---

### 2. Create a Lead

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

---

### 3. Get Lead by ID

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

---

### 4. Update a Lead (PATCH)

```bash
curl -X PATCH "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified"
  }'
```

---

### 5. Add a Note to a Lead

```bash
curl -X POST "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Lead attended product demonstration. Requested enterprise security whitepaper."
  }'
```

**Response (`201 Created`):**

```json
{
  "id": "c33a9b87-8783-4ea7-8780-486afefb2ba9",
  "leadId": "06db3562-a04f-454b-b97e-d9ee63f1a7e0",
  "content": "Lead attended product demonstration. Requested enterprise security whitepaper.",
  "createdAt": "2026-10-31T07:36:42.969Z"
}
```

---

### 6. Get All Notes for a Lead

```bash
curl -X GET "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0/notes"
```

**Response (`200 OK`):**

```json
[
  {
    "id": "c33a9b87-8783-4ea7-8780-486afefb2ba9",
    "leadId": "06db3562-a04f-454b-b97e-d9ee63f1a7e0",
    "content": "Lead attended product demonstration. Requested enterprise security whitepaper.",
    "createdAt": "2026-10-31T07:36:42.969Z"
  }
]
```

---

### 7. Delete a Lead (Cascades to Associated Notes)

```bash
curl -X DELETE "http://localhost:3000/api/leads/06db3562-a04f-454b-b97e-d9ee63f1a7e0"
```

**Response (`200 OK`):**

```json
{
  "success": true,
  "message": "Lead 06db3562-a04f-454b-b97e-d9ee63f1a7e0 and associated notes deleted successfully"
}
```

---

### 8. Pipeline Statistics

```bash
curl -X GET "http://localhost:3000/api/leads/stats"
```

**Response (`200 OK`):**

```json
{
  "total": 9,
  "new": 3,
  "contacted": 2,
  "qualified": 3,
  "lost": 1
}
```

---

### 9. Basic Authentication (Bonus Feature)

When `BASIC_AUTH_ENABLED=true` in `backend/.env`:

```bash
# Request without credentials (Returns 401 Unauthorized)
curl -i -X GET "http://localhost:3000/api/leads"

# Request with valid credentials (admin:admin123)
curl -X GET "http://localhost:3000/api/leads" \
  -u admin:admin123
```

---

## 🔒 Security & Best Practices

- Parameterized SQL queries preventing SQL injection vulnerabilities.
- RFC 5322 regex validation preventing invalid email formats.
- Foreign key constraints enabled with `ON DELETE CASCADE` preventing orphaned notes.
- Centralized error handling preventing stack trace leaks in production.
- CORS enabled for cross-origin frontend requests.
- Graceful process termination handling `SIGINT` and `SIGTERM`.
