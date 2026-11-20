from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


# Centralize validated environment-backed settings for API and database components.
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # This loads all our environment variables and validate them at startup, so we can fail fast if any are missing or malformed.
    database_url: str = ""
    frontend_origin: str = "http://localhost:3000"
    better_auth_url: str = "http://localhost:3000"
    better_auth_secret: str = "" 

    @property
    def cors_origins(self) -> list[str]:
        # Normalize the configured comma-separated browser origins into an explicit CORS allowlist.
        return [origin.strip() for origin in self.frontend_origin.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    # Reuse a single settings object so every component sees consistent environment values.
    return Settings()


# Load configuration once at import time for use by API and database setup.
settings = get_settings()

