"""
Request models for Tesseric API.

Pydantic models for validating incoming requests.
"""

from pydantic import BaseModel, Field
from typing import Literal


class ReviewRequest(BaseModel):
    """Request model for architecture review."""

    design_text: str = Field(
        ...,
        description="Architecture description in text or markdown format",
        min_length=50,
        max_length=10000,
        examples=[
            "Single AZ deployment with EC2 instances behind an ALB. "
            "RDS MySQL database in the same AZ. No backups configured."
        ],
    )

    format: Literal["markdown", "text"] = Field(
        default="markdown",
        description="Input format (markdown or plain text)",
    )

    tone: Literal["standard", "roast"] = Field(
        default="standard",
        description="Response tone: 'standard' (professional) or 'roast' (direct/humorous)",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "design_text": "Single AZ deployment with EC2 instances behind an ALB. "
                "RDS MySQL database in the same AZ. No backups configured.",
                "format": "text",
                "tone": "standard",
            }
        }
