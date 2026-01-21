"""
Health check endpoint.

Used by monitoring systems (App Runner, ECS, load balancers) to verify service health.
"""

from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns service status and version information.
    Used by AWS App Runner health checks, ECS health checks, and monitoring systems.

    Returns:
        dict: Service health status
    """
    return {
        "status": "ok",
        "version": settings.app_version,
        "service": settings.app_name,
    }
