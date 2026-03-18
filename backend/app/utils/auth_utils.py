from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt
import httpx
from app.core.config import settings

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def verify_google_token(token: str) -> Optional[dict]:
    """
    Verify Google access_token by calling Google's userinfo endpoint.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code != 200:
                return None

            user_info = response.json()
            # The 'sub' field is the unique Google ID
            return user_info
        except Exception:
            return None
