# 🧭 Pusula — Test Management

A TestRail-inspired web application for managing test scenarios and cases.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Ant Design 5 |
| Backend | Node.js, Express |
| Database | Microsoft SQL Server |

## Features

- **Project Management** — Create, edit and delete projects
- **Test Cases** — Title, description, preconditions, priority, type and status fields
- **Step Editor** — Ordered test steps with action and expected result columns
- **Filtering** — Filter by priority, type and status; search by title
- **Statistics** — Per-project counts of active / draft / deprecated cases

## Getting Started

### Prerequisites

- Node.js 18+
- Microsoft SQL Server (or Docker)

### 1. Clone the repository

```bash
git clone git@github.com:kadiratali/Pusula.git
cd Pusula
```

### 2. Start the database (Docker)

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Pusula123!" \
  -p 1433:1433 --name pusula-mssql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 3. Server setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=master
DB_USER=sa
DB_PASSWORD=Pusula123!
PORT=3001
```

Create the tables:

```bash
npm run init-db
```

Start the server:

```bash
npm run dev
```

### 4. Client setup

```bash
cd client
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

## Project Structure

```
Pusula/
├── server/
│   └── src/
│       ├── config/
│       │   ├── db.js          # MSSQL connection pool
│       │   └── initDb.js      # Table creation script
│       ├── routes/
│       │   ├── projects.js    # Project endpoints
│       │   └── testCases.js   # Test case & step endpoints
│       └── index.js
└── client/
    └── src/
        ├── api/               # Axios endpoint helpers
        └── pages/
            ├── Projects.jsx        # Project list
            ├── ProjectDetail.jsx   # Test case list
            └── TestCaseDetail.jsx  # Case detail & step editor
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |
| GET | `/api/projects/:pid/cases` | List cases for a project |
| POST | `/api/projects/:pid/cases` | Create a test case |
| GET | `/api/cases/:id` | Get case with steps |
| PUT | `/api/cases/:id` | Update a test case |
| DELETE | `/api/cases/:id` | Delete a test case |
| PUT | `/api/cases/:id/steps` | Bulk save steps |
