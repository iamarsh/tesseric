"""
Architecture review endpoint.

Main API for analyzing AWS architectures and returning structured feedback.
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Request
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from typing import Optional
import logging
import asyncio

from app.models.request import ReviewRequest
from app.models.response import ReviewResponse
from app.services.rag import analyze_design, analyze_design_from_image
from app.utils.exceptions import ImageProcessingException
from app.graph.neo4j_client import neo4j_client

router = APIRouter()
logger = logging.getLogger(__name__)


async def write_to_graph_background(review_response: ReviewResponse):
    """
    Background task to write review to Neo4j knowledge graph.

    Runs async after response is returned to user - does not block review.
    Handles Neo4j failures gracefully (logs error but doesn't crash).
    """
    try:
        # Convert Pydantic model to dict for Neo4j client
        review_dict = review_response.model_dump()

        async with neo4j_client as client:
            success = await client.write_analysis(review_dict)
            if success:
                logger.info(f"Successfully wrote review {review_response.review_id} to graph")
            else:
                logger.warning(f"Failed to write review {review_response.review_id} to graph")
    except Exception as e:
        logger.error(f"Background graph write error: {e}", exc_info=True)


@router.post("/review", response_model=ReviewResponse)
async def review_architecture(
    request: Request,
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
    if design_text and file:
        raise HTTPException(
            status_code=400,
            detail="Cannot provide both design_text and file. Choose one input method.",
        )

    try:
        if file:
            # Image processing path
            logger.info(f"Processing image upload: {file.filename} ({file.content_type})")
            review = await analyze_design_from_image(file, tone, provider)

            # Write to knowledge graph in background (don't block response)
            asyncio.create_task(write_to_graph_background(review))

            return review

        # Text processing path (JSON or form)
        if design_text:
            try:
                review_request = ReviewRequest(
                    design_text=design_text, format=format, tone=tone, provider=provider
                )
            except ValidationError as exc:
                raise RequestValidationError(exc.errors()) from exc
        else:
            try:
                payload = await request.json()
            except Exception:
                payload = None

            if not payload:
                raise HTTPException(
                    status_code=400, detail="Must provide either design_text or file"
                )

            try:
                review_request = ReviewRequest(**payload)
            except ValidationError as exc:
                raise RequestValidationError(exc.errors()) from exc

        review = await analyze_design(review_request)

        # Write to knowledge graph in background (don't block response)
        asyncio.create_task(write_to_graph_background(review))

        return review

    except ImageProcessingException as e:
        logger.error(f"Image processing failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except RequestValidationError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Review analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Architecture review failed")
