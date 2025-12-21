from fastapi import APIRouter
from app.api.v1.endpoints import shield, health

api_router = APIRouter()

api_router.include_router(shield.router, prefix="/shield", tags=["Shield"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])