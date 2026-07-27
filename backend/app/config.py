from pathlib import Path

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_expire_min: int = 1440
    upload_dir: str = "uploads"

    class Config:
        env_file = BASE_DIR / ".env"


settings = Settings()
