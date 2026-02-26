"""
Analytics models for production metrics and statistics.

Privacy-first: No architecture details, IP addresses, or PII.
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Any


class ProcessingPercentiles(BaseModel):
    """Processing time percentiles in milliseconds."""

    p50: float = Field(
        ...,
        description="Median (50th percentile) processing time in ms",
        examples=[8500.0],
    )

    p95: float = Field(
        ...,
        description="95th percentile processing time in ms",
        examples=[12000.0],
    )

    p99: float = Field(
        ...,
        description="99th percentile processing time in ms",
        examples=[15000.0],
    )


class TimeSeriesDataPoint(BaseModel):
    """Single data point in time series."""

    date: str = Field(
        ...,
        description="Date in ISO format (YYYY-MM-DD)",
        examples=["2026-02-25"],
    )

    count: int = Field(
        ...,
        description="Count of reviews on this date",
        examples=[15],
    )


class ScoreTrendDataPoint(BaseModel):
    """Single data point for score trends."""

    date: str = Field(
        ...,
        description="Date in ISO format (YYYY-MM-DD)",
        examples=["2026-02-25"],
    )

    avg_score: float = Field(
        ...,
        description="Average architecture score on this date",
        examples=[78.5],
    )


class TopServiceDataPoint(BaseModel):
    """Single AWS service with occurrence count."""

    service: str = Field(
        ...,
        description="AWS service name",
        examples=["EC2", "S3", "RDS"],
    )

    count: int = Field(
        ...,
        description="Number of times this service appeared across reviews",
        examples=[45],
    )


class EnhancedMetricsResponse(BaseModel):
    """
    Enhanced analytics response with advanced metrics.

    Includes basic metrics plus:
    - Time-series data (reviews over time, score trends)
    - Processing time percentiles
    - Top AWS services
    - Input/analysis method breakdowns
    """

    # Basic metrics (existing)
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

    avg_review_time_ms: float = Field(
        ...,
        description="Average processing time for architecture reviews in milliseconds",
        examples=[8300.0],
    )

    # Advanced analytics (new)
    processing_percentiles: ProcessingPercentiles = Field(
        ...,
        description="Processing time percentiles (p50, p95, p99)",
    )

    reviews_over_time: List[TimeSeriesDataPoint] = Field(
        default_factory=list,
        description="Review count by day for the last 30 days",
    )

    score_trends: List[ScoreTrendDataPoint] = Field(
        default_factory=list,
        description="Average architecture score by day for the last 30 days",
    )

    top_aws_services: List[TopServiceDataPoint] = Field(
        default_factory=list,
        description="Top 10 most commonly used AWS services",
    )

    input_method_breakdown: Dict[str, int] = Field(
        ...,
        description="Count of reviews by input method (text vs image)",
        examples=[{"text": 450, "image": 73}],
    )

    analysis_method_breakdown: Dict[str, int] = Field(
        ...,
        description="Count of reviews by analysis method",
        examples=[{"bedrock_claude_3_5_haiku": 500, "pattern_matching_fallback": 23}],
    )

    last_updated: str = Field(
        ...,
        description="ISO 8601 timestamp of when metrics were last computed",
        examples=["2026-02-25T10:30:00Z"],
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
                "avg_review_time_ms": 8300.0,
                "processing_percentiles": {
                    "p50": 8500.0,
                    "p95": 12000.0,
                    "p99": 15000.0,
                },
                "reviews_over_time": [
                    {"date": "2026-02-25", "count": 15},
                    {"date": "2026-02-24", "count": 12},
                ],
                "score_trends": [
                    {"date": "2026-02-25", "avg_score": 78.5},
                    {"date": "2026-02-24", "avg_score": 75.0},
                ],
                "top_aws_services": [
                    {"service": "EC2", "count": 120},
                    {"service": "S3", "count": 98},
                    {"service": "RDS", "count": 87},
                ],
                "input_method_breakdown": {"text": 450, "image": 73},
                "analysis_method_breakdown": {
                    "bedrock_claude_3_5_haiku": 500,
                    "pattern_matching_fallback": 23,
                },
                "last_updated": "2026-02-25T10:30:00Z",
            }
        }


class AnalyticsEvent(BaseModel):
    """
    Single anonymized analytics event (privacy-first design).

    NEVER includes:
    - Architecture descriptions or design text
    - IP addresses or user identifiers
    - Finding details (only counts)
    - AWS service configurations
    """

    event_type: str = Field(
        ...,
        description="Type of event (e.g., 'review_completed')",
        examples=["review_completed"],
    )

    timestamp: str = Field(
        ...,
        description="ISO 8601 timestamp of event",
        examples=["2026-02-25T10:30:00Z"],
    )

    metadata: Dict[str, Any] = Field(
        ...,
        description="Anonymized event metadata (no PII)",
        examples=[
            {
                "input_method": "text",
                "tone": "standard",
                "score": 85,
                "findings_count": 3,
                "processing_time_ms": 8500,
                "tokens": 12500,
                "analysis_method": "bedrock_claude_3_5_haiku",
            }
        ],
    )
