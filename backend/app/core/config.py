"""
Configuration management for Tesseric backend.

Uses pydantic-settings to load environment variables with validation.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # AWS Configuration
    aws_region: str = "us-east-2"
    aws_profile: str | None = None  # For local dev only

    # AWS Credentials (for Bedrock API calls)
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None

    # Bedrock Configuration (Phase 1+)
    bedrock_kb_id: str | None = None  # Knowledge Base ID
    bedrock_model_id: str = "anthropic.claude-3-5-haiku-20241022-v1:0"
    disable_bedrock: bool = False

    # Bedrock Vision Model (Claude 3 Sonnet - has vision capabilities)
    bedrock_vision_model_id: str = "anthropic.claude-3-sonnet-20240229-v1:0"

    # Image Upload Settings
    max_image_size_mb: int = 5
    allowed_image_formats: list[str] = ["image/png", "image/jpeg", "application/pdf"]

    # Vision API Cost Tracking (Claude 3 Sonnet pricing)
    vision_input_cost_per_1k: float = 0.003   # $3 per MTok
    vision_output_cost_per_1k: float = 0.015  # $15 per MTok

    # Cost Tracking
    enable_cost_logging: bool = True

    # Backend Configuration
    backend_port: int = 8000
    log_level: str = "INFO"

    # CORS Origins (comma-separated for production)
    # Includes: localhost (dev), tesseric.ca domains (production frontend), api subdomain
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,https://tesseric.ca,https://www.tesseric.ca,https://api.tesseric.ca"

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
