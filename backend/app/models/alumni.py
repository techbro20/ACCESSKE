import uuid
from sqlalchemy import Column, ForeignKey, String, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from .base import Base


def _utcnow():
  return datetime.now(timezone.utc)


class AlumniProfile(Base):
  __tablename__ = "alumni_profiles"

  id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
  user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
  cohort = Column(String(100), nullable=True)
  phone = Column(String(50), nullable=True)
  profession = Column(String(150), nullable=True)
  skills = Column(JSON, default=list)
  updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)

  user = relationship("User", back_populates="profile")

