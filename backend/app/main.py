"""
Tesseric Backend - FastAPI Application

Main entry point for the Tesseric architecture review service.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import health, review

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware (allow frontend to call backend)
# DEV MODE: Allow all origins for local development (change for production!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local dev
    allow_credentials=False,  # Must be False when using wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(review.router, tags=["Review"])


@app.on_event("startup")
async def startup_event():
    """
    Run on application startup.

    TODO(Phase 1): Initialize Bedrock client, test connectivity
    TODO(v1.0): Initialize DynamoDB connection
    """
    print(f"🚀 {settings.app_name} v{settings.app_version} starting...")
    print(f"📍 Region: {settings.aws_region}")
    print(f"🔧 Environment: {'Production' if not settings.aws_profile else 'Development'}")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Run on application shutdown.

    TODO(Phase 1): Close Bedrock client connections
    TODO(v1.0): Close DynamoDB connections
    """
    print(f"👋 {settings.app_name} shutting down...")


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
