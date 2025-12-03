from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ChatMessageSchema(BaseModel):
  sender: str
  text: str
  timestamp: datetime = Field(default_factory=datetime.utcnow, alias="timestamp")


class ChatMessageStored(BaseModel):
  id: str
  sender_id: str
  sender_name: str
  text: str
  created_at: datetime = Field(alias="createdAt")

  model_config = ConfigDict(from_attributes=True)

