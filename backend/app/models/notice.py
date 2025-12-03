import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text

from .base import Base


def _utcnow():
  return datetime.now(timezone.utc)


class Notice(Base):
  __tablename__ = "notices"

  id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
  title = Column(String(255), nullable=False)
  content = Column(Text, nullable=False)
  created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

