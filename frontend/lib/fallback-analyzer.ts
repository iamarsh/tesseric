/**
 * Client-side fallback analyzer for when backend is unavailable.
 *
 * This provides basic AWS architecture analysis using pattern matching,
 * similar to the backend's fallback mechanism. Used when:
 * - Backend is not deployed yet
 * - Backend is experiencing downtime
 * - Network connectivity issues
 */

import { ReviewRequest, ReviewResponse, RiskItem } from "./api";

/**
 * Generate a unique review ID
 */
function generateReviewId(): string {
  return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate architecture score based on risks
 */
function calculateScore(risks: RiskItem[]): number {
  const severityPenalties: Record<string, number> = {
    CRITICAL: 25,
    HIGH: 15,
    MEDIUM: 8,
    LOW: 3,
  };

  let score = 100;
  for (const risk of risks) {
    const penalty = severityPenalties[risk.severity] || 0;
    score -= penalty;
  }

  return Math.max(0, score);
}

/**
 * Generate summary text based on risks and tone
 */
function generateSummary(risks: RiskItem[], tone: string): string {
  if (risks.length === 0) {
    return tone === "roast"
      ? "Surprisingly, this architecture doesn't immediately make me want to cry. Still, get a proper review when the backend is available."
      : "No critical issues detected in basic analysis. For comprehensive review, please try again when the backend service is available.";
  }

  const severityCounts: Record<string, number> = {};
  const pillarSet = new Set<string>();

  for (const risk of risks) {
    severityCounts[risk.severity] = (severityCounts[risk.severity] || 0) + 1;
    pillarSet.add(risk.pillar.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  }

  const parts: string[] = [];
  if (severityCounts.CRITICAL) parts.push(`${severityCounts.CRITICAL} CRITICAL`);
  if (severityCounts.HIGH) parts.push(`${severityCounts.HIGH} HIGH`);
  if (severityCounts.MEDIUM) parts.push(`${severityCounts.MEDIUM} MEDIUM`);
  if (severityCounts.LOW) parts.push(`${severityCounts.LOW} LOW`);

  const severityStr = parts.join(", ");
  const pillarsStr = Array.from(pillarSet).sort().join(", ");

  if (tone === "roast") {
    return `Oof. Found ${severityStr} severity issues across ${pillarSet.size} pillars (${pillarsStr}). This is basic pattern matching-imagine what a real AI would find. Fix these before your infrastructure becomes a cautionary tale.`;
  } else {
    return `Found ${severityStr} severity issues across ${pillarSet.size} pillars: ${pillarsStr}. Note: This is a basic pattern-matching fallback. For comprehensive AI-powered analysis, please try again when the backend service is available.`;
  }
}

/**
 * Analyze AWS architecture using client-side pattern matching.
 * This is a fallback when the backend is unavailable.
 */
export async function analyzeFallback(request: ReviewRequest): Promise<ReviewResponse> {
  const designLower = request.design_text.toLowerCase();
  const risks: RiskItem[] = [];

  // Pattern 1: Single AZ deployment
  if (
    designLower.includes("single az") ||
    designLower.includes("one az") ||
    designLower.includes("1 az") ||
    (designLower.includes("az") && !designLower.includes("multi"))
  ) {
    risks.push({
      id: "REL-001",
      title: "Single Availability Zone Deployment",
      severity: "HIGH",
      pillar: "reliability",
      impact: "Service unavailable during AZ failure. Potential downtime of hours to days during AWS maintenance or outages.",
      likelihood: "MEDIUM",
      finding: "Architecture deployed to single availability zone",
      remediation:
        "Deploy across multiple AZs (minimum 3 for production). Use Auto Scaling groups with multi-AZ configuration, Application Load Balancer with cross-zone load balancing, and RDS Multi-AZ for databases.",
      references: [
        "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/availability.html",
        "https://aws.amazon.com/about-aws/global-infrastructure/regions_az/",
      ],
    });
  }

  // Pattern 2: No encryption / unencrypted data
  if (
    designLower.includes("no encryption") ||
    designLower.includes("unencrypted") ||
    designLower.includes("plain text") ||
    designLower.includes("plaintext")
  ) {
    risks.push({
      id: "SEC-001",
      title: "Data Not Encrypted at Rest",
      severity: "CRITICAL",
      pillar: "security",
      impact:
        "Data breach exposure, compliance violations (GDPR fines up to €20M or 4% annual revenue, HIPAA fines up to $1.5M). Unauthorized access to sensitive data if storage media is compromised.",
      likelihood: "HIGH",
      finding: "Sensitive data stored without encryption",
      remediation:
        "Enable encryption at rest using AWS KMS. For RDS: enable encryption with customer-managed keys (CMK). For S3: enable default bucket encryption with AES-256 or KMS. For EBS: enable encryption on all volumes. Migrate existing unencrypted data by creating encrypted snapshots and restoring.",
      references: [
        "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/data-protection.html",
        "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html",
      ],
    });
  }

  // Pattern 3: No backups
  if (
    designLower.includes("no backup") ||
    designLower.includes("no backups") ||
    designLower.includes("not backed up") ||
    (!designLower.includes("backup") && (designLower.includes("database") || designLower.includes("rds")))
  ) {
    risks.push({
      id: "REL-002",
      title: "No Backup Strategy Configured",
      severity: "HIGH",
      pillar: "reliability",
      impact:
        "Permanent data loss during failures, no recovery capability. Unable to meet RPO/RTO requirements. Potential business continuity failure.",
      likelihood: "MEDIUM",
      finding: "No automated backup strategy mentioned",
      remediation:
        "Implement automated backups with defined RTO/RPO. For RDS: enable automated backups with 7-30 day retention. For EC2/EBS: use AWS Backup with daily snapshots. For S3: enable versioning and cross-region replication. Test restore procedures monthly.",
      references: [
        "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/backup-and-recovery.html",
        "https://aws.amazon.com/backup/",
      ],
    });
  }

  // Pattern 4: Public S3 buckets or public storage
  if (
    designLower.includes("public s3") ||
    designLower.includes("public bucket") ||
    designLower.includes("public storage") ||
    (designLower.includes("s3") && designLower.includes("public"))
  ) {
    risks.push({
      id: "SEC-002",
      title: "Publicly Accessible Storage",
      severity: "CRITICAL",
      pillar: "security",
      impact:
        "Data breach, unauthorized access to sensitive information. Potential exposure of customer data, credentials, or proprietary information. Legal liability and reputational damage.",
      likelihood: "HIGH",
      finding: "Storage buckets configured with public access",
      remediation:
        "Remove public access policies immediately. Enable S3 Block Public Access at account and bucket level. Use S3 Access Points and VPC endpoints for internal access. For public content, use CloudFront with Origin Access Identity (OAI) or Origin Access Control (OAC). Audit all buckets with AWS Config and Trusted Advisor.",
      references: [
        "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-best-practices.html",
        "https://aws.amazon.com/premiumsupport/knowledge-center/secure-s3-resources/",
      ],
    });
  }

  // Pattern 5: No auto-scaling
  if (
    designLower.includes("no auto-scaling") ||
    designLower.includes("no autoscaling") ||
    designLower.includes("fixed capacity") ||
    designLower.includes("static capacity")
  ) {
    risks.push({
      id: "PERF-001",
      title: "No Auto-Scaling Configured",
      severity: "MEDIUM",
      pillar: "performance_efficiency",
      impact:
        "Poor performance during traffic spikes, potential service degradation or outage. Resource waste during low usage periods, leading to unnecessary costs.",
      likelihood: "MEDIUM",
      finding: "Static capacity without auto-scaling",
      remediation:
        "Implement auto-scaling based on metrics (CPU, memory, request count, custom metrics). Use EC2 Auto Scaling groups with target tracking policies. Configure scale-up quickly (1-2 minutes) and scale-down gradually (5-10 minutes) to handle traffic patterns. Set appropriate min/max/desired capacity values.",
      references: [
        "https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/selection.html",
        "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html",
      ],
    });
  }

  // Pattern 6: Over-provisioned resources
  if (
    designLower.includes("over-provisioned") ||
    designLower.includes("oversized") ||
    designLower.includes("too large") ||
    designLower.includes("rarely used")
  ) {
    risks.push({
      id: "COST-001",
      title: "Over-Provisioned Resources",
      severity: "MEDIUM",
      pillar: "cost_optimization",
      impact: "Unnecessary cloud spend, wasted capacity. Potential savings of 30-50% with right-sizing.",
      likelihood: "HIGH",
      finding: "Resources sized larger than workload requires",
      remediation:
        "Right-size instances using AWS Compute Optimizer recommendations. Analyze CloudWatch metrics over 14+ days to identify underutilized resources. Consider burstable instances (t3, t4g) for variable workloads. Use Savings Plans or Reserved Instances for steady workloads. Implement auto-scaling to match demand dynamically.",
      references: [
        "https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/cost-optimization-pillar.html",
        "https://aws.amazon.com/compute-optimizer/",
      ],
    });
  }

  // Pattern 7: No monitoring/logging
  if (
    designLower.includes("no monitoring") ||
    designLower.includes("no logging") ||
    designLower.includes("no cloudwatch") ||
    (!designLower.includes("monitoring") && !designLower.includes("cloudwatch"))
  ) {
    risks.push({
      id: "OPS-001",
      title: "Insufficient Monitoring and Logging",
      severity: "HIGH",
      pillar: "operational_excellence",
      impact:
        "Unable to detect failures, performance degradation, or security incidents. Slow incident response and troubleshooting. Lack of operational insights.",
      likelihood: "HIGH",
      finding: "No monitoring or logging strategy mentioned",
      remediation:
        "Enable CloudWatch Logs for application and infrastructure logs. Configure CloudWatch alarms for key metrics (CPU > 80%, error rate > 1%, latency > 1s). Set up CloudWatch Dashboards for operational visibility. Enable AWS CloudTrail for audit logging. Use AWS X-Ray for distributed tracing.",
      references: [
        "https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/design-telemetry.html",
        "https://aws.amazon.com/cloudwatch/",
      ],
    });
  }

  // Pattern 8: No IAM best practices
  if (
    designLower.includes("root account") ||
    designLower.includes("root user") ||
    designLower.includes("admin access") ||
    designLower.includes("full access")
  ) {
    risks.push({
      id: "SEC-003",
      title: "Overly Permissive IAM Policies",
      severity: "CRITICAL",
      pillar: "security",
      impact:
        "Potential for privilege escalation, unauthorized access, data breach. Increased blast radius of compromised credentials.",
      likelihood: "MEDIUM",
      finding: "IAM policies grant excessive permissions",
      remediation:
        "Implement least privilege access. Never use root account for daily operations. Create individual IAM users with MFA enabled. Use IAM roles for EC2, Lambda, and cross-account access. Review IAM policies with IAM Access Analyzer. Remove unused credentials and permissions. Use AWS Organizations SCPs for guardrails.",
      references: [
        "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/permissions-management.html",
        "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
      ],
    });
  }

  // If no patterns matched, add generic note
  if (risks.length === 0) {
    risks.push({
      id: "GEN-001",
      title: "Basic Analysis Complete - Backend Unavailable",
      severity: "LOW",
      pillar: "operational_excellence",
      impact:
        "Limited analysis performed. Comprehensive AI-powered review not available.",
      likelihood: "LOW",
      finding:
        "No obvious anti-patterns detected in basic client-side analysis. Backend service unavailable for comprehensive AI analysis.",
      remediation:
        "Please try again when the backend service is available for comprehensive AWS Well-Architected analysis using Claude 3.5 Haiku. The AI-powered review provides deeper insights, service-specific recommendations, and detailed remediation steps.",
      references: ["https://aws.amazon.com/architecture/well-architected/"],
    });
  }

  const architectureScore = calculateScore(risks);
  const summary = generateSummary(risks, request.tone);

  return {
    review_id: generateReviewId(),
    architecture_score: architectureScore,
    risks,
    summary,
    tone: request.tone,
    created_at: new Date().toISOString(),
  };
}
