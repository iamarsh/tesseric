"""
Configuration management for Tesseric backend.

Uses pydantic-settings to load environment variables with validation.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # AWS Configuration
    aws_region: str = "us-east-1"
    aws_profile: str | None = None  # For local dev only

    # Bedrock Configuration (Phase 1+)
    bedrock_kb_id: str | None = None  # Knowledge Base ID
    bedrock_model_id: str = "anthropic.claude-3-sonnet-20240229-v1:0"

    # Backend Configuration
    backend_port: int = 8000
    log_level: str = "INFO"

    # CORS Origins (comma-separated for production)
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Application Metadata
    app_name: str = "Tesseric Backend"
    app_version: str = "0.1.0-alpha"
    app_description: str = "AI-powered AWS architecture review service"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Singleton instance
settings = Settings()
