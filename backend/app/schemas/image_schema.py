from pydantic import BaseModel
from typing import Optional

class ShieldResponse(BaseModel):
    status: str
    original_confidence: float
    cloaked_confidence: float
    original_label: str
    cloaked_label: str
    cloaked_image: str
    noise_map: Optional[str] = None