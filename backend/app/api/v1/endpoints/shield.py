from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.image_schema import ShieldResponse
from app.utils.image_utils import read_image_file, image_to_base64
from app.services.attack_engine import attack_engine

router = APIRouter()

@router.post("/cloak", response_model=ShieldResponse)
async def cloak_image(file: UploadFile = File(...), epsilon: float = 0.03):
    try:
        original_image = await read_image_file(file)
        
        result = attack_engine.process(original_image, epsilon)
        
        cloaked_b64 = image_to_base64(result["cloaked_image"])
        
        return ShieldResponse(
            status="success",
            original_confidence=result["original_confidence"],
            cloaked_confidence=result["cloaked_confidence"],
            cloaked_image=cloaked_b64
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))