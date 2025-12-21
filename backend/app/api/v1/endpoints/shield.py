from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from PIL import ImageChops
from app.schemas.image_schema import ShieldResponse, ReportRequest
from app.utils.image_utils import read_image_file, image_to_base64
from app.services.attack_engine import attack_engine
from app.services.robustness import robustness_tester
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


@router.post("/robustness")
async def test_robustness(
    file: UploadFile = File(...),
    test_type: str = Form(...)
):
    """
    Test the robustness of adversarial attacks under real-world conditions.
    
    This endpoint simulates real-world transformations (compression, blur, resize) on
    cloaked images to verify if the adversarial attack "survives" these conditions.
    
    Args:
        file: UploadFile - The cloaked image to test
        test_type: str - Type of test ("jpeg", "blur", or "resize")
        
    Returns:
        JSON response with:
        - status: "success" or "error"
        - new_label: Classification label after transformation
        - new_confidence: Confidence score after transformation
        - transformed_image: Base64 encoded transformed image
        
    Raises:
        HTTPException: If test fails or invalid test_type provided
    """
    try:
        logger.info(f"Starting robustness test: {test_type}")
        
        # Validate test_type
        valid_tests = ["jpeg", "blur", "resize"]
        if test_type not in valid_tests:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid test_type. Must be one of: {', '.join(valid_tests)}"
            )
        
        # Read the uploaded image
        image = await read_image_file(file)
        logger.info(f"Image loaded: {image.size}, mode: {image.mode}")
        
        # Apply the transformation
        transformed_image = robustness_tester.process_test(image, test_type)
        logger.info("Transformation applied successfully")
        
        # Run inference on the transformed image (no attack, just prediction)
        import torch
        preprocessed = attack_engine.preprocess(transformed_image).unsqueeze(0).to(attack_engine.device)
        
        with torch.no_grad():
            output = attack_engine.model(preprocessed)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            confidence, label_idx = torch.max(probabilities, 0)
        
        new_label = attack_engine.class_names[label_idx.item()]
        new_confidence = round(confidence.item(), 4)
        
        logger.info(f"Prediction after {test_type}: {new_label} ({new_confidence})")
        
        # Convert transformed image to base64
        transformed_b64 = image_to_base64(transformed_image)
        
        return {
            "status": "success",
            "new_label": new_label,
            "new_confidence": new_confidence,
            "transformed_image": transformed_b64
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Robustness test failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Robustness test failed: {str(e)}"
        )
