from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from PIL import ImageChops
from app.schemas.image_schema import ShieldResponse, ReportRequest
from app.utils.image_utils import read_image_file, image_to_base64
from app.services.attack_engine import attack_engine
from app.utils.certificate import create_certificate
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("/cloak", response_model=ShieldResponse)
async def cloak_image(
    file: UploadFile = File(...), 
    epsilon: float = Form(0.03),
    attack_type: str = Form("FGSM")
):
    try:
        original_image = await read_image_file(file)
        
        result = attack_engine.process(original_image, epsilon, method=attack_type)
        
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


@router.post("/report")
async def generate_report(request: ReportRequest):
    """
    Generate a professional PDF security audit report.
    
    This endpoint accepts adversarial attack results and generates a comprehensive
    PDF audit report containing visual comparisons, metrics, and security stamps.
    
    Args:
        request: ReportRequest containing original and cloaked images with their metrics
        
    Returns:
        StreamingResponse: PDF file as downloadable content
        
    Raises:
        HTTPException: If PDF generation fails
    """
    try:
        logger.info("Generating security certificate report")
        
        # Prepare stats dictionary
        stats = {
            "original_label": request.original_label,
            "original_confidence": request.original_confidence,
            "cloaked_label": request.cloaked_label,
            "cloaked_confidence": request.cloaked_confidence
        }
        
        # Generate PDF
        pdf_buffer = create_certificate(
            original_b64=request.original_image,
            cloaked_b64=request.cloaked_image,
            stats=stats
        )
        
        logger.info("Security certificate generated successfully")
        
        # Return as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=audit_report.pdf"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to generate security certificate: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )