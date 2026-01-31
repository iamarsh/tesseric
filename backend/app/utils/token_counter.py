"""
Token estimation and cost tracking for Bedrock API calls.

Provides utilities for:
- Estimating token count before API call
- Calculating cost estimates
- Logging actual token usage
- Calculating actual cost from API response
"""

import logging

logger = logging.getLogger(__name__)


def estimate_tokens(text: str) -> int:
    """
    Rough estimation of token count based on character length.

    Uses heuristic: ~4 characters per token (Claude tokenization average).

    Args:
        text: Input text to estimate

    Returns:
        Estimated token count
    """
    return len(text) // 4


def estimate_request_cost(design_text: str) -> dict:
    """
    Estimate cost before making Bedrock call.

    Token breakdown:
    - System prompt: ~800 tokens
    - AWS Well-Architected context: ~6,000 tokens (comprehensive coverage)
    - JSON schema: ~300 tokens
    - User input: variable (estimated from design_text)
    - Output estimate: ~700 tokens (typical response with 3-5 risks)

    Pricing (Claude 3.5 Haiku):
    - Input: $1.00 per million tokens ($0.001 per 1K)
    - Output: $5.00 per million tokens ($0.005 per 1K)

    Args:
        design_text: User's architecture description

    Returns:
        dict with keys:
            - input_tokens (int): Estimated input tokens
            - output_tokens_estimate (int): Estimated output tokens
            - input_cost (float): Estimated input cost in USD
            - output_cost_estimate (float): Estimated output cost in USD
            - total_cost_estimate (float): Total estimated cost in USD
    """
    # Token estimates
    system_prompt_tokens = 800
    aws_context_tokens = 6000  # Comprehensive AWS Well-Architected content
    json_schema_tokens = 300
    user_input_tokens = estimate_tokens(design_text)
    total_input_tokens = (
        system_prompt_tokens + aws_context_tokens + json_schema_tokens + user_input_tokens
    )

    estimated_output_tokens = 700  # Typical response with 3-5 risks

    # Pricing (per 1K tokens)
    input_cost_per_1k = 0.001  # $1/MTok
    output_cost_per_1k = 0.005  # $5/MTok

    # Calculate costs
    input_cost = (total_input_tokens / 1000) * input_cost_per_1k
    output_cost = (estimated_output_tokens / 1000) * output_cost_per_1k

    return {
        "input_tokens": total_input_tokens,
        "output_tokens_estimate": estimated_output_tokens,
        "input_cost": input_cost,
        "output_cost_estimate": output_cost,
        "total_cost_estimate": input_cost + output_cost,
    }


def log_token_usage(usage: dict, review_id: str):
    """
    Log actual token usage from Bedrock response.

    Pricing (Claude 3.5 Haiku):
    - Input: $1.00 per million tokens
    - Output: $5.00 per million tokens

    Args:
        usage: Usage dict from Bedrock response with keys:
            - input_tokens (int)
            - output_tokens (int)
        review_id: Review ID for tracking
    """
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)

    # Calculate costs
    input_cost = (input_tokens / 1_000_000) * 1.0
    output_cost = (output_tokens / 1_000_000) * 5.0
    total_cost = input_cost + output_cost

    logger.info(
        "Token usage recorded",
        extra={
            "review_id": review_id,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "input_cost_usd": round(input_cost, 6),
            "output_cost_usd": round(output_cost, 6),
            "total_cost_usd": round(total_cost, 6),
        },
    )


def calculate_actual_cost(usage: dict) -> float:
    """
    Calculate actual cost from Bedrock response usage.

    Pricing (Claude 3.5 Haiku):
    - Input: $1.00 per million tokens
    - Output: $5.00 per million tokens

    Args:
        usage: Usage dict from Bedrock response with keys:
            - input_tokens (int)
            - output_tokens (int)

    Returns:
        Total cost in USD (rounded to 6 decimal places)
    """
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)

    input_cost = (input_tokens / 1_000_000) * 1.0
    output_cost = (output_tokens / 1_000_000) * 5.0

    return round(input_cost + output_cost, 6)


def calculate_vision_cost(usage: dict) -> float:
    """
    Calculate cost for Bedrock vision API call.

    Uses Claude 3 Sonnet pricing (different from Haiku).

    Pricing (Claude 3 Sonnet):
    - Input: $3.00 per million tokens
    - Output: $15.00 per million tokens

    Args:
        usage: dict with input_tokens and output_tokens

    Returns:
        Cost in USD (rounded to 6 decimal places)
    """
    from app.core.config import settings

    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)

    input_cost = (input_tokens / 1000) * settings.vision_input_cost_per_1k
    output_cost = (output_tokens / 1000) * settings.vision_output_cost_per_1k

    return round(input_cost + output_cost, 6)
