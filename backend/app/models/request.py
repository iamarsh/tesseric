"""
Request models for Tesseric API.

Pydantic models for validating incoming requests.
"""

from pydantic import BaseModel, Field, field_validator
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

    provider: Literal["aws"] = Field(
        default="aws",
        description="Cloud provider (only 'aws' supported in v1.0)",
    )

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, v: str) -> str:
        """Ensure only AWS is supported in v1.0."""
        if v != "aws":
            raise ValueError(
                "Only 'aws' provider is supported in v1.0. "
                "Multi-cloud support (Azure, GCP, n8n) is planned for Phase 3+."
            )
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "design_text": "Single AZ deployment with EC2 instances behind an ALB. "
                "RDS MySQL database in the same AZ. No backups configured.",
                "format": "text",
                "tone": "standard",
                "provider": "aws",
            }
        }
