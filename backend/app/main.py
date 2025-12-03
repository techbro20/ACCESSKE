import asyncio
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import socketio.asgi

from .core.config import get_settings
from .core.database import SessionLocal, init_db
from .core.security import get_password_hash
from .models.alumni import AlumniProfile
from .models.user import User, UserRole
from .routers import auth, alumni, events, notices, chat, invite, reports, admin_users

settings = get_settings()


def ensure_default_admin():
  db = SessionLocal()
  try:
    existing = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if existing:
      return
    admin = User(
      email=settings.default_admin_email.lower(),
      first_name="System",
      last_name="Admin",
      hashed_password=get_password_hash(settings.default_admin_password),
      role=UserRole.ADMIN,
      active=True,
    )
    profile = AlumniProfile(user=admin, cohort="N/A", phone=None, profession="Administrator", skills=[])
    db.add(admin)
    db.add(profile)
    db.commit()
  finally:
    db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    ensure_default_admin()
    
    # Start Redis listener in background
    asyncio.create_task(chat.redis_listener())
    
    yield
    # Shutdown (optional)
    # Close Redis connection
    redis = await chat.get_redis()
    if redis:
        await redis.close()


app = FastAPI(title=settings.project_name, lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.cors_origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(alumni.router)
app.include_router(events.router)
app.include_router(notices.router)
app.include_router(chat.router)
app.include_router(invite.router)
app.include_router(reports.router)
app.include_router(admin_users.router)

# Mount static files for uploaded posters
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health_check():
  return {"status": "ok"}

# Wrap FastAPI app with Socket.IO - this becomes the main ASGI app
app = socketio.asgi.ASGIApp(chat.sio, app)

