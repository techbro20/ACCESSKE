# ACCESSKE

Unified project containing **backend (FastAPI + Alembic + PostgreSQL + Socket.IO + Redis)** and **frontend (Next.js App Router)** under one repository.

---

## Architecture

| Layer | Stack | Hosting |
| --- | --- | --- |
| UI | Next.js (App Router, TypeScript, Tailwind) | Vercel or any Node host (or reverse-proxied) |
| API + realtime chat | FastAPI + `python-socketio` + Redis | VPS |
| Database | PostgreSQL + Alembic | VPS |

The Next.js app is UI-only. The browser calls the VPS for REST (`NEXT_PUBLIC_API_URL`) and Socket.IO (`NEXT_PUBLIC_WS_URL`). Chat does **not** run inside the Next.js process.

```
Browser ──REST/WS──► FastAPI + Socket.IO + Redis (VPS)
   │
   └── renders Next.js UI (separate host)
```

---

## Project Structure

```
ACCESSKE/
├── backend/          # FastAPI, Alembic, Socket.IO
├── frontend/         # Next.js App Router
└── README.md
```

---

## Backend Setup

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Unix:    source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
DATABASE_URL=<your_database_url>
SECRET_KEY=<secret>
```

Run API (includes Socket.IO):

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Migrations:

```bash
alembic revision --autogenerate -m "message"
alembic upgrade head
```

CORS on FastAPI must allow your Next.js origin (local `http://localhost:3000` and your production frontend domain).

---

## Frontend Setup (Next.js)

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (see `.env.example`):

```
NEXT_PUBLIC_BYPASS_AUTH=false
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Production (point at the VPS):

```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
```

Run:

```bash
npm run dev      # http://localhost:3000
npm run build
npm start
```

---

## Production Deployment (split)

1. **VPS** — run FastAPI + Socket.IO + Redis + PostgreSQL. Serve HTTPS/WSS (e.g. Nginx).
2. **Next.js** — deploy `frontend/` to Vercel (or another host). Set `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` to the VPS origins.
3. Do **not** copy a CRA `build/` into `backend/app/static` anymore; the UI is hosted separately.

Optional: reverse-proxy both under one domain (`/` → Next, `/api` + Socket.IO → FastAPI). Env URLs should still match what the browser uses.

---

## Routes (frontend)

| Path | Access |
| --- | --- |
| `/` | Landing |
| `/login`, `/register` | Public |
| `/dashboard`, `/profile`, `/chat`, `/notices`, `/events` | Authenticated |
| `/admin`, `/admin/*`, `/invite` | Admin |

Realtime chat uses the same Socket.IO events as before: `message`, `message_updated`, `message_deleted`, `messages_cleared`.

---

## Requirements Freeze (Backend)

```bash
cd backend
pip freeze > requirements.txt
```

---

## Git Notes

- Parent `.gitignore` ignores global junk.
- Backend `.gitignore` excludes `.env`, `.venv`, caches.
- Frontend `.gitignore` excludes `.env*`, `node_modules`, `.next`.
