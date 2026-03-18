from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
            connectTimeoutMS=settings.MONGODB_CONNECT_TIMEOUT_MS,
            socketTimeoutMS=settings.MONGODB_SOCKET_TIMEOUT_MS,
        )
        # Force a connection check so startup state is explicit.
        await db.client.admin.command("ping")
        db.db = db.client[settings.DATABASE_NAME]
        logger.info("Connected to MongoDB!")
    except Exception as exc:
        logger.exception("MongoDB connection failed, running in degraded mode: %s", str(exc))
        db.db = None

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db.client is not None:
        db.client.close()
    logger.info("MongoDB connection closed.")

def get_database():
    return db.db
