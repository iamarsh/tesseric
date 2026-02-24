"""
Response models for Tesseric API.

Pydantic models for structured architecture review responses.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal, Any
from datetime import datetime, timezone


class ServiceConnection(BaseModel):
    """Service-to-service connection in architecture topology."""

    source_service: str = Field(
        ...,
        description="Source AWS service name",
        examples=["ALB", "Lambda", "EC2"],
    )

    target_service: str = Field(
        ...,
        description="Target AWS service name",
        examples=["EC2", "DynamoDB", "S3"],
    )

    relationship_type: Literal[
        "routes_to",
        "reads_from",
        "writes_to",
        "monitors",
        "authorizes",
        "backs_up",
        "replicates_to",
    ] = Field(
        ...,
        description="Type of connection between services",
    )

    description: Optional[str] = Field(
        default=None,
        description="Brief description of the connection",
        examples=["Load balancer distributes traffic to EC2 instances"],
    )


class ArchitectureTopology(BaseModel):
    """Complete architecture topology with services and connections."""

    services: List[str] = Field(
        default_factory=list,
        description="List of all AWS services mentioned in the architecture",
        examples=[["ALB", "EC2", "RDS", "CloudWatch"]],
    )

    connections: List[ServiceConnection] = Field(
        default_factory=list,
        description="Service-to-service relationships",
    )

    architecture_pattern: Optional[str] = Field(
        default=None,
        description="Detected architecture pattern",
        examples=["3-tier", "serverless", "microservices", "event-driven", "custom"],
    )


class RiskItem(BaseModel):
    """Individual risk/finding in the architecture."""

    id: str = Field(
        ...,
        description="Unique risk identifier (e.g., REL-001, SEC-002)",
        examples=["REL-001", "SEC-003"],
    )

    title: str = Field(
        ...,
        description="Short title of the risk",
        examples=["Single Availability Zone Deployment"],
    )

    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"] = Field(
        ...,
        description="Risk severity level",
    )

    pillar: Literal[
        "operational_excellence",
        "security",
        "reliability",
        "performance_efficiency",
        "cost_optimization",
        "sustainability",
    ] = Field(
        ...,
        description="AWS Well-Architected Framework pillar",
    )

    impact: str = Field(
        ...,
        description="What happens if this risk is not mitigated",
        examples=["Service unavailable during AZ failure"],
    )

    likelihood: Optional[str] = Field(
        default=None,
        description="How likely this issue is to occur (optional)",
        examples=["HIGH", "MEDIUM", "LOW"],
    )

    finding: str = Field(
        ...,
        description="What we found in the architecture",
        examples=["Architecture deploys all resources to a single Availability Zone"],
    )

    remediation: str = Field(
        ...,
        description="How to fix this issue",
        examples=[
            "Deploy resources across multiple Availability Zones. "
            "Use at least 2 AZs for high availability."
        ],
    )

    references: List[str] = Field(
        default_factory=list,
        description="AWS documentation references",
        examples=[
            [
                "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/availability.html"
            ]
        ],
    )


class ReviewResponse(BaseModel):
    """Complete architecture review response."""

    review_id: str = Field(
        ...,
        description="Unique review identifier",
        examples=["review-550e8400-e29b-41d4-a716-446655440000"],
    )

    architecture_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall architecture score (0-100, weighted by pillar)",
        examples=[67],
    )

    risks: List[RiskItem] = Field(
        ...,
        description="List of identified risks/findings",
    )

    summary: str = Field(
        ...,
        description="2-3 sentence summary of the review",
        examples=[
            "Found 5 issues across 3 Well-Architected pillars. "
            "Primary concerns: single AZ deployment (reliability), "
            "missing encryption (security), and no backup strategy (reliability)."
        ],
    )

    tone: Literal["standard", "roast"] = Field(
        ...,
        description="Tone used in the response (echoes request)",
        examples=["standard", "roast"],
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Review creation timestamp (ISO 8601)",
    )

    metadata: Optional[dict[str, Any]] = Field(
        default=None,
        description="Analysis metadata (method, provider, cost, token usage)",
    )

    topology: Optional[ArchitectureTopology] = Field(
        default=None,
        description="Architecture topology with service connections (Phase 1+)",
    )

    architecture_description: Optional[str] = Field(
        default=None,
        description="Original architecture description provided by user",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "review_id": "review-550e8400-e29b-41d4-a716-446655440000",
                "architecture_score": 67,
                "risks": [
                    {
                        "id": "REL-001",
                        "title": "Single Availability Zone Deployment",
                        "severity": "HIGH",
                        "pillar": "reliability",
                        "impact": "Service unavailable during AZ failure",
                        "likelihood": "MEDIUM",
                        "finding": "Architecture uses single AZ",
                        "remediation": "Deploy across multiple AZs",
                        "references": [
                            "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/"
                        ],
                    }
                ],
                "summary": "Found 5 issues across 3 pillars. Primary concerns: availability, security, backups.",
                "tone": "standard",
                "created_at": "2026-01-21T12:00:00Z",
            }
        }
    )
