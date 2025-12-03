from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ProfileBase(BaseModel):
  model_config = ConfigDict(from_attributes=True, populate_by_name=True)

  id: str
  first_name: str = Field(..., alias="firstName")
  last_name: str = Field(..., alias="lastName")
  email: str
  cohort: Optional[str] = None
  phone: Optional[str] = None
  profession: Optional[str] = None
  skills: List[str] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
  first_name: Optional[str] = Field(default=None, alias="firstName")
  last_name: Optional[str] = Field(default=None, alias="lastName")
  cohort: Optional[str] = None
  phone: Optional[str] = None
  profession: Optional[str] = None
  skills: Optional[List[str]] = None
  password: Optional[str] = None  # For password changes (admin only)

  model_config = ConfigDict(populate_by_name=True)


class AlumniListItem(ProfileBase):
  active: bool = True

