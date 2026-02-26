"use client";

import { CaseStudyCard, CaseStudy } from "../casestudies/CaseStudyCard";
import { FileCheck2 } from "lucide-react";

const caseStudies: CaseStudy[] = [
  {
    title: "Single-AZ to Multi-AZ High-Availability",
    category: "Reliability",
    scoreBefore: 42,
    scoreAfter: 89,
    diagramBefore: `[ALB]
   |
 [EC2] ─ [RDS]
(us-east-1a)`,
    diagramAfter: `     [Route53]
         |
  [ALB-Multi-AZ]
   /          \\
[EC2-1a]  [EC2-1b]
     \\         /
  [RDS Multi-AZ]
(us-east-1a, 1b)`,
    findings: [
      {
        severity: "CRITICAL",
        text: "Single point of failure - entire system in one Availability Zone",
      },
      {
        severity: "HIGH",
        text: "No automated backups configured for RDS database",
      },
      {
        severity: "MEDIUM",
        text: "No monitoring or alarms for system health",
      },
    ],
    solution: [
      "Enabled RDS Multi-AZ with automatic failover",
      "Created Auto Scaling Group across 2 Availability Zones",
      "Added Route53 health checks with automatic DNS failover",
      "Configured CloudWatch alarms for CPU, memory, and disk usage",
    ],
    results: [
      { label: "Architecture Score", before: "42/100", after: "89/100" },
      { label: "Estimated Uptime", before: "99.5%", after: "99.99%" },
      { label: "Recovery Time (RTO)", before: "60 min", after: "5 min" },
      { label: "Recovery Point (RPO)", before: "24 hours", after: "5 min" },
    ],
    techStack: ["RDS Multi-AZ", "ASG", "ALB", "Route53", "CloudWatch"],
  },
  {
    title: "Encryption & KMS Implementation",
    category: "Security",
    scoreBefore: 38,
    scoreAfter: 82,
    findings: [
      {
        severity: "CRITICAL",
        text: "RDS database not encrypted at rest - potential data breach risk",
      },
      {
        severity: "CRITICAL",
        text: "S3 buckets publicly readable - exposed customer data",
      },
      {
        severity: "HIGH",
        text: "No secrets management - hardcoded credentials in code",
      },
    ],
    solution: [
      "Enabled RDS encryption at rest using AWS KMS with customer-managed keys",
      "Updated S3 bucket policies to private-only access with IAM roles",
      "Migrated credentials to AWS Secrets Manager with automatic rotation",
      "Enabled CloudTrail for comprehensive audit logging",
    ],
    results: [
      { label: "Architecture Score", before: "38/100", after: "82/100" },
      { label: "Compliance Status", before: "Non-compliant", after: "GDPR/SOC 2 Ready" },
      { label: "Security Incidents", before: "3 potential breaches", after: "0 vulnerabilities" },
      { label: "Audit Trail", before: "None", after: "Full CloudTrail coverage" },
    ],
    techStack: ["AWS KMS", "Secrets Manager", "CloudTrail", "S3 Bucket Policies"],
  },
  {
    title: "Cost Optimization - 28% Reduction",
    category: "Cost Optimization",
    scoreBefore: 71,
    scoreAfter: 84,
    findings: [
      {
        severity: "MEDIUM",
        text: "Over-provisioned EC2 instances - t3.xlarge where t3.medium sufficient",
      },
      {
        severity: "MEDIUM",
        text: "Unnecessary NAT gateways - 3 active when only 1 needed",
      },
      {
        severity: "LOW",
        text: "EBS volumes using gp2 instead of more cost-effective gp3",
      },
    ],
    solution: [
      "Right-sized EC2 instances based on actual CPU/memory usage patterns",
      "Consolidated NAT gateways from 3 to 1 without impacting availability",
      "Migrated all EBS volumes from gp2 to gp3 (20% cost reduction)",
      "Enabled S3 Intelligent-Tiering for automatic storage class optimization",
    ],
    results: [
      { label: "Monthly Cost", before: "$12,400", after: "$8,900" },
      { label: "Cost Reduction", before: "-", after: "28% ($3,500/month)" },
      { label: "Performance Impact", before: "-", after: "0% (unchanged)" },
      { label: "Architecture Score", before: "71/100", after: "84/100" },
    ],
    techStack: ["EC2 Right-Sizing", "NAT Gateway", "EBS gp3", "S3 Intelligent-Tiering"],
  },
  {
    title: "Performance & CDN Implementation",
    category: "Performance",
    scoreBefore: 68,
    scoreAfter: 91,
    findings: [
      {
        severity: "MEDIUM",
        text: "No CDN for static assets - slow load times for global users",
      },
      {
        severity: "MEDIUM",
        text: "Database queries not optimized - N+1 query patterns detected",
      },
      {
        severity: "LOW",
        text: "No caching layer - repeated database hits for same data",
      },
    ],
    solution: [
      "Deployed CloudFront CDN for static assets with edge caching",
      "Implemented ElastiCache Redis for session data and frequently accessed objects",
      "Created RDS read replicas for read-heavy workloads",
      "Enabled S3 Transfer Acceleration for faster uploads from global locations",
    ],
    results: [
      { label: "Average Latency", before: "850ms", after: "120ms" },
      { label: "Latency Reduction", before: "-", after: "86% improvement" },
      { label: "Database Load", before: "100%", after: "40% (-60%)" },
      { label: "Architecture Score", before: "68/100", after: "91/100" },
    ],
    techStack: ["CloudFront", "ElastiCache Redis", "RDS Read Replicas", "S3 Transfer Acceleration"],
  },
];

export function CaseStudiesSection() {
  return (
    <section id="case-studies" className="border-t border-border bg-gradient-to-b from-background to-muted/20 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileCheck2 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Real-World Success Stories
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            See how teams transformed their AWS architectures using Tesseric's
            analysis. From high-availability to cost optimization, these technical
            case studies show measurable improvements.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="space-y-6">
          {caseStudies.map((caseStudy, index) => (
            <CaseStudyCard key={index} caseStudy={caseStudy} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Ready to improve your architecture?
          </p>
          <a
            href="/#review"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Analyze Your Architecture
          </a>
        </div>
      </div>
    </section>
  );
}
