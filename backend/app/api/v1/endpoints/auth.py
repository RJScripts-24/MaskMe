from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.database import get_database
from app.utils.auth_utils import verify_google_token, create_access_token
from app.schemas.user import UserCreate, User
from datetime import datetime
from pymongo.errors import PyMongoError
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

class GoogleToken(BaseModel):
    token: str

@router.post("/google-login")
async def google_login(token_data: GoogleToken):
    # 1. Verify Google Token
    google_user = await verify_google_token(token_data.token)
    if not google_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    db = get_database()
    if db is None:
        logger.error("MongoDB unavailable during google-login")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database temporarily unavailable",
        )

    users_collection = db.users

    try:
        # 2. Check if user exists
        user_data = await users_collection.find_one({"google_id": google_user['sub']})

        if not user_data:
            # 3. Create new user if they don't exist
            new_user = {
                "email": google_user['email'],
                "full_name": google_user.get('name'),
                "profile_pic": google_user.get('picture'),
                "google_id": google_user['sub'],
                "is_active": True,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            result = await users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
        else:
            # 4. Update last login
            user_id = str(user_data['_id'])
            await users_collection.update_one(
                {"_id": user_data['_id']},
                {"$set": {"last_login": datetime.utcnow()}}
            )
    except PyMongoError as exc:
        logger.exception("MongoDB operation failed during google-login: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database temporarily unavailable",
        )

    # 5. Generate JWT
    access_token = create_access_token(subject=user_id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": google_user['email'],
            "name": google_user.get('name'),
            "picture": google_user.get('picture')
        }
    }
