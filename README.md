# Google Calendar Clone (React + Node.js + MongoDB)

High-fidelity monthly calendar with realistic interactions and CRUD-backed events.

## Tech Stack

- Frontend: React (Vite), Axios
- Backend: Node.js, Express, Mongoose
- Database: MongoDB

## Project Structure

```
backend/   # Express API, MongoDB models
frontend/  # Vite + React app
```

## Quick Start

1. Backend

```
cd backend
cp .env.example .env  # or create .env with PORT and MONGO_URI
npm install
npm run dev
```

2. Frontend (in a new terminal)

```
cd frontend
npm install
npm run dev
```

Dev server will run on http://localhost:5173 and proxy API requests to http://localhost:5000.

## API

- `GET /api/events?start=ISO&end=ISO` — events overlapping range
- `POST /api/events` — create event
- `PUT /api/events/:id` — update event
- `DELETE /api/events/:id` — delete event
