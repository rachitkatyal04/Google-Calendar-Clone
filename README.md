# Google Calendar Clone (React + Node.js + MongoDB)

High‑fidelity calendar focused on smooth UX, realistic interactions, and full CRUD. Includes Month and Week views, all‑day row, left sidebar (mini calendar and calendar list), theme toggle (light/dark), and public holidays.

## Tech stack and choices

- Frontend: Vite + React 18, Axios
  - Chosen for fast DX, small bundle, and easy composition of interactive views.
- Styling: CSS variables + utility classes
  - Keeps bundle tiny while allowing runtime theme switch and high‑contrast dark mode.
- Backend: Node.js + Express + Mongoose
  - Simple, predictable CRUD; MongoDB Date fields map well to ISO timestamps.
- Database: MongoDB
  - Flexible for event storage and future recurrence rules.

## Project structure

```
backend/                 # Express API, MongoDB models, routes
  src/
    config/db.js         # Mongo connection
    models/Event.js      # Event schema
    routes/events.js     # CRUD + range overlap query
    routes/holidays.js   # Holidays proxy (Nager.Date + Google ICS)
    middleware/...
    server.js
frontend/                # Vite + React app
  src/
    api/client.js        # Axios client + API helpers
    components/
      CalendarGrid.jsx   # Month view grid
      WeekGrid.jsx       # Week time grid + all‑day row
      EventModal.jsx     # Create/Edit/Delete modal
      Sidebar.jsx        # Mini calendar + calendar lists
    App.jsx              # View state, data fetching, theme
    styles.css           # Light/Dark theme, layout, interactions
```

## Setup & run

1. Backend

```
cd backend
cp .env.example .env  # or create .env with PORT and MONGO_URI
npm install
npm run dev
```

2. Frontend (new terminal)

```
cd frontend
npm install
npm run dev
```

Default ports

- Frontend: http://localhost:5173 (proxies `/api` → http://localhost:5000)
- Backend: http://localhost:5000

## Using the app

- Create: click any day cell (Month/Week) or “+ Create” → fill the modal → Save.
- Edit: click an event → change fields → Save.
- Delete: click an event → Delete.
- Holidays: toggle “Holidays in India” in the sidebar. Holidays are read‑only.
- Theme: toggle sun/moon in the top bar. Persisted to `localStorage`.

## API reference

Events

- `GET /api/events?start=ISO&end=ISO` — Returns events that overlap the range (inclusive). Overlap condition: `event.start < end && event.end > start`.
- `POST /api/events` — Body `{ title, description?, start, end, allDay?, color? }`
- `PUT /api/events/:id` — Partial body; date strings allowed
- `DELETE /api/events/:id`

Holidays

- `GET /api/holidays/:country/:year` — Public holidays via Nager.Date
- `GET /api/holidays/google/:country/:year` — Google public Holidays ICS (currently `IN` supported)

Notes

- All dates are ISO strings in UI/over‑the‑wire; stored as Mongo `Date`.
- Validation: `end >= start` enforced. 400 if required fields missing; 404 on unknown IDs.

## Architecture

Frontend

- `App.jsx` holds view date, active view (Week/Month), visible range, events cache, holidays toggle, and modal state.
- Month view (`CalendarGrid.jsx`)
  - Computes `gridStart`/`gridEnd` by expanding month to full weeks (Sun→Sat).
  - Emits `onRangeChange(startISO, endISO)` to load data only for the visible range.
- Week view (`WeekGrid.jsx`)
  - Sticky day header, all‑day row, and a 24h time grid (60px per hour) with absolute‑positioned event blocks.
  - `getTopAndHeight` converts start/end minutes into pixel positions. All‑day events render in the all‑day row.
- Sidebar (`Sidebar.jsx`)
  - Mini calendar allows quick navigation; today is circled; includes calendars list with holiday toggle.
- Styling (`styles.css`)
  - CSS variables for theme tokens; dark mode overrides; sticky headers; hover/focus states. No external CSS framework.

Backend

- `routes/events.js` implements overlap query and CRUD. All non‑200 errors go through a centralized error handler.
- `models/Event.js` includes schema validation (title, start, end, allDay, color) and a pre‑save guard (`end >= start`).
- `routes/holidays.js` fetches holidays from Nager.Date; also parses Google Holiday ICS for better parity and deduplicates.

## Business logic & edge cases

- Timezone handling
  - User input is local time; stored as ISO → Mongo `Date`. All‑day holidays are generated using local midnight to prevent off‑by‑one day shifts.
- Range loading
  - Month/Week views emit visible `[start,end]` to avoid fetching unnecessary data.
- Overlaps
  - Backend returns any event overlapping the range (not just contained). The Week view visually stacks overlapping events; hard conflict resolution (e.g., collision avoidance) is a future enhancement.
- Data validation
  - `title`, `start`, `end` required; `400` returned if missing. `404` for unknown IDs; `500` for unexpected errors via error handler.
- Holidays
  - When using Google ICS, all‑day ranges are converted to local date boundaries and deduplicated by `title + date`.
- Recurring events (not implemented yet)
  - Recommended design: store an RRULE (RFC 5545) with optional EXDATE/EXRULE and expand occurrences when querying; cache expansions per range.

## Interactions & micro‑animations

- Sticky headers for Week/Month to keep context while scrolling.
- Subtle hover states for day cells, buttons, and event pills.
- Modal open/close uses native focus management; ESC/overlay click to close.
- Smooth mouse interactions for all‑day and timed event clicks; pointer‑events are constrained to avoid accidental day selection when clicking an event.

## Future enhancements

- Recurring events UI/engine (RRULE, EXDATE, timezone rules, series edits)
- Drag & drop and resize of events with live collision layout
- Multi‑calendar + per‑calendar colors; ICS import/export
- Auth and real user accounts; sharing and invitations
- Server‑side pagination and caching for large datasets
- Timezone selector and working‑hours shading
- Accessibility: full keyboard navigation and screen‑reader labels
- Tests: unit tests (date helpers), integration tests (API), E2E smoke (Cypress/Playwright)

## License

MIT — use freely. Attribution appreciated.
