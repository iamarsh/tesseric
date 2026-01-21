"""
RAG (Retrieval-Augmented Generation) service for architecture analysis.

v0.1: Stubbed implementation with pattern detection
Phase 1: Will integrate real Bedrock KB retrieval + Claude 3 generation
"""

import uuid
from datetime import datetime, timezone
from app.models.request import ReviewRequest
from app.models.response import ReviewResponse, RiskItem


def calculate_score(risks: list[RiskItem]) -> int:
    """
    Calculate overall architecture score based on risks.

    Scoring:
    - Start at 100
    - CRITICAL: -25 points
    - HIGH: -15 points
    - MEDIUM: -8 points
    - LOW: -3 points

    Minimum score: 0
    """
    score = 100
    for risk in risks:
        if risk.severity == "CRITICAL":
            score -= 25
        elif risk.severity == "HIGH":
            score -= 15
        elif risk.severity == "MEDIUM":
            score -= 8
        elif risk.severity == "LOW":
            score -= 3

    return max(0, score)  # Floor at 0


async def analyze_design(request: ReviewRequest) -> ReviewResponse:
    """
    Analyze architecture design and return structured feedback.

    v0.1: Stubbed implementation with simple pattern detection
    Phase 1: Will call Bedrock KB for retrieval → Claude 3 for generation → parse JSON

    Args:
        request: ReviewRequest with design_text, format, tone

    Returns:
        ReviewResponse with risks, score, summary
    """
    design_lower = request.design_text.lower()
    risks: list[RiskItem] = []

    # Pattern 1: Single AZ deployment
    if any(keyword in design_lower for keyword in ["single az", "one az", "1 az"]):
        risks.append(
            RiskItem(
                id="REL-001",
                title="Single Availability Zone Deployment",
                severity="HIGH",
                pillar="reliability",
                impact="Service becomes unavailable during AZ-level failure (entire data center outage). "
                "AWS AZ failures are rare but do occur (e.g., us-east-1a outage Dec 2021).",
                likelihood="MEDIUM",
                finding="Architecture deploys all resources to a single Availability Zone, "
                "creating a single point of failure at the infrastructure level.",
                remediation="Deploy resources across at least 2 Availability Zones within the same region. "
                "Use Application Load Balancer or Network Load Balancer to distribute traffic. "
                "Ensure RDS, EFS, and other stateful services are configured for Multi-AZ.",
                references=[
                    "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/availability.html",
                    "https://aws.amazon.com/architecture/well-architected/",
                ],
            )
        )

    # Pattern 2: No encryption
    if any(keyword in design_lower for keyword in ["no encryption", "unencrypted", "without encryption"]):
        risks.append(
            RiskItem(
                id="SEC-001",
                title="Data Not Encrypted at Rest",
                severity="CRITICAL",
                pillar="security",
                impact="Sensitive data exposed in case of unauthorized access to storage (disk theft, snapshot leak, etc.). "
                "Compliance violations for HIPAA, PCI-DSS, GDPR.",
                likelihood="HIGH",
                finding="Architecture stores data without encryption at rest (S3, EBS, RDS, etc.).",
                remediation="Enable encryption at rest for all storage services: "
                "S3 (SSE-S3, SSE-KMS, or SSE-C), RDS (enable encryption at creation), "
                "EBS (enable default encryption in account settings). "
                "Use AWS KMS for centralized key management.",
                references=[
                    "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/data-protection.html",
                    "https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-bucket-encryption.html",
                ],
            )
        )

    # Pattern 3: No backups
    if any(keyword in design_lower for keyword in ["no backup", "no backups", "without backup"]):
        risks.append(
            RiskItem(
                id="REL-002",
                title="No Backup Strategy Configured",
                severity="HIGH",
                pillar="reliability",
                impact="Permanent data loss in case of accidental deletion, corruption, or ransomware attack. "
                "No ability to restore to previous state (violates RTO/RPO requirements).",
                likelihood="HIGH",
                finding="Architecture does not implement automated backups for databases or critical data.",
                remediation="Enable automated backups: RDS (automated backups with 7-35 day retention), "
                "DynamoDB (Point-in-Time Recovery), EBS (snapshots via AWS Backup or Data Lifecycle Manager). "
                "Define RPO (Recovery Point Objective) and RTO (Recovery Time Objective) and test recovery process.",
                references=[
                    "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/backup-and-recovery.html",
                    "https://aws.amazon.com/backup/",
                ],
            )
        )

    # Pattern 4: Public S3 bucket
    if any(keyword in design_lower for keyword in ["public s3", "s3 public", "publicly accessible s3"]):
        risks.append(
            RiskItem(
                id="SEC-002",
                title="S3 Bucket Publicly Accessible",
                severity="CRITICAL",
                pillar="security",
                impact="Sensitive data exposed to the internet. Potential for data leaks, compliance violations, "
                "and massive AWS bills if data is exfiltrated at scale.",
                likelihood="CRITICAL",
                finding="S3 bucket configured with public access (bucket policy or ACLs allow public read/write).",
                remediation="Remove public access: Set 'Block Public Access' settings on the bucket. "
                "Use IAM policies or S3 bucket policies with least-privilege access. "
                "Enable S3 access logging and CloudTrail for audit trail.",
                references=[
                    "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html",
                    "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/sec_protect_data_at_rest.html",
                ],
            )
        )

    # Pattern 5: No auto-scaling
    if any(keyword in design_lower for keyword in ["no auto-scaling", "no autoscaling", "fixed capacity"]):
        risks.append(
            RiskItem(
                id="PERF-001",
                title="No Auto-Scaling Configured",
                severity="MEDIUM",
                pillar="performance_efficiency",
                impact="Service degradation or outages during traffic spikes. "
                "Over-provisioning during low traffic leads to wasted cost.",
                likelihood="HIGH",
                finding="Architecture uses fixed capacity (static EC2 instances) without auto-scaling.",
                remediation="Implement Auto Scaling Groups (ASG) for EC2 instances. "
                "Configure scaling policies based on CPU, memory, or custom CloudWatch metrics. "
                "Set appropriate min/max/desired capacity. Consider predictive scaling for known patterns.",
                references=[
                    "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html",
                    "https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/selection.html",
                ],
            )
        )

    # Pattern 6: Over-provisioned resources
    if any(keyword in design_lower for keyword in ["over-provisioned", "overprovisioned", "too large"]):
        risks.append(
            RiskItem(
                id="COST-001",
                title="Over-Provisioned Resources",
                severity="MEDIUM",
                pillar="cost_optimization",
                impact="Wasted spend on unused capacity. Could be 30-70% cost reduction opportunity.",
                likelihood="HIGH",
                finding="Architecture uses instance types or capacity larger than workload requirements.",
                remediation="Right-size resources: Use AWS Compute Optimizer recommendations. "
                "Start with smaller instance types and scale up based on metrics. "
                "Consider Reserved Instances or Savings Plans for predictable workloads. "
                "Use Spot Instances for fault-tolerant workloads.",
                references=[
                    "https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/cost-optimization-pillar.html",
                    "https://aws.amazon.com/compute-optimizer/",
                ],
            )
        )

    # If no patterns detected, add a generic "needs review" item
    if not risks:
        risks.append(
            RiskItem(
                id="GEN-001",
                title="Architecture Requires Detailed Review",
                severity="LOW",
                pillar="operational_excellence",
                impact="Potential issues not detected by automated pattern matching. "
                "Manual review recommended for comprehensive assessment.",
                finding="No specific anti-patterns detected in provided description. "
                "However, architecture review is recommended to ensure Well-Architected alignment.",
                remediation="Review AWS Well-Architected Framework pillars: Operational Excellence, Security, "
                "Reliability, Performance Efficiency, Cost Optimization, and Sustainability. "
                "Use AWS Well-Architected Tool for guided review.",
                references=[
                    "https://aws.amazon.com/architecture/well-architected/",
                    "https://aws.amazon.com/well-architected-tool/",
                ],
            )
        )

    # Calculate score
    score = calculate_score(risks)

    # Generate summary
    num_risks = len(risks)
    pillars_affected = len(set(risk.pillar for risk in risks))
    critical_high = sum(1 for r in risks if r.severity in ["CRITICAL", "HIGH"])

    if critical_high > 0:
        summary = (
            f"Found {num_risks} issue{'s' if num_risks != 1 else ''} across {pillars_affected} "
            f"Well-Architected pillar{'s' if pillars_affected != 1 else ''}, including {critical_high} "
            f"critical/high severity finding{'s' if critical_high != 1 else ''}. "
            f"Primary concerns: {', '.join(r.title for r in risks[:3])}."
        )
    else:
        summary = (
            f"Found {num_risks} low/medium severity issue{'s' if num_risks != 1 else ''} "
            f"across {pillars_affected} pillar{'s' if pillars_affected != 1 else ''}. "
            f"Architecture is generally well-aligned with AWS best practices."
        )

    # Adjust tone for "roast" mode
    if request.tone == "roast" and risks:
        # Add some spice to the summary (keep it professional but direct)
        summary = summary.replace("Found", "Oof, found").replace(
            "Primary concerns:", "Let's talk about:"
        )

    # Generate review ID
    review_id = f"review-{uuid.uuid4()}"

    return ReviewResponse(
        review_id=review_id,
        architecture_score=score,
        risks=risks,
        summary=summary,
        tone=request.tone,
        created_at=datetime.now(timezone.utc),
    )
