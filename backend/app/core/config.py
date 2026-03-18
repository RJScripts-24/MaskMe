import os
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

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
