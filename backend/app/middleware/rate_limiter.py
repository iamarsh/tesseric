"""
Rate Limiting Middleware for Tesseric Backend

Implements per-endpoint rate limiting with Redis or in-memory storage.
Prevents API abuse and demonstrates production-ready security practices.

Rate limits:
- /review: 10 requests/minute per IP
- /api/metrics/*: 60 requests/minute per IP
- /api/graph/*: 30 requests/minute per IP
- /health: Unlimited (for monitoring)
"""

import logging
from typing import Callable
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_rate_limit_key(request: Request) -> str:
    """
    Get rate limit key for the request.

    Uses IP address for rate limiting. In production with a proxy/load balancer,
    use X-Forwarded-For header instead.

    Args:
        request: FastAPI request object

    Returns:
        IP address or forwarded IP
    """
    # Check for X-Forwarded-For header (Railway, Vercel, ALB)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP (client IP)
        return forwarded_for.split(",")[0].strip()

    # Fallback to direct connection IP
    return get_remote_address(request)


def is_localhost(request: Request) -> bool:
    """
    Check if request is from localhost (bypass rate limiting in dev).

    Args:
        request: FastAPI request object

    Returns:
        True if request is from localhost
    """
    key = get_rate_limit_key(request)
    localhost_ips = ["127.0.0.1", "::1", "localhost"]
    return key in localhost_ips or key.startswith("192.168.")


# Initialize limiter with configured storage
def get_limiter_storage() -> str | None:
    """
    Get storage URL for rate limiter.

    Returns Redis URL if configured, otherwise None (in-memory).
    """
    if settings.rate_limit_storage == "redis" and settings.redis_url:
        logger.info("Using Redis for rate limiting: %s", settings.redis_url)
        return settings.redis_url
    else:
        logger.info("Using in-memory storage for rate limiting (dev mode)")
        return None


# Create limiter instance
limiter = Limiter(
    key_func=get_rate_limit_key,
    storage_uri=get_limiter_storage(),
    default_limits=[],  # No default limits, apply per-endpoint
    enabled=settings.rate_limit_enabled,
    headers_enabled=False,  # Disable automatic header injection (requires Response param in endpoints)
    # Note: Rate limit info is still available in the error response (429)
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    Custom handler for rate limit exceeded errors.

    Returns HTTP 429 with clear error message, Retry-After header,
    and rate limit information.

    Args:
        request: FastAPI request object
        exc: RateLimitExceeded exception

    Returns:
        JSONResponse with 429 status
    """
    # Parse limit string (e.g., "10/minute" -> 10, "minute")
    limit_value = exc.detail.split(" ")[0] if exc.detail else "unknown"

    # Calculate retry_after in seconds
    retry_after = 60  # Default to 1 minute
    if "minute" in exc.detail.lower():
        retry_after = 60
    elif "hour" in exc.detail.lower():
        retry_after = 3600
    elif "second" in exc.detail.lower():
        retry_after = 1

    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"You have exceeded the rate limit. Please wait {retry_after} seconds before retrying.",
            "retry_after": retry_after,
            "limit": limit_value,
            "endpoint": str(request.url.path),
        },
        headers={
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": limit_value,
            "X-RateLimit-Remaining": "0",
        },
    )


def get_limiter() -> Limiter:
    """
    Get the limiter instance.

    Used to apply rate limits to specific endpoints.

    Returns:
        Limiter instance
    """
    return limiter


# Rate limit configuration functions for use in routers
def review_rate_limit() -> str:
    """Get rate limit for /review endpoint."""
    return settings.rate_limit_review


def metrics_rate_limit() -> str:
    """Get rate limit for /api/metrics/* endpoints."""
    return settings.rate_limit_metrics


def graph_rate_limit() -> str:
    """Get rate limit for /api/graph/* endpoints."""
    return settings.rate_limit_graph
