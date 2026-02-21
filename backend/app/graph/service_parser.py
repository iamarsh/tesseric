"""
AWS service extraction from architecture review findings.

Parses finding titles and remediations to identify AWS services mentioned.
"""

import re
from typing import List, Tuple

# AWS Services organized by category
AWS_SERVICES = {
    "compute": ["EC2", "Lambda", "ECS", "EKS", "Fargate", "Batch", "Lightsail", "App Runner"],
    "storage": [
        "S3",
        "EBS",
        "EFS",
        "FSx",
        "Glacier",
        "Storage Gateway",
        "Backup",
    ],
    "database": [
        "RDS",
        "DynamoDB",
        "Aurora",
        "Redshift",
        "ElastiCache",
        "Neptune",
        "DocumentDB",
        "MemoryDB",
        "Timestream",
    ],
    "networking": [
        "VPC",
        "CloudFront",
        "Route 53",
        "API Gateway",
        "Direct Connect",
        "Transit Gateway",
        "ELB",
        "ALB",
        "NLB",
        "PrivateLink",
        "Global Accelerator",
    ],
    "security": [
        "IAM",
        "KMS",
        "Secrets Manager",
        "GuardDuty",
        "Security Hub",
        "WAF",
        "Shield",
        "Cognito",
        "Certificate Manager",
        "ACM",
        "Macie",
        "Detective",
    ],
    "ml": [
        "Bedrock",
        "SageMaker",
        "Rekognition",
        "Comprehend",
        "Textract",
        "Polly",
        "Translate",
        "Transcribe",
    ],
    "monitoring": [
        "CloudWatch",
        "X-Ray",
        "CloudTrail",
        "Config",
        "Systems Manager",
        "EventBridge",
        "SNS",
        "SQS",
    ],
    "management": [
        "CloudFormation",
        "Systems Manager",
        "OpsWorks",
        "Service Catalog",
        "Control Tower",
        "Organizations",
        "Resource Groups",
    ],
}

# Flatten services for reverse lookup
SERVICE_TO_CATEGORY = {}
for category, services in AWS_SERVICES.items():
    for service in services:
        SERVICE_TO_CATEGORY[service.lower()] = category


def extract_aws_services(text: str) -> List[Tuple[str, str]]:
    """
    Extract AWS services mentioned in text.

    Args:
        text: Text to search for AWS service names

    Returns:
        List of (service_name, category) tuples
        Example: [("S3", "storage"), ("RDS", "database")]

    Examples:
        >>> extract_aws_services("S3 bucket without encryption")
        [('S3', 'storage')]

        >>> extract_aws_services("RDS and DynamoDB need backup")
        [('RDS', 'database'), ('DynamoDB', 'database')]
    """
    if not text:
        return []

    found_services = set()

    # Search for each service (case-insensitive, word boundaries)
    for category, services in AWS_SERVICES.items():
        for service in services:
            # Use word boundaries to avoid partial matches
            # e.g., "S3" should match "S3 bucket" but not "S32"
            pattern = r"\b" + re.escape(service) + r"\b"
            if re.search(pattern, text, re.IGNORECASE):
                # Store service with its original casing from AWS_SERVICES
                found_services.add((service, category))

    # Return sorted by service name for consistency
    return sorted(list(found_services), key=lambda x: x[0])


def extract_services_from_finding(finding_dict: dict) -> List[Tuple[str, str]]:
    """
    Extract AWS services from a finding dict (RiskItem).

    Searches title, finding, and remediation fields.

    Args:
        finding_dict: Dictionary with keys: title, finding, remediation

    Returns:
        List of unique (service_name, category) tuples
    """
    combined_text = " ".join(
        [
            finding_dict.get("title", ""),
            finding_dict.get("finding", ""),
            finding_dict.get("remediation", ""),
        ]
    )

    return extract_aws_services(combined_text)


def get_all_services_from_review(risks: list[dict]) -> List[Tuple[str, str]]:
    """
    Extract all unique AWS services from a review's findings.

    Args:
        risks: List of risk/finding dictionaries

    Returns:
        List of unique (service_name, category) tuples across all findings
    """
    all_services = set()

    for risk in risks:
        services = extract_services_from_finding(risk)
        all_services.update(services)

    return sorted(list(all_services), key=lambda x: x[0])
