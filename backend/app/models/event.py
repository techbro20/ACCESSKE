import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text

from .base import Base


def _utcnow():
  return datetime.now(timezone.utc)


class Event(Base):
  __tablename__ = "events"

  id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
  title = Column(String(255), nullable=False)
  description = Column(Text, nullable=False)
  date = Column(DateTime(timezone=True), nullable=False)
  venue = Column(String(255), nullable=False)
  poster_path = Column(String(500), nullable=True)
  created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

