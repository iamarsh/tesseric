"""
Architecture review endpoint.

Main API for analyzing AWS architectures and returning structured feedback.
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from typing import Optional
import logging

from app.models.request import ReviewRequest
from app.models.response import ReviewResponse
from app.services.rag import analyze_design, analyze_design_from_image
from app.utils.exceptions import ImageProcessingException

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/review", response_model=ReviewResponse)
async def review_architecture(
    # Text input (original - now optional)
    design_text: Optional[str] = Form(None),
    format: str = Form("text"),
    tone: str = Form("standard"),
    provider: str = Form("aws"),
    # Image input (new)
    file: Optional[UploadFile] = File(None),
):
    """
    Analyze AWS architecture from text OR image.

    Accepts either:
    - design_text: Text description of AWS architecture
    - file: Architecture diagram (PNG/JPG/PDF, max 5 MB)

    Both cannot be provided simultaneously.

    Returns:
        ReviewResponse with risks, score, summary, and metadata

    Raises:
        HTTPException 400: Invalid request (missing input, both provided, or validation failed)
        HTTPException 500: Analysis failed
    """
    # Validate: exactly one input method
    if not design_text and not file:
        raise HTTPException(
            status_code=400, detail="Must provide either design_text or file"
        )

    if design_text and file:
        raise HTTPException(
            status_code=400,
            detail="Cannot provide both design_text and file. Choose one input method.",
        )

    try:
        # Route to appropriate handler
        if file:
            # Image processing path
            logger.info(f"Processing image upload: {file.filename} ({file.content_type})")
            review = await analyze_design_from_image(file, tone, provider)
        else:
            # Text processing path (existing)
            request = ReviewRequest(
                design_text=design_text, format=format, tone=tone, provider=provider
            )
            review = await analyze_design(request)

        return review

    except ImageProcessingException as e:
        logger.error(f"Image processing failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Review analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Architecture review failed")
