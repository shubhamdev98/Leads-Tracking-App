# Leads Tracking App

A modern, responsive full-stack **Leads Tracking Application** built with **React**, **TypeScript**, **Node.js**, **Express**, and **SQLite**.

---

## Features

- **Leads Management**: Create, view, edit, and delete leads.
- **Custom Delete Confirmation**: Developer-designed confirmation modal with preview details (replaces browser default popups).
- **1-to-N Relations**: Supports multiple leads sharing email/phone numbers for multi-deal tracking.
- **Activity Notes**: Add and manage chronological notes for each lead (automatic cascade deletion when a lead is deleted).
- **Search & Filters**: Instant search by name/email and filter by status (`New`, `Contacted`, `Qualified`, `Lost`).
- **Dashboard Metrics**: Summary cards displaying pipeline totals and status breakdowns.
- **RESTful API**: Standard HTTP status codes, structured JSON error handling, and optional Basic Auth.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (persistent storage with foreign key cascade support)
- **Testing**: Jest, Supertest

---

## Project Structure

```
├── backend/          # Express REST API (TypeScript & SQLite)
│   ├── src/          # Controllers, services, routes, repositories & DB
│   └── tests/        # Jest automated test suite
├── frontend/         # React SPA (TypeScript & Vite)
│   └── src/          # Components, pages, API client & styles
├── infra/            # Docker, Nginx & dev launch scripts
├── package.json      # Root workspace scripts
└── README.md
```

---

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 1. Install Dependencies

Install all dependencies for root, backend, and frontend with a single command:

```bash
npm install
```

### 2. (Optional) Seed Sample Data

Populate the database with initial leads and activity notes:

```bash
npm run seed
```

### 3. Start Development Server

Run both frontend and backend concurrently with hot reload:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start both frontend (port 5173) and backend (port 3000) concurrently |
| `npm run seed` | Seed database with sample leads and notes |
| `npm run db:view` | Inspect database tables directly in terminal |
| `npm test` | Run automated test suite (Jest & Supertest) |
| `npm run build` | Build production bundles for backend and frontend |
| `npm start` | Start production Express server (serves API & built UI) |

---

## Running with Docker (Optional)

Run the full-stack app in a container:

```bash
docker compose -f infra/docker-compose.yml up --build
```

Access the app at [http://localhost:3000](http://localhost:3000).

---

## REST API Endpoints

### Leads

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/leads` | List leads (supports `?search=`, `?status=`, `?page=`, `?limit=`) |
| `POST` | `/api/leads` | Create a new lead |
| `GET` | `/api/leads/:id` | Get lead by ID |
| `PATCH` | `/api/leads/:id` | Update lead details or status |
| `DELETE` | `/api/leads/:id` | Delete lead (cascades to its notes) |
| `GET` | `/api/leads/stats` | Get pipeline counts |

### Notes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/leads/:id/notes` | Get all notes for a lead |
| `POST` | `/api/leads/:id/notes` | Add a note to a lead |
| `DELETE` | `/api/leads/:id/notes/:noteId` | Delete a specific note |

---

## Environment Variables

Configure backend options in `backend/.env` (optional):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Backend server port |
| `DATABASE_PATH` | `./data/leads.db` | SQLite database file location |
| `BASIC_AUTH_ENABLED` | `false` | Enable HTTP Basic Authentication |
| `ADMIN_USERNAME` | `admin` | Username when Basic Auth is enabled |
| `ADMIN_PASSWORD` | `admin123` | Password when Basic Auth is enabled |

---

## License

ISC
