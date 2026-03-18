import os
from pydantic_settings import BaseSettings
from typing import Optional
from pydantic import field_validator
import torch

class Settings(BaseSettings):
    PROJECT_NAME: str = "Face-Shield API"
    API_V1_STR: str = "/api/v1"

    # AI Settings
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    MODEL_NAME: str = "resnet50"

    # MongoDB Settings
    MONGODB_URL: str
    DATABASE_NAME: str = "faceshield"
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = 15000
    MONGODB_CONNECT_TIMEOUT_MS: int = 15000
    MONGODB_SOCKET_TIMEOUT_MS: int = 30000

    # Google Auth Settings
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # Security Settings
    SECRET_KEY: str = "your-secret-key-change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # CORS Settings
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def validate_cors_origins(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []
            if raw.startswith("[") and raw.endswith("]"):
                # Supports JSON array input from environment variable values.
                items = raw[1:-1].split(",")
                return [item.strip().strip('"').strip("'") for item in items if item.strip()]
            return [item.strip() for item in raw.split(",") if item.strip()]
        return value

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
