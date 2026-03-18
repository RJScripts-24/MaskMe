from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import StreamingResponse
from PIL import ImageChops
from app.schemas.image_schema import ShieldResponse, ReportRequest, HistoryItem, VerifyResponse
from app.utils.image_utils import read_image_file, image_to_base64
from app.services.attack_engine import attack_engine
from app.services.robustness import robustness_tester
from app.services.verifier import Verifier
from app.utils.certificate import create_certificate
from app.utils.logger import get_logger
from app.api.deps import get_current_user
from app.core.database import get_database
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from typing import List
import torch
from pymongo.errors import PyMongoError

logger = get_logger(__name__)

router = APIRouter()

def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")
    return db

@router.post("/cloak", response_model=ShieldResponse)
async def cloak_image(
    file: UploadFile = File(...),
    epsilon: float = Form(0.03),
    attack_type: str = Form("FGSM"),
    current_user: dict = Depends(get_current_user)
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

        # Save to database history
        db = require_database()
        history_entry = {
            "user_id": current_user["_id"],
            "original_image": image_to_base64(original_image),
            "cloaked_image": cloaked_b64,
            "original_label": result["original_label"],
            "cloaked_label": result["cloaked_label"],
            "original_confidence": result["original_confidence"],
            "cloaked_confidence": result["cloaked_confidence"],
            "timestamp": datetime.utcnow()
        }
        try:
            await db.history.insert_one(history_entry)
        except PyMongoError as write_exc:
            # Do not fail image protection if audit history persistence is temporarily unavailable.
            logger.warning(f"History write failed during cloak, returning protection result without persistence: {str(write_exc)}")

        return ShieldResponse(
            status="success",
            original_confidence=result["original_confidence"],
            cloaked_confidence=result["cloaked_confidence"],
            original_label=result["original_label"],
            cloaked_label=result["cloaked_label"],
            cloaked_image=cloaked_b64,
            noise_map=noise_map_b64
        )
    except PyMongoError as e:
        logger.exception(f"Database access failed during cloak: {str(e)}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")
    except Exception as e:
        logger.error(f"Cloak failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report")
async def generate_report(
    request: ReportRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        logger.info("Generating security certificate report")

        stats = {
            "original_label": request.original_label,
            "original_confidence": request.original_confidence,
            "cloaked_label": request.cloaked_label,
            "cloaked_confidence": request.cloaked_confidence
        }

        pdf_buffer = create_certificate(
            original_b64=request.original_image,
            cloaked_b64=request.cloaked_image,
            stats=stats
        )

        logger.info("Security certificate generated successfully")

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
    test_type: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Starting robustness test: {test_type}")

        valid_tests = ["jpeg", "blur", "resize"]
        if test_type not in valid_tests:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid test_type. Must be one of: {', '.join(valid_tests)}"
            )

        image = await read_image_file(file)
        transformed_image = robustness_tester.process_test(image, test_type)

        preprocessed = attack_engine.preprocess(transformed_image).unsqueeze(0).to(attack_engine.device)

        with torch.no_grad():
            output = attack_engine.model(preprocessed)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            confidence, label_idx = torch.max(probabilities, 0)

        new_label = attack_engine.class_names[label_idx.item()]
        new_confidence = round(confidence.item(), 4)

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

@router.get("/history", response_model=List[HistoryItem])
async def get_history(current_user: dict = Depends(get_current_user)):
    try:
        db = require_database()
        cursor = db.history.find({"user_id": current_user["_id"]}).sort("timestamp", -1)
        history = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            history.append(HistoryItem(**doc))
        return history
    except PyMongoError as e:
        logger.exception(f"Database read failed during history fetch: {str(e)}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

@router.delete("/history/{item_id}")
async def delete_history_item(item_id: str, current_user: dict = Depends(get_current_user)):
    try:
        db = require_database()
        result = await db.history.delete_one({
            "_id": ObjectId(item_id),
            "user_id": current_user["_id"]
        })
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="History item not found")
        return {"status": "success", "message": "Item deleted"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid history item id")
    except PyMongoError as e:
        logger.exception(f"Database delete failed during history removal: {str(e)}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

@router.post("/verify", response_model=VerifyResponse)
async def verify_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        logger.info("Starting verification check with different model")
        image = await read_image_file(file)
        result = Verifier.verify_image(image)
        return VerifyResponse(**result)
    except Exception as e:
        logger.error(f"Verification failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
