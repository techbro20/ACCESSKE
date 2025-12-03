# ACCESSKE

Unified project containing **backend (FastAPI + Alembic + PostgreSQL)** and **frontend (React)** under one repository.

---

## Project Structure
ACCESSKE/
├── backend/
│ ├── app/
│ ├── alembic/
│ ├── alembic.ini
│ ├── requirements.txt
│ └── .gitignore
├── frontend/
│ ├── src/
│ ├── public/
│ └── .gitignore
└── .gitignore (parent)


---

## Backend Setup

### Create Virtual Environment
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

### Environment Variables  
Create:
backend/.env

Add:
DATABASE_URL=<your_database_url>
SECRET_KEY=<secret>

### Run Backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

### Database Migrations
alembic revision --autogenerate -m "message"
alembic upgrade head

---

## Frontend Setup

### Install Dependencies
cd frontend
npm install

### Environment Variables  
Create:
frontend/.env

Add:
REACT_APP_BYPASS_AUTH=false
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000

### Run Frontend
npm start

### Build for Production
npm run build

Build output appears in:
frontend/build/

---

## Production Deployment (Bundled)

1. Build the frontend:
cd frontend
npm run build

2. Copy the build output into backend static directories:
backend/app/static/
backend/app/templates/

3. Start backend:
uvicorn app.main:app

Backend will now serve the frontend automatically.

---

## Requirements Freeze (Backend)
cd backend
pip freeze > requirements.txt

---

## Git Structure Notes

- **Parent `.gitignore`** prevents global junk files from being added.
- **Backend `.gitignore`** excludes `.env`, `.venv`, caches, logs.
- **Frontend `.gitignore`** excludes `.env`, `node_modules`, `build`.

---

## Summary

- Backend provides API, WebSocket, and static file serving.
- Frontend runs independently during development.
- Production mode: backend serves frontend build.
- Environment files stay local and are not committed.
