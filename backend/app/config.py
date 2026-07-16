from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_expire_min: int = 1440
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"


settings = Settings()
