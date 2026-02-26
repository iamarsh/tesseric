/**
 * Example architecture descriptions for the API Playground
 * These demonstrate various AWS patterns and use cases
 */

export interface ExampleArchitecture {
  name: string;
  description: string;
  expectedScore: string;
  tone: "standard" | "roast";
  category: "well-architected" | "legacy" | "meta" | "custom";
}

export const exampleArchitectures: ExampleArchitecture[] = [
  {
    name: "Well-Architected Production",
    description: `Multi-AZ deployment across us-east-1a and us-east-1b with Auto Scaling Groups handling variable traffic. Application Load Balancer distributes requests with health checks every 30 seconds. EC2 instances (t3.medium) run containerized microservices behind private subnets.

RDS PostgreSQL 14.x configured with Multi-AZ automatic failover, encrypted at rest with AWS KMS. Automated daily backups with 7-day retention, point-in-time recovery enabled. Read replicas in secondary region for disaster recovery.

S3 buckets for static assets with CloudFront CDN (edge locations globally), objects encrypted with AES-256. Bucket policies enforce private access only, CloudFront signed URLs for authorized access. S3 Lifecycle policies archive to Glacier after 90 days.

CloudWatch monitoring with custom metrics for business KPIs, SNS alerts for critical thresholds (CPU >80%, memory >85%, disk >90%). CloudTrail enabled for audit logging, logs encrypted and stored in dedicated S3 bucket. WAF rules protect against common OWASP top 10 vulnerabilities, rate limiting per IP.

Secrets Manager stores database credentials, API keys, and third-party tokens with automatic rotation every 30 days. IAM roles with least privilege principle, MFA required for admin access, resource-based policies for cross-account access.`,
    expectedScore: "85-95",
    tone: "standard",
    category: "well-architected",
  },
  {
    name: "Single-AZ Legacy (Common Mistake)",
    description: `EC2 instances (t3.xlarge) in single availability zone us-east-1a behind Application Load Balancer. No Auto Scaling configured - manually launched 5 instances to handle peak load, often over-provisioned.

RDS MySQL 5.7 with no encryption at rest, no automated backups enabled (manual snapshots taken weekly by ops team). Root password stored in application.properties file. Database in same subnet as application servers.

S3 bucket for product images configured as publicly readable (no bucket policy), anyone with URL can access files. No versioning enabled, accidental deletes are permanent. No lifecycle policies, storage costs growing 20% monthly.

No CloudWatch alarms configured. SSH access to EC2 instances open to 0.0.0.0/0 (internet). No WAF, no rate limiting. Application logs written to local disk, cleared weekly to save space. No centralized logging.

IAM user credentials hardcoded in application code, committed to Git repository (public). No secrets management. Root account used for daily operations. No MFA on any accounts.`,
    expectedScore: "30-45",
    tone: "roast",
    category: "legacy",
  },
  {
    name: "Serverless API (Modern Pattern)",
    description: `Amazon API Gateway REST API with regional endpoint, request validation enabled at gateway level. Lambda functions (Python 3.11, 1GB memory, 30s timeout) handle business logic with provisioned concurrency for latency-sensitive endpoints.

DynamoDB tables with on-demand pricing, point-in-time recovery enabled. Global secondary indexes for query patterns, DynamoDB Streams trigger Lambda for event processing. DAX caching layer reduces read latency to sub-millisecond.

S3 + CloudFront for static website hosting (React SPA), objects compressed with Brotli. Lambda@Edge for request routing and header manipulation. Route 53 for DNS with health checks and failover.

EventBridge rules orchestrate workflows between services. SQS queues for async processing with dead letter queues for failed messages. SNS topics for fan-out notifications to multiple subscribers.

Secrets Manager for third-party API keys, X-Ray for distributed tracing, CloudWatch Logs Insights for log analysis. VPC endpoints for private communication between Lambda and AWS services. IAM execution roles with minimal permissions per function.`,
    expectedScore: "80-92",
    tone: "standard",
    category: "well-architected",
  },
  {
    name: "Microservices on ECS (Container-based)",
    description: `ECS Fargate cluster with 12 microservices, each in separate task definitions. Application Load Balancer with path-based routing (/users/* → user-service, /orders/* → order-service). Service discovery with AWS Cloud Map for inter-service communication.

RDS Aurora PostgreSQL Serverless v2 with auto-scaling from 0.5 to 16 ACUs based on load. Data API enabled for connection pooling. Multi-master clusters for write scaling. Encrypted with customer-managed KMS keys.

ElastiCache Redis cluster (r6g.large, 3 nodes) for session management and caching. Cluster mode enabled with automatic failover. Encryption in-transit and at-rest enabled. CloudWatch metrics monitored for cache hit ratio.

ECS tasks pull container images from ECR with image scanning enabled. Secrets injected via Secrets Manager, no environment variables with sensitive data. VPC with private subnets for tasks, NAT Gateway for outbound internet. Security groups enforce least privilege network access.

CodePipeline for CI/CD with blue/green deployments. CloudWatch Container Insights for observability. X-Ray for tracing requests across services. Prometheus + Grafana on EC2 for custom business metrics. SNS alerts for deployment failures.`,
    expectedScore: "82-91",
    tone: "standard",
    category: "well-architected",
  },
  {
    name: "Cost-Optimized E-Commerce",
    description: `Spot Instances for batch processing workloads (up to 90% cost savings), On-Demand instances for customer-facing web tier. Auto Scaling with predictive scaling based on historical patterns. Right-sized instances: t3a.medium for web, c6g.xlarge for compute-intensive tasks.

Aurora Serverless v2 scales to zero during off-peak hours (11 PM - 6 AM), saves $800/month. Read replicas only created during peak traffic (Black Friday). RDS Proxy for connection pooling reduces database connections by 80%.

S3 Intelligent-Tiering automatically moves infrequently accessed objects to cheaper storage classes. CloudFront with TTL set to 86400s (24h) for static assets, reduces origin requests by 95%. S3 Transfer Acceleration disabled (not cost-effective for our use case).

Lambda for scheduled tasks (report generation, data cleanup) instead of always-on EC2 instances. Step Functions orchestrates complex workflows, only pay for state transitions. SQS for decoupling, reduces need for synchronous processing.

CloudWatch log retention set to 7 days (compliance minimum), exports to S3 Glacier for long-term storage. Reserved Instances for baseline capacity (3-year term, all upfront), covers 60% of compute. Savings Plans for flexible compute (1-year term).`,
    expectedScore: "75-85",
    tone: "standard",
    category: "well-architected",
  },
  {
    name: "No Security Measures (Worst Case)",
    description: `Public EC2 instances with SSH (port 22) and RDP (port 3389) open to entire internet (0.0.0.0/0). No bastion host, developers connect directly from home networks. Root login enabled with password authentication (no key pairs). Security group allows all traffic inbound and outbound.

RDS database with publicly accessible setting enabled, port 3306 open to internet. Database credentials: username=admin, password=password123 (hardcoded in source code, committed to public GitHub repo). No SSL/TLS for database connections. Default master user used for application and admin tasks.

S3 buckets with "public-read" ACL for all objects. No bucket policies, no encryption, versioning disabled. Customer PII (names, emails, credit cards) stored in plain text JSON files in S3. Bucket name is easily guessable: companyname-prod-data.

No AWS WAF, no rate limiting, no DDoS protection. CloudTrail logging disabled to "save costs". No monitoring, no alarms. Application logs contain sensitive data (passwords, API keys, session tokens). Logs publicly accessible via S3 bucket.

IAM root account used for all operations, access keys embedded in application. No MFA. IAM users share single "developer" account with AdministratorAccess policy. Cross-account roles allow full admin access from external AWS accounts (no trust policy validation).`,
    expectedScore: "15-30",
    tone: "roast",
    category: "legacy",
  },
  {
    name: "Tesseric's Own Architecture",
    description: `Next.js 14 frontend deployed on Vercel with edge caching and automatic HTTPS. App Router pattern with server components for initial page load performance. TypeScript strict mode with 100% type coverage. Tailwind CSS 3.4 for styling with custom design system (navy + orange brand colors).

FastAPI backend on Railway (Python 3.11, async ASGI with uvicorn). Docker containerization with multi-stage builds for minimal image size. Environment variables managed via Railway secrets, no .env files in production. CORS configured for specific origins only (tesseric.ca, vercel app domains).

AWS Bedrock for AI analysis using Claude 3.5 Haiku (inference profile in us-east-2). Inline Well-Architected Framework context (~6K tokens) eliminates need for vector database. Cost per review: ~$0.001 for text, ~$0.012 for image analysis. Vision API uses Claude 3 Sonnet for architecture diagram extraction. Graceful fallback to pattern matching if Bedrock unavailable.

Neo4j AuraDB for knowledge graph (async background writes, non-blocking). Stores analysis history, service relationships, finding patterns. Cypher queries power metrics dashboard and architecture visualization. Graph writes don't block review response (asyncio.create_task).

IAM roles for backend (no access keys). Processing time tracked in metadata. No architecture descriptions or user data stored permanently (ephemeral sessions). HTTPS everywhere, no sensitive data in logs. GitHub Actions CI/CD with pytest and TypeScript compilation. Image processing with Pillow, file uploads via multipart/form-data.`,
    expectedScore: "85-92",
    tone: "standard",
    category: "meta",
  },
  {
    name: "Blank",
    description: "",
    expectedScore: "N/A",
    tone: "standard",
    category: "custom",
  },
];

/**
 * Get example architecture by name
 */
export function getExampleByName(name: string): ExampleArchitecture | undefined {
  return exampleArchitectures.find((ex) => ex.name === name);
}

/**
 * Get examples by category
 */
export function getExamplesByCategory(category: ExampleArchitecture["category"]): ExampleArchitecture[] {
  return exampleArchitectures.filter((ex) => ex.category === category);
}
