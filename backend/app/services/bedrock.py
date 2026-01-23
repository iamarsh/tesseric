"""
Amazon Bedrock client wrapper.

Phase 1: Real Bedrock integration with Claude 3.5 Haiku via boto3
"""

import json
import logging
import boto3
from botocore.exceptions import ClientError

from app.core.config import settings
from app.utils.exceptions import (
    BedrockThrottlingException,
    BedrockAccessDeniedException,
    BedrockModelNotFoundException,
    BedrockValidationException,
    BedrockServiceException,
)

logger = logging.getLogger(__name__)


class BedrockClient:
    """
    Wrapper for Amazon Bedrock API calls.

    Implements real boto3 integration with Claude 3.5 Haiku.
    """

    def __init__(self):
        self.region = settings.aws_region
        self.model_id = settings.bedrock_model_id

        # Initialize boto3 bedrock-runtime client
        logger.info(f"Initializing Bedrock client in region {self.region} with model {self.model_id}")

        try:
            self.client = boto3.client(
                "bedrock-runtime",
                region_name=self.region,
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
            )
        except Exception as e:
            logger.error(f"Failed to initialize Bedrock client: {e}")
            raise

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 4096,
        temperature: float = 0.3,
    ) -> dict:
        """
        Call Bedrock InvokeModel with Claude 3.5 Haiku.

        Args:
            system_prompt: System instructions with AWS Well-Architected context
            user_message: User's architecture description and analysis request
            max_tokens: Maximum tokens in response (default: 4096)
            temperature: Randomness (0.0-1.0, default: 0.3 for deterministic)

        Returns:
            dict with keys:
                - content (str): Generated text (JSON string)
                - usage (dict): {input_tokens: int, output_tokens: int}
                - metadata (dict): {model_id: str, stop_reason: str}

        Raises:
            BedrockThrottlingException: Rate limit hit
            BedrockAccessDeniedException: IAM permissions insufficient
            BedrockModelNotFoundException: Model ID invalid or not available in region
            BedrockValidationException: Request validation failed
            BedrockServiceException: Other Bedrock service errors
        """
        # Construct request body (Anthropic Messages API format)
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_message}],
        })

        try:
            logger.info(f"Calling Bedrock InvokeModel with model {self.model_id}")

            # Call Bedrock InvokeModel
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=body,
                contentType="application/json",
                accept="application/json",
            )

            # Parse response
            response_body = json.loads(response["body"].read())

            logger.info(
                "Bedrock call successful",
                extra={
                    "model_id": self.model_id,
                    "stop_reason": response_body.get("stop_reason"),
                    "input_tokens": response_body.get("usage", {}).get("input_tokens", 0),
                    "output_tokens": response_body.get("usage", {}).get("output_tokens", 0),
                },
            )

            return {
                "content": response_body["content"][0]["text"],
                "usage": response_body.get("usage", {}),
                "metadata": {
                    "model_id": self.model_id,
                    "stop_reason": response_body.get("stop_reason"),
                },
            }

        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            error_message = e.response["Error"]["Message"]

            logger.error(
                f"Bedrock API error: {error_code} - {error_message}",
                extra={"error_code": error_code, "model_id": self.model_id},
            )

            # Map AWS error codes to custom exceptions
            if error_code == "ThrottlingException":
                raise BedrockThrottlingException(f"Rate limit hit: {error_message}")
            elif error_code == "AccessDeniedException":
                raise BedrockAccessDeniedException(f"IAM permissions insufficient: {error_message}")
            elif error_code == "ResourceNotFoundException":
                raise BedrockModelNotFoundException(f"Model not found: {error_message}")
            elif error_code == "ValidationException":
                raise BedrockValidationException(f"Request validation failed: {error_message}")
            else:
                raise BedrockServiceException(f"Bedrock service error: {error_message}")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Bedrock response body: {e}")
            raise BedrockServiceException(f"Invalid JSON in Bedrock response: {e}")

        except Exception as e:
            logger.error(f"Unexpected error calling Bedrock: {e}")
            raise BedrockServiceException(f"Unexpected error: {e}")


# Singleton instance
bedrock_client = BedrockClient()
