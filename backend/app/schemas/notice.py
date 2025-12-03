from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class NoticeBase(BaseModel):
  title: str
  content: str


class NoticeCreate(NoticeBase):
  pass


class NoticeResponse(NoticeBase):
  id: str
  created_at: datetime = Field(alias="createdAt")

  model_config = ConfigDict(from_attributes=True)

