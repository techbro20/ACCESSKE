from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
  model_config = ConfigDict(from_attributes=True, populate_by_name=True)

  id: str
  first_name: str = Field(..., alias="firstName")
  last_name: str = Field(..., alias="lastName")
  email: EmailStr
  role: str
  active: bool


class UserCreate(BaseModel):
  first_name: str = Field(..., alias="firstName", min_length=1)
  last_name: str = Field(..., alias="lastName", min_length=1)
  email: EmailStr
  password: str = Field(min_length=6)
  invite_token: str = Field(..., alias="inviteToken", min_length=1)

  model_config = ConfigDict(populate_by_name=True)


class UserLogin(BaseModel):
  email: EmailStr
  password: str


class TokenResponse(BaseModel):
  access_token: str
  token_type: str = "bearer"


class InviteTokenOut(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  id: str
  token: str
  created_at: datetime = Field(alias="createdAt")
  expires_at: datetime | None = Field(default=None, alias="expiresAt")
  used: bool

