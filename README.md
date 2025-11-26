# Librus Dzienniczek (React + Node)

Lightweight dashboard for Librus Synergia using the community `librus-api` package. Includes:
- Backend proxy (Node/Express) for auth, grades, timetable.
- Frontend (Vite + React + Mantine) with login, grades, timetable views.
 - UI built with Mantine components.
 - Uses `librus-api` by Mati365: https://github.com/Mati365/librus-api

## Quick start
### Backend
```bash
cd backend
cp .env.example .env   # adjust ports/origin if needed
npm install
npm run dev            # default: http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env   # ensure VITE_API_URL points to backend, default http://localhost:5000/api
npm install
npm run dev            # default: http://localhost:5173
```

### Available API routes
- `POST /api/login` – authorize with Librus credentials, returns sessionId.
- `GET /api/grades` – grades list (requires `x-session-id` header).
- `GET /api/timetable` – timetable for current week (requires `x-session-id`).
- `GET /api/health` – health check.

## Frontend views
- **Login** – dark theme, session stored locally.
- **Grades** – subject cards, semester breakdown, tooltips on grades.
- **Plan** – timetable with current-period countdown.

## Notes
- Messages feature has been removed for stability.
- The backend stores sessions in-memory; restart clears sessions.
- This project is for personal use; `librus-api` scrapes Synergia and is not official.
