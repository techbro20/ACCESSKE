from pydantic_settings import BaseSettings
from pydantic import AnyUrl, EmailStr
from functools import lru_cache


class Settings(BaseSettings):
  project_name: str = "ACCES Alumni API"
  api_prefix: str = "/api"
  database_url: AnyUrl | str
  jwt_secret_key: str
  jwt_algorithm: str = "HS256"
  access_token_expire_minutes: int = 60 * 24
  cors_origins: list[str] = ["http://localhost:3000"]
  default_admin_name: str = "System Admin"
  default_admin_email: EmailStr = "admin@acces.org"
  default_admin_password: str = "admin123"
  redis_url: str = "redis://localhost:6379/0"

  class Config:
    env_file = ".env"
    env_file_encoding = "utf-8"
    case_sensitive = False


@lru_cache(maxsize=1)
def get_settings() -> Settings:
  return Settings()

