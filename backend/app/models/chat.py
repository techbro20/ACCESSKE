import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text

from .base import Base


def _utcnow():
  return datetime.now(timezone.utc)


class ChatMessage(Base):
  __tablename__ = "chat_messages"

  id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
  sender_id = Column(String(36), ForeignKey("users.id"), nullable=False)
  sender_name = Column(String(150), nullable=False)
  text = Column(Text, nullable=False)
  created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)

