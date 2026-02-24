"""
Graph response models for Neo4j knowledge graph API.

Pydantic models for nodes, edges, and graph responses.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal


class GraphNode(BaseModel):
    """Represents a node in the knowledge graph."""

    id: str = Field(..., description="Unique node identifier (Neo4j element_id)")
    label: str = Field(..., description="Display label for the node")
    type: Literal["Analysis", "Finding", "Remediation", "AWSService"] = Field(
        ..., description="Node type"
    )
    properties: Dict[str, Any] = Field(
        default_factory=dict, description="Node properties from Neo4j"
    )


class GraphEdge(BaseModel):
    """Represents an edge (relationship) in the knowledge graph."""

    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    type: Literal[
        "HAS_FINDING",
        "REMEDIATED_BY",
        "INVOLVES_SERVICE",
        "CO_OCCURS_WITH",
        "ROUTES_TO",
        "READS_FROM",
        "WRITES_TO",
        "MONITORS",
        "AUTHORIZES",
        "BACKS_UP",
        "REPLICATES_TO",
    ] = Field(..., description="Relationship type")
    properties: Dict[str, Any] = Field(
        default_factory=dict,
        description="Relationship properties (e.g., count for CO_OCCURS_WITH)",
    )


class GraphResponse(BaseModel):
    """Complete graph response with nodes and edges."""

    nodes: List[GraphNode] = Field(..., description="List of graph nodes")
    edges: List[GraphEdge] = Field(..., description="List of graph edges")

    class Config:
        json_schema_extra = {
            "example": {
                "nodes": [
                    {
                        "id": "neo4j-element-id-1",
                        "label": "review-12345",
                        "type": "Analysis",
                        "properties": {"score": 75, "tone": "standard"},
                    },
                    {
                        "id": "neo4j-element-id-2",
                        "label": "Single AZ Deployment",
                        "type": "Finding",
                        "properties": {"severity": "HIGH", "category": "reliability"},
                    },
                    {
                        "id": "neo4j-element-id-3",
                        "label": "RDS",
                        "type": "AWSService",
                        "properties": {"category": "database"},
                    },
                ],
                "edges": [
                    {
                        "source": "neo4j-element-id-1",
                        "target": "neo4j-element-id-2",
                        "type": "HAS_FINDING",
                        "properties": {},
                    },
                    {
                        "source": "neo4j-element-id-2",
                        "target": "neo4j-element-id-3",
                        "type": "INVOLVES_SERVICE",
                        "properties": {},
                    },
                ],
            }
        }


class ArchitectureServiceNode(BaseModel):
    """AWS Service node with finding counts for architecture visualization."""

    service_name: str = Field(..., description="AWS service name (e.g., EC2, RDS)")
    category: str = Field(..., description="Service category (compute, database, etc.)")
    finding_count: int = Field(
        default=0, description="Total number of findings affecting this service"
    )
    severity_breakdown: Dict[str, int] = Field(
        default_factory=dict,
        description="Count of findings by severity (CRITICAL, HIGH, MEDIUM, LOW)",
    )
    max_severity: str | None = Field(
        None, description="Highest severity level affecting this service"
    )


class ArchitectureConnection(BaseModel):
    """Service-to-service connection with relationship type."""

    source_service: str = Field(..., description="Source service name")
    target_service: str = Field(..., description="Target service name")
    relationship_type: Literal[
        "routes_to",
        "reads_from",
        "writes_to",
        "monitors",
        "authorizes",
        "backs_up",
        "replicates_to",
    ] = Field(..., description="Type of connection")
    description: str | None = Field(None, description="Connection description")


class ArchitectureGraphResponse(BaseModel):
    """Architecture-first graph response with topology and finding counts."""

    services: List[ArchitectureServiceNode] = Field(
        ..., description="AWS services in the architecture"
    )
    connections: List[ArchitectureConnection] = Field(
        ..., description="Service-to-service relationships"
    )
    architecture_pattern: str | None = Field(
        None, description="Detected architecture pattern (3-tier, serverless, etc.)"
    )
    architecture_description: str | None = Field(
        None, description="Original architecture description from user"
    )
