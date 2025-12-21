from pydantic import BaseModel

class ShieldResponse(BaseModel):
    status: str
    original_confidence: float
    cloaked_confidence: float
    cloaked_image: str