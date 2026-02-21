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
    type: Literal["HAS_FINDING", "REMEDIATED_BY", "INVOLVES_SERVICE", "CO_OCCURS_WITH"] = Field(
        ..., description="Relationship type"
    )
    properties: Dict[str, Any] = Field(
        default_factory=dict, description="Relationship properties (e.g., count for CO_OCCURS_WITH)"
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
