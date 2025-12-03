from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
  title: str
  description: str
  date: datetime
  venue: str
  poster_path: str | None = None


class EventCreate(EventBase):
  pass


class EventResponse(EventBase):
  id: str
  created_at: datetime = Field(alias="createdAt")
  poster_path: str | None = Field(None, alias="posterPath")

  model_config = ConfigDict(from_attributes=True)

