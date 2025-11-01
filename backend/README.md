# Backend (Express + MongoDB)

## Setup

1. Create a `.env` file (see `.env.example`) and update values:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/google_calendar_clone
```

2. Install dependencies and run:

```
npm install
npm run dev
```

## Endpoints

- `GET /api/health` — Service status
- `GET /api/events?start=ISO&end=ISO` — List events overlapping the range
- `POST /api/events` — Create event
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete event

### Event JSON shape

```json
{
  "title": "Team Sync",
  "description": "Weekly stand-up",
  "start": "2025-11-01T09:00:00.000Z",
  "end": "2025-11-01T09:30:00.000Z",
  "allDay": false,
  "color": "#1a73e8"
}
```

> Overlap logic: events are returned when `event.start < end` and `event.end > start`.
