"""
Metrics response models for real-time production statistics.

Provides structured data for homepage metrics dashboard.
"""

from pydantic import BaseModel, Field
from typing import Dict


class MetricsResponse(BaseModel):
    """
    Real-time production metrics from Neo4j knowledge graph.

    Aggregates data across all analyses, findings, and AWS services
    to provide live statistics for the homepage dashboard.
    """

    total_reviews: int = Field(
        ...,
        description="Total number of architecture reviews analyzed",
        examples=[523],
    )

    unique_aws_services: int = Field(
        ...,
        description="Number of unique AWS services recognized across all reviews",
        examples=[72],
    )

    severity_breakdown: Dict[str, int] = Field(
        ...,
        description="Count of findings by severity level (CRITICAL, HIGH, MEDIUM, LOW)",
        examples=[{"CRITICAL": 15, "HIGH": 45, "MEDIUM": 120, "LOW": 85}],
    )

    avg_review_time_seconds: float = Field(
        ...,
        description="Average processing time for architecture reviews in seconds",
        examples=[8.3],
    )

    last_updated: str = Field(
        ...,
        description="ISO 8601 timestamp of when metrics were last computed",
        examples=["2026-01-31T10:30:00Z"],
    )

    class Config:
        json_schema_extra = {
            "example": {
                "total_reviews": 523,
                "unique_aws_services": 72,
                "severity_breakdown": {
                    "CRITICAL": 15,
                    "HIGH": 45,
                    "MEDIUM": 120,
                    "LOW": 85,
                },
                "avg_review_time_seconds": 8.3,
                "last_updated": "2026-01-31T10:30:00Z",
            }
        }
