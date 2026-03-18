from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pymongo.errors import PyMongoError
from app.core.config import settings
from app.core.database import get_database
from app.utils.logger import get_logger
from bson import ObjectId
from bson.errors import InvalidId

logger = get_logger(__name__)

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_current_user(token: str = Depends(reusable_oauth2)) -> dict:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    db = get_database()
    if db is None:
        logger.error("MongoDB database handle is not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable",
        )

    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except InvalidId:
        logger.warning("Invalid user_id in token", extra={"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    except PyMongoError as exc:
        logger.exception("Failed to fetch current user from MongoDB: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database temporarily unavailable",
        )

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user
