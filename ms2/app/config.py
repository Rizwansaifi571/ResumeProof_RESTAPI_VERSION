import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    redis_url: str = Field(alias="REDIS_URL")
    database_url: str = Field(alias="DATABASE_URL")
    groq_api_key: str = Field(alias="GROQ_API_KEY")
    github_token: str = Field(alias="GITHUB_TOKEN")
    internal_secret: str = Field(alias="INTERNAL_SECRET")
    ms1_internal_url: str = Field(alias="MS1_INTERNAL_URL")
    ms2_port: int = Field(default=3002, alias="MS2_PORT")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

try:
    settings = Settings()
except Exception as e:
    print(f"Configuration validation failed: {e}")
    # Raise RuntimeError to fail fast on startup
    raise RuntimeError(f"Configuration validation failed: {e}") from e
