from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


class TransferAssessment(BaseModel):
    score: float
    level: str
    note: str
    models: Dict[str, dict]

class ShieldResponse(BaseModel):
    status: str
    original_confidence: float
    cloaked_confidence: float
    original_label: str
    cloaked_label: str
    cloaked_image: str
    noise_map: Optional[str] = None
    transfer_assessment: Optional[TransferAssessment] = None


class ReportRequest(BaseModel):
    """Schema for security certificate report generation request"""
    original_image: str
    cloaked_image: str
    original_label: str
    cloaked_label: str
    original_confidence: float
    cloaked_confidence: float

class HistoryItem(BaseModel):
    id: str
    original_image: str
    cloaked_image: str
    original_label: str
    cloaked_label: str
    original_confidence: float
    cloaked_confidence: float
    timestamp: datetime

class VerifyResponse(BaseModel):
    label: str
    confidence: float

class MultiShieldResponse(BaseModel):
    results: list[ShieldResponse]
