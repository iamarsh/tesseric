"""
Tesseric Backend - FastAPI Application

Main entry point for the Tesseric architecture review service.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.core.config import settings
from app.api import health, review, graph

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Lifespan handler for startup/shutdown hooks.

    TODO(Phase 1): Initialize Bedrock client, test connectivity
    TODO(v1.0): Initialize DynamoDB connection
    """
    logger.info(
        "%s v%s starting (region=%s, env=%s)",
        settings.app_name,
        settings.app_version,
        settings.aws_region,
        "Production" if not settings.aws_profile else "Development",
    )
    yield
    logger.info("%s shutting down", settings.app_name)


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware (allow frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Use configured origins from settings
    allow_credentials=True,  # Allow credentials (cookies, auth headers)
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(review.router, tags=["Review"])
app.include_router(graph.router, tags=["Graph"])


# Root endpoint (not part of API, just for browser visits)
@app.get("/", include_in_schema=False)
async def root():
    """
    Root endpoint - redirect to docs.

    Not part of the official API, just a helper for browser visits.
    """
    return {
        "message": "Tesseric Backend API",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }
