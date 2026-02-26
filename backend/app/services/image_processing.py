"""
Image processing utilities for architecture diagram uploads.

Validates, resizes, and encodes images for Bedrock vision API.
"""

import base64
import io
from fastapi import UploadFile
from PIL import Image

from app.core.config import settings
from app.utils.exceptions import (
    ImageTooLargeException,
    UnsupportedImageFormatException,
    ImageCorruptedException,
)


async def validate_and_process_image(file: UploadFile) -> dict:
    """
    Validate image file and prepare for Bedrock vision API.

    Steps:
    1. Validate file size (< max_image_size_mb)
    2. Validate MIME type (must be in allowed_image_formats)
    3. Read image bytes
    4. For images (not PDFs): Resize if > 2048px (Claude vision limit)
    5. Convert to base64

    Args:
        file: FastAPI UploadFile from multipart form

    Returns:
        dict with:
            - image_data: base64-encoded string
            - format: "png" | "jpeg" | "pdf"
            - size_kb: original file size in KB
            - dimensions: (width, height) for images, None for PDFs

    Raises:
        ImageTooLargeException: File size exceeds max_image_size_mb
        UnsupportedImageFormatException: MIME type not in allowed_image_formats
        ImageCorruptedException: Unable to read/process image
    """
    # Read file bytes
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise ImageCorruptedException(f"Failed to read uploaded file: {str(e)}")

    # Validate file size
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > settings.max_image_size_mb:
        raise ImageTooLargeException(
            f"File size {size_mb:.2f} MB exceeds maximum {settings.max_image_size_mb} MB"
        )

    # Validate MIME type
    if file.content_type not in settings.allowed_image_formats:
        raise UnsupportedImageFormatException(
            f"File type {file.content_type} not supported. "
            f"Allowed: {', '.join(settings.allowed_image_formats)}"
        )

    # Determine format
    format_map = {
        "image/png": "png",
        "image/jpeg": "jpeg",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/bmp": "bmp",
        "image/tiff": "tiff",
        "application/pdf": "pdf",
    }
    image_format = format_map.get(file.content_type, "jpeg")

    # For PDFs, skip image processing (Bedrock handles directly)
    if file.content_type == "application/pdf":
        base64_data = base64.b64encode(file_bytes).decode("utf-8")
        return {
            "image_data": base64_data,
            "format": image_format,
            "size_kb": int(len(file_bytes) / 1024),
            "dimensions": None,
        }

    # For images: Open with PIL and apply aggressive optimization
    try:
        image = Image.open(io.BytesIO(file_bytes))
        original_dimensions = image.size  # (width, height)

        # OPTIMIZED: More aggressive resizing (1024px max instead of 2048px)
        # Phase 1 optimization: Smaller images = faster upload + processing
        # Trade-off: Slightly lower quality, but acceptable for diagram analysis
        max_dimension = 1024  # Down from 2048px
        if image.width > max_dimension or image.height > max_dimension:
            # Preserve aspect ratio with high-quality resampling
            image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

        # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")

        # OPTIMIZED: Always convert to JPEG for smaller payloads
        # PNG images can be 3-5x larger than JPEG for diagrams
        # Force JPEG format for all images (except PDFs)
        optimized_format = "jpeg"

        # Encode to bytes with compression
        output_buffer = io.BytesIO()
        # OPTIMIZED: Use JPEG quality=75 and optimize=True for smaller files
        # Quality 75 is good balance: ~30% smaller, minimal visual degradation
        image.save(
            output_buffer,
            format="JPEG",
            quality=75,
            optimize=True,
            progressive=True  # Progressive JPEG for better loading
        )
        processed_bytes = output_buffer.getvalue()

        # Base64 encode
        base64_data = base64.b64encode(processed_bytes).decode("utf-8")

        return {
            "image_data": base64_data,
            "format": optimized_format,  # Always "jpeg" after optimization
            "size_kb": int(len(file_bytes) / 1024),  # Original size
            "processed_size_kb": int(len(processed_bytes) / 1024),  # Optimized size
            "dimensions": original_dimensions,
            "optimized_dimensions": image.size,  # After resizing
            "optimization_applied": True,
        }

    except Exception as e:
        raise ImageCorruptedException(f"Failed to process image: {str(e)}")
