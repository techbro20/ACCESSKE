import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from .base import Base


def _utcnow() -> datetime:
  return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
  ADMIN = "admin"
  ALUMNI = "alumni"


class User(Base):
  __tablename__ = "users"

  id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
  email = Column(String(255), unique=True, index=True, nullable=False)
  hashed_password = Column(String(255), nullable=False)
  first_name = Column(String(100), nullable=False)
  last_name = Column(String(100), nullable=False)
  role = Column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.ALUMNI)
  active = Column(Boolean, nullable=False, default=True)
  bio = Column(Text, nullable=True)
  created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
  updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)

  profile = relationship("AlumniProfile", back_populates="user", uselist=False)
  created_invites = relationship("InviteToken", back_populates="created_by")


class InviteToken(Base):
  __tablename__ = "invite_tokens"

  id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
  token = Column(String(64), unique=True, nullable=False, index=True)
  created_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
  created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
  expires_at = Column(DateTime(timezone=True), nullable=True)
  used = Column(Boolean, default=False, nullable=False)

  created_by = relationship("User", back_populates="created_invites")

