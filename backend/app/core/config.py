import os
import json
from pydantic_settings import BaseSettings
from typing import Optional
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
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000"

    def get_cors_origins(self) -> list[str]:
        raw = (self.BACKEND_CORS_ORIGINS or "").strip()
        if not raw:
            return []

        # Accept JSON list or comma-separated values from env providers like Render.
        if raw.startswith("[") and raw.endswith("]"):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(item).strip().rstrip("/") for item in parsed if str(item).strip()]
            except json.JSONDecodeError:
                pass

        return [item.strip().rstrip("/") for item in raw.split(",") if item.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
