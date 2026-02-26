"""
Graph API endpoints for knowledge graph visualization.

Provides access to Neo4j graph data for frontend visualization.
"""

from fastapi import APIRouter, HTTPException, Request
import logging

from app.models.graph import (
    GraphResponse,
    GraphNode,
    GraphEdge,
    ArchitectureGraphResponse,
    ArchitectureServiceNode,
    ArchitectureConnection,
)
from app.graph.neo4j_client import neo4j_client
from app.middleware.rate_limiter import get_limiter, graph_rate_limit

router = APIRouter(prefix="/api/graph")
logger = logging.getLogger(__name__)
limiter = get_limiter()


@router.get("/health")
@limiter.limit(graph_rate_limit())
async def graph_health(request: Request):
    """
    Check Neo4j connection health.

    Returns:
        Dict with connection status
    """
    try:
        async with neo4j_client as client:
            connected = client._is_connected()
            return {
                "neo4j_connected": connected,
                "neo4j_enabled": neo4j_client.enabled,
                "status": "healthy" if connected else "unavailable",
            }
    except Exception as e:
        return {
            "neo4j_connected": False,
            "neo4j_enabled": neo4j_client.enabled,
            "status": "error",
            "error": str(e),
        }


@router.get("/{analysis_id}", response_model=GraphResponse)
@limiter.limit(graph_rate_limit())
async def get_analysis_graph(request: Request, analysis_id: str):
    """
    Retrieve knowledge graph for a specific analysis.

    Returns all nodes and edges connected to the analysis:
    - Analysis node
    - Finding nodes
    - Remediation nodes
    - AWSService nodes
    - All relationships

    Args:
        analysis_id: The review_id from the analysis

    Returns:
        GraphResponse with nodes and edges

    Raises:
        404: Analysis not found
        503: Neo4j unavailable
    """
    try:
        async with neo4j_client as client:
            graph_data = await client.get_graph_for_analysis(analysis_id)

            if not graph_data.get("nodes"):
                raise HTTPException(
                    status_code=404,
                    detail=f"No graph data found for analysis {analysis_id}",
                )

            # Convert to Pydantic models
            nodes = [GraphNode(**node) for node in graph_data["nodes"]]
            edges = [GraphEdge(**edge) for edge in graph_data["edges"]]

            return GraphResponse(nodes=nodes, edges=edges)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch analysis graph: {e}")
        raise HTTPException(
            status_code=503, detail="Knowledge graph service temporarily unavailable"
        )


@router.get("/{analysis_id}/architecture", response_model=ArchitectureGraphResponse)
@limiter.limit(graph_rate_limit())
async def get_architecture_graph(request: Request, analysis_id: str):
    """
    Retrieve architecture-first graph for visualization.

    Returns AWS services with finding counts and topology relationships.
    Optimized for architecture diagram rendering with:
    - Service nodes with finding counts and severity breakdown
    - Topology relationships (ROUTES_TO, READS_FROM, etc.)
    - Architecture pattern hint for layout algorithm
    - Original architecture description

    Args:
        analysis_id: The review_id from the analysis

    Returns:
        ArchitectureGraphResponse with services and connections

    Raises:
        404: Analysis not found or no topology data
        503: Neo4j unavailable
    """
    try:
        async with neo4j_client as client:
            arch_data = await client.get_architecture_graph(analysis_id)

            if not arch_data.get("services"):
                raise HTTPException(
                    status_code=404,
                    detail=f"No architecture data found for analysis {analysis_id}. "
                    "This may be an old review created before topology extraction was implemented.",
                )

            # Convert to Pydantic models
            services = [
                ArchitectureServiceNode(**svc) for svc in arch_data["services"]
            ]
            connections = [
                ArchitectureConnection(**conn) for conn in arch_data["connections"]
            ]

            return ArchitectureGraphResponse(
                services=services,
                connections=connections,
                architecture_pattern=arch_data.get("architecture_pattern"),
                architecture_description=arch_data.get("architecture_description"),
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch architecture graph: {e}")
        raise HTTPException(
            status_code=503, detail="Knowledge graph service temporarily unavailable"
        )


@router.get("/global/all", response_model=GraphResponse)
@limiter.limit(graph_rate_limit())
async def get_global_graph(request: Request, limit: int = 100):
    """
    Retrieve aggregated knowledge graph across all analyses.

    Returns:
    - Top AWS services by co-occurrence count
    - CO_OCCURS_WITH relationships showing service patterns

    Useful for:
    - Discovering common service combinations
    - Identifying frequently problematic services
    - Visualizing architecture patterns

    Args:
        limit: Maximum number of nodes to return (default 100, max 200)

    Returns:
        GraphResponse with top nodes and relationships

    Raises:
        503: Neo4j unavailable
    """
    if limit > 200:
        limit = 200

    try:
        async with neo4j_client as client:
            graph_data = await client.get_global_graph(limit=limit)

            # Convert to Pydantic models
            nodes = [GraphNode(**node) for node in graph_data["nodes"]]
            edges = [GraphEdge(**edge) for edge in graph_data["edges"]]

            return GraphResponse(nodes=nodes, edges=edges)

    except Exception as e:
        logger.error(f"Failed to fetch global graph: {e}")
        raise HTTPException(
            status_code=503, detail="Knowledge graph service temporarily unavailable"
        )
