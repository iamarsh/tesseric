"""
Architecture review endpoint.

Main API for analyzing AWS architectures and returning structured feedback.
"""

from fastapi import APIRouter, HTTPException
from app.models.request import ReviewRequest
from app.models.response import ReviewResponse
from app.services.rag import analyze_design

router = APIRouter()


@router.post("/review", response_model=ReviewResponse)
async def review_architecture(request: ReviewRequest):
    """
    Analyze AWS architecture and return structured review.

    This endpoint accepts an architecture description (text or markdown) and returns
    structured feedback aligned with AWS Well-Architected Framework pillars.

    **v0.1**: Uses stubbed RAG service with pattern detection
    **v1.0+**: Will use Amazon Bedrock Knowledge Base + Claude 3 for real analysis

    Args:
        request: ReviewRequest with design_text, format, and tone

    Returns:
        ReviewResponse with risks, architecture_score, and summary

    Raises:
        HTTPException 400: Invalid request (Pydantic validation handles this)
        HTTPException 500: Internal server error during analysis
    """
    try:
        response = await analyze_design(request)
        return response
    except Exception as e:
        # Log error (TODO: Add proper logging in Phase 1)
        print(f"Error during architecture analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze architecture: {str(e)}",
        )
