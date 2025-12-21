import os
import torch
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Face-Shield API"
    API_V1_STR: str = "/api/v1"
    DEVICE: str = "cuda" if torch.cuda.is_available() else "cpu"
    MODEL_NAME: str = "resnet50"

settings = Settings()