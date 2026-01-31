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

    async def extract_architecture_from_image(
        self, image_data: str, image_format: str
    ) -> dict:
        """
        Extract AWS architecture description from diagram using Bedrock vision.

        Uses Claude 3 Sonnet with vision capabilities to analyze architecture diagrams
        and extract structured descriptions of AWS services, configurations, and topology.

        Args:
            image_data: Base64-encoded image data
            image_format: "png" | "jpeg" | "pdf"

        Returns:
            dict with:
                - content: Extracted architecture description (str)
                - usage: Token usage (dict with input_tokens, output_tokens)
                - metadata: Model ID, stop reason, etc.

        Raises:
            BedrockException subclasses: Same error handling as generate()
        """
        from app.services.prompts import VISION_SYSTEM_PROMPT

        logger.info(f"Calling Bedrock vision API with {image_format} image")

        # Build vision API request (Anthropic Messages API format)
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,  # Sufficient for architecture extraction
            "temperature": 0.1,  # Low temperature for accurate extraction
            "system": VISION_SYSTEM_PROMPT,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": f"image/{image_format}",
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Extract the AWS architecture from this diagram. Describe all services, configurations, and connections you can identify.",
                        },
                    ],
                }
            ],
        }

        try:
            # Call Bedrock with vision model
            response = self.client.invoke_model(
                modelId=settings.bedrock_vision_model_id,
                body=json.dumps(body),
                contentType="application/json",
                accept="application/json",
            )

            # Parse response
            response_body = json.loads(response["body"].read())

            # Extract content from response
            content = ""
            if "content" in response_body:
                for block in response_body["content"]:
                    if block.get("type") == "text":
                        content += block.get("text", "")

            if not content:
                raise BedrockValidationException("Vision API returned empty content")

            logger.info(
                f"Vision extraction successful: {len(content)} chars, "
                f"{response_body.get('usage', {}).get('input_tokens', 0)} input tokens, "
                f"{response_body.get('usage', {}).get('output_tokens', 0)} output tokens"
            )

            return {
                "content": content,
                "usage": response_body.get("usage", {}),
                "metadata": {
                    "model_id": settings.bedrock_vision_model_id,
                    "stop_reason": response_body.get("stop_reason"),
                },
            }

        except ClientError as e:
            # Map AWS errors to custom exceptions (same pattern as generate())
            error_code = e.response["Error"]["Code"]
            error_message = e.response["Error"]["Message"]

            if error_code == "ThrottlingException":
                raise BedrockThrottlingException(f"Bedrock vision API throttled: {error_message}")
            elif error_code == "AccessDeniedException":
                raise BedrockAccessDeniedException(
                    f"Bedrock vision access denied: {error_message}"
                )
            elif error_code == "ResourceNotFoundException":
                raise BedrockModelNotFoundException(f"Vision model not found: {error_message}")
            elif error_code == "ValidationException":
                raise BedrockValidationException(
                    f"Vision request validation failed: {error_message}"
                )
            else:
                raise BedrockServiceException(f"Bedrock vision error: {error_message}")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Bedrock vision response: {e}")
            raise BedrockServiceException(f"Invalid JSON in vision response: {e}")

        except Exception as e:
            logger.error(f"Unexpected error calling Bedrock vision: {e}")
            raise BedrockServiceException(f"Unexpected vision error: {e}")


# Singleton instance
bedrock_client = BedrockClient()
