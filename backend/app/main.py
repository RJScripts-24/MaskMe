from fastapi import FastAPI
from app.api.v1.api import api_router
from app.core.middleware import setup_cors

app = FastAPI(title="Face-Shield API")

setup_cors(app)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"status": "active", "message": "Face-Shield Intelligence Layer Online"}