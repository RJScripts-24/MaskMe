from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from PIL import ImageChops
from app.schemas.image_schema import ShieldResponse
from app.utils.image_utils import read_image_file, image_to_base64
from app.services.attack_engine import attack_engine

router = APIRouter()

@router.post("/cloak", response_model=ShieldResponse)
async def cloak_image(file: UploadFile = File(...), epsilon: float = Form(0.03)):
    try:
        original_image = await read_image_file(file)
        
        result = attack_engine.process(original_image, epsilon)
        
        cloaked_b64 = image_to_base64(result["cloaked_image"])
        
        # Calculate noise map for X-Ray Mode
        diff = ImageChops.difference(original_image, result["cloaked_image"])
        # Amplify the difference to make it visible (multiply by 10)
        diff = diff.point(lambda p: p * 10)
        noise_map_b64 = image_to_base64(diff)
        
        return ShieldResponse(
            status="success",
            original_confidence=result["original_confidence"],
            cloaked_confidence=result["cloaked_confidence"],
            original_label=result["original_label"],
            cloaked_label=result["cloaked_label"],
            cloaked_image=cloaked_b64,
            noise_map=noise_map_b64
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))