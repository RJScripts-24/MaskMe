from fastapi import FastAPI
from app.api.v1.api import api_router
from app.core.middleware import setup_cors
from app.core.database import connect_to_mongo, close_mongo_connection

app = FastAPI(title="Face-Shield API")

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

setup_cors(app)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"status": "active", "message": "Face-Shield Intelligence Layer Online"}
