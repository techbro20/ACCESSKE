from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import get_settings
from ..models.base import Base

settings = get_settings()

connect_args = {}
if str(settings.database_url).startswith("sqlite"):
  connect_args = {"check_same_thread": False}

engine = create_engine(str(settings.database_url), future=True, echo=False, connect_args=connect_args)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)


def init_db():
  Base.metadata.create_all(bind=engine)


def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

