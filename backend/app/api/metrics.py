"""
Metrics API endpoint for real-time production statistics.

Provides aggregated data from Neo4j knowledge graph with caching
for performance optimization.
"""

from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timedelta, timezone
import logging
import time

from app.models.metrics import MetricsResponse
from app.graph.neo4j_client import neo4j_client
from app.middleware.rate_limiter import get_limiter, metrics_rate_limit

router = APIRouter(prefix="/api/metrics", tags=["metrics"])
logger = logging.getLogger(__name__)
limiter = get_limiter()

# In-memory cache with TTL (5 minutes)
# Format: {"data": MetricsResponse, "expires_at": datetime}
_metrics_cache = {"data": None, "expires_at": None}


@router.get("/stats", response_model=MetricsResponse)
@limiter.limit(metrics_rate_limit())
async def get_metrics(request: Request):
    """
    Retrieve real-time production metrics from Neo4j.

    Returns aggregated statistics:
    - Total architecture reviews analyzed
    - Unique AWS services recognized across all reviews
    - Findings breakdown by severity (CRITICAL, HIGH, MEDIUM, LOW)
    - Average review processing time

    **Caching**: Results are cached for 5 minutes to reduce database load.
    Cache is automatically refreshed after expiration.

    **Fallback**: If Neo4j is unavailable, returns cached data if available,
    otherwise returns default values based on current hardcoded metrics.

    Returns:
        MetricsResponse: Real-time metrics from production database

    Raises:
        HTTPException: Only if there's an unexpected server error
    """
    global _metrics_cache

    # Check cache validity
    now = datetime.now()
    if _metrics_cache["data"] and _metrics_cache["expires_at"] and _metrics_cache["expires_at"] > now:
        logger.info("Returning cached metrics (cache hit)")
        return _metrics_cache["data"]

    # Cache miss or expired - fetch fresh data
    logger.info("Cache miss or expired - fetching fresh metrics from Neo4j")
    start_time = time.time()

    try:
        async with neo4j_client as client:
            metrics_data = await client.get_metrics()

        query_time_ms = int((time.time() - start_time) * 1000)

        # Log slow queries
        if query_time_ms > 500:
            logger.warning(f"Metrics query took {query_time_ms}ms (>500ms threshold)")
        else:
            logger.info(f"Metrics query completed in {query_time_ms}ms")

        # Build response
        response = MetricsResponse(
            total_reviews=metrics_data["total_reviews"],
            unique_aws_services=metrics_data["unique_aws_services"],
            severity_breakdown=metrics_data["severity_breakdown"],
            avg_review_time_seconds=metrics_data["avg_time_ms"] / 1000.0,  # Convert ms to seconds
            last_updated=datetime.now(timezone.utc).isoformat(),
        )

        # Update cache with 5-minute TTL
        _metrics_cache = {
            "data": response,
            "expires_at": now + timedelta(minutes=5),
        }

        logger.info(f"Metrics cached until {_metrics_cache['expires_at'].isoformat()}")
        return response

    except Exception as e:
        logger.error(f"Failed to fetch metrics from Neo4j: {e}")

        # Try to return stale cache if available
        if _metrics_cache["data"]:
            logger.warning("Returning stale cached metrics due to Neo4j error")
            return _metrics_cache["data"]

        # No cache available - return default fallback values
        logger.warning("No cache available, returning default fallback metrics")
        return MetricsResponse(
            total_reviews=500,  # Current hardcoded value
            unique_aws_services=70,  # Current hardcoded value
            severity_breakdown={"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
            avg_review_time_seconds=8.0,  # Current hardcoded value
            last_updated=datetime.now(timezone.utc).isoformat(),
        )


@router.delete("/cache")
@limiter.limit(metrics_rate_limit())
async def clear_metrics_cache(request: Request):
    """
    Clear the metrics cache (admin/debugging endpoint).

    Forces the next request to fetch fresh data from Neo4j.

    Returns:
        Dict with success message
    """
    global _metrics_cache
    _metrics_cache = {"data": None, "expires_at": None}
    logger.info("Metrics cache cleared manually")
    return {"message": "Metrics cache cleared successfully", "status": "ok"}
