"""
Custom exception classes for Bedrock integration.

Provides specific exception types for better error handling and retry logic.
"""


class BedrockException(Exception):
    """Base exception for Bedrock errors."""

    pass


class BedrockThrottlingException(BedrockException):
    """Raised when Bedrock API rate limit is hit (ThrottlingException)."""

    pass


class BedrockAccessDeniedException(BedrockException):
    """Raised when IAM permissions are insufficient (AccessDeniedException)."""

    pass


class BedrockModelNotFoundException(BedrockException):
    """Raised when model ID is invalid or not available in region (ResourceNotFoundException)."""

    pass


class BedrockValidationException(BedrockException):
    """Raised when request validation fails (ValidationException)."""

    pass


class BedrockServiceException(BedrockException):
    """Raised for other Bedrock service errors."""

    pass
