# Tesseric Knowledge Base Plan

**Last Updated**: 2026-01-21
**Status**: Planning (Phase 1 - not yet implemented)

## Overview

This document outlines the AWS documentation that will be curated, processed, and stored in S3 for Bedrock Knowledge Base retrieval. This is the "brain" of Tesseric's AI review system.

## Knowledge Base Contents (Phase 1)

### 1. AWS Well-Architected Framework (Primary Source)

**Source**: https://docs.aws.amazon.com/wellarchitected/

#### Operational Excellence Pillar
- Organization
  - Organizational priorities
  - Operating model
  - Organizational culture
- Prepare
  - Design telemetry
  - Improve flow
  - Mitigate deployment risks
- Operate
  - Understanding workload health
  - Understanding operational health
  - Responding to events
- Evolve
  - Learning from experience
  - Making improvements

**Files to Include** (~50 markdown files):
- `pillars/operational-excellence/overview.md`
- `pillars/operational-excellence/design-principles.md`
- `pillars/operational-excellence/best-practices/*.md`
- `pillars/operational-excellence/questions/*.md`

#### Security Pillar
- Security foundations
  - IAM (least privilege, roles vs users, MFA)
  - Detective controls (CloudTrail, Config, GuardDuty)
  - Infrastructure protection (VPC, Security Groups, NACLs, WAF)
- Data protection
  - Encryption at rest (EBS, S3, RDS)
  - Encryption in transit (TLS, VPN)
  - Key management (KMS, rotation)
  - Secrets management (Secrets Manager, SSM Parameter Store)
- Incident response
  - Forensics
  - Automation
- Application security
  - Code analysis
  - Dependency management

**Files to Include** (~60 markdown files):
- `pillars/security/overview.md`
- `pillars/security/iam-best-practices.md`
- `pillars/security/encryption/*.md`
- `pillars/security/network-security/*.md`

#### Reliability Pillar
- Foundations
  - Service quotas and limits
  - Network topology (Multi-AZ, Multi-Region)
- Workload architecture
  - Distributed systems design
  - Failure mode analysis
- Change management
  - Deployment strategies
  - Rollback procedures
- Failure management
  - Backup and restore (RDS snapshots, EBS snapshots, S3 versioning)
  - Disaster recovery (RPO/RTO)
  - Monitoring and alarming
  - Auto-scaling and self-healing

**Files to Include** (~55 markdown files):
- `pillars/reliability/overview.md`
- `pillars/reliability/multi-az-patterns.md`
- `pillars/reliability/backup-strategies.md`
- `pillars/reliability/disaster-recovery.md`

#### Performance Efficiency Pillar
- Selection
  - Compute (EC2 types, Lambda, Fargate)
  - Storage (S3, EBS, EFS)
  - Database (RDS, DynamoDB, Aurora)
  - Network (CloudFront, VPC endpoints)
- Review
  - Performance testing
  - Monitoring and metrics
- Monitoring
  - CloudWatch metrics
  - Application-level metrics
- Tradeoffs
  - Consistency vs latency
  - Read vs write optimization

**Files to Include** (~50 markdown files):
- `pillars/performance-efficiency/overview.md`
- `pillars/performance-efficiency/compute-selection.md`
- `pillars/performance-efficiency/caching-strategies.md`
- `pillars/performance-efficiency/auto-scaling.md`

#### Cost Optimization Pillar
- Practice Cloud Financial Management
  - Cost allocation tags
  - Budgets and alerts
- Expenditure and usage awareness
  - Cost Explorer
  - Rightsizing Recommendations
- Cost-effective resources
  - Right-sizing EC2 instances
  - Reserved Instances vs Savings Plans vs Spot
  - S3 storage classes (Standard, IA, Glacier)
  - Serverless patterns (Lambda, DynamoDB on-demand)
- Manage demand and supply
  - Auto-scaling
  - Throttling
- Optimize over time
  - Regular review cycles
  - Adopting new services

**Files to Include** (~45 markdown files):
- `pillars/cost-optimization/overview.md`
- `pillars/cost-optimization/rightsizing.md`
- `pillars/cost-optimization/pricing-models.md`
- `pillars/cost-optimization/storage-classes.md`

#### Sustainability Pillar
- Region selection
  - Carbon footprint
  - Renewable energy grids
- User behavior patterns
  - Reduce unnecessary usage
- Software and architecture patterns
  - Efficient code
  - Right-sized resources
- Data patterns
  - Data lifecycle management
  - Minimize data movement
- Hardware patterns
  - Graviton processors
  - Efficient instance types

**Files to Include** (~30 markdown files):
- `pillars/sustainability/overview.md`
- `pillars/sustainability/region-selection.md`
- `pillars/sustainability/efficient-patterns.md`

### 2. AWS Service-Specific Best Practices

**Sources**: AWS service documentation pages

#### Compute
- **EC2**:
  - Instance types and selection
  - Auto Scaling best practices
  - Security Groups vs NACLs
  - EBS optimization
- **Lambda**:
  - Cold start optimization
  - Memory and timeout tuning
  - VPC configuration
  - Concurrency management
- **ECS/EKS**:
  - Task/pod sizing
  - Service discovery
  - Load balancing

#### Storage
- **S3**:
  - Bucket policies and ACLs (avoid public buckets)
  - Versioning and lifecycle policies
  - Storage classes
  - Encryption (SSE-S3, SSE-KMS, SSE-C)
- **EBS**:
  - Volume types (gp3, io2, etc.)
  - Snapshots and backup
  - Encryption at rest
- **EFS**:
  - Performance modes
  - Throughput modes

#### Database
- **RDS**:
  - Multi-AZ vs Read Replicas
  - Backup strategies
  - Encryption at rest and in transit
  - Parameter groups and tuning
- **DynamoDB**:
  - On-demand vs provisioned capacity
  - GSI/LSI design
  - Backup and point-in-time recovery
- **Aurora**:
  - Serverless vs provisioned
  - Global Database

#### Networking
- **VPC**:
  - Subnet design (public vs private)
  - NAT Gateway vs NAT Instance
  - VPC Peering vs Transit Gateway
- **CloudFront**:
  - Cache behavior
  - Origin configuration
  - Geo-restriction
- **Route 53**:
  - Routing policies
  - Health checks
  - DNS failover

#### Security
- **IAM**:
  - Least privilege policies
  - Roles vs users
  - MFA enforcement
  - Service Control Policies (SCPs)
- **KMS**:
  - Key rotation
  - Key policies
  - Grant management
- **Secrets Manager**:
  - Rotation strategies
  - Cross-region replication

**Files to Include** (~100 markdown files):
- `services/ec2/*.md`
- `services/s3/*.md`
- `services/rds/*.md`
- `services/lambda/*.md`
- `services/iam/*.md`
- ... (one folder per major service)

### 3. Common Anti-Patterns and Remediation

**Custom Content**: Curated list of common architecture mistakes

#### Examples:
- Single AZ deployments
- Public S3 buckets for non-public data
- Over-provisioned instances (cost)
- No auto-scaling (reliability + cost)
- No encryption at rest (security)
- Hard-coded credentials in code (security)
- No backups configured (reliability)
- Using root account for daily tasks (security)
- Not using VPC endpoints for AWS services (cost + security)
- Not tagging resources (cost management)

**Files to Include** (~20 markdown files):
- `anti-patterns/single-az.md`
- `anti-patterns/public-s3-buckets.md`
- `anti-patterns/no-encryption.md`
- `anti-patterns/no-backups.md`
- ... (one file per anti-pattern with detection + remediation)

### 4. Reference Architectures

**Source**: AWS Architecture Center (https://aws.amazon.com/architecture/)

#### Selected Reference Architectures:
- Three-tier web application
- Serverless web application
- Microservices with ECS/EKS
- Data lake architecture
- Real-time streaming (Kinesis)
- Batch processing (AWS Batch)
- Multi-region active-active
- Disaster recovery patterns (Backup & Restore, Pilot Light, Warm Standby, Multi-site)

**Files to Include** (~30 markdown files):
- `reference-architectures/three-tier-web.md`
- `reference-architectures/serverless-web.md`
- `reference-architectures/microservices-ecs.md`
- ... (one file per reference architecture)

## Total Document Count Estimate

- **Well-Architected Framework**: ~290 files
- **Service-Specific Best Practices**: ~100 files
- **Anti-Patterns**: ~20 files
- **Reference Architectures**: ~30 files

**Total**: ~440 markdown files

**Estimated Total Size**: 50-100 MB (markdown text)

## S3 Bucket Structure (Phase 1)

```
s3://tesseric-knowledge-base-prod/
├── pillars/
│   ├── operational-excellence/
│   │   ├── overview.md
│   │   ├── design-principles.md
│   │   ├── best-practices/
│   │   │   ├── organization.md
│   │   │   ├── prepare.md
│   │   │   ├── operate.md
│   │   │   └── evolve.md
│   │   └── questions/
│   │       └── ... (review questions)
│   ├── security/
│   │   ├── overview.md
│   │   ├── iam-best-practices.md
│   │   ├── encryption/
│   │   │   ├── at-rest.md
│   │   │   ├── in-transit.md
│   │   │   └── key-management.md
│   │   └── network-security/
│   │       ├── vpc.md
│   │       ├── security-groups.md
│   │       └── nacls.md
│   ├── reliability/
│   ├── performance-efficiency/
│   ├── cost-optimization/
│   └── sustainability/
├── services/
│   ├── ec2/
│   │   ├── instance-types.md
│   │   ├── auto-scaling.md
│   │   ├── security-groups.md
│   │   └── best-practices.md
│   ├── s3/
│   │   ├── bucket-policies.md
│   │   ├── encryption.md
│   │   ├── versioning.md
│   │   └── lifecycle.md
│   ├── rds/
│   ├── lambda/
│   └── ... (other services)
├── anti-patterns/
│   ├── single-az.md
│   ├── public-s3-buckets.md
│   ├── no-encryption.md
│   └── ... (other anti-patterns)
├── reference-architectures/
│   ├── three-tier-web.md
│   ├── serverless-web.md
│   └── ... (other architectures)
└── metadata.json  # Document metadata (version, last updated, source URLs)
```

## Document Format Standards

### Markdown Structure

Each document should follow this structure:

```markdown
# [Title]

**Pillar**: [operational_excellence | security | reliability | performance_efficiency | cost_optimization | sustainability]
**Service**: [EC2 | S3 | RDS | etc.] (if applicable)
**Last Updated**: YYYY-MM-DD
**Source**: [URL to official AWS docs]

## Overview

Brief description of the concept, service, or best practice.

## Best Practices

1. **[Practice Name]**
   - **Why**: Explanation of why this matters
   - **How**: Implementation steps
   - **Example**: Code/config example if applicable

2. **[Practice Name]**
   ...

## Common Pitfalls

- **Pitfall 1**: Description and how to avoid

## Detection

How to detect if this issue exists in an architecture:
- Keywords: "single az", "no encryption", etc.
- Indicators: Missing components, misconfigurations

## Remediation

Step-by-step guide to fix the issue:
1. Step 1
2. Step 2
3. Step 3

## References

- [AWS Well-Architected Framework - Security Pillar](https://docs.aws.amazon.com/...)
- [AWS Security Best Practices](https://docs.aws.amazon.com/...)
```

### Chunking Strategy

For Bedrock Knowledge Base:
- **Chunk size**: 512 tokens (~2,000 characters)
- **Overlap**: 50 tokens (~200 characters)
- **Rationale**: Balance between context preservation and retrieval precision

### Metadata

Each document includes:
- **Pillar**: Which Well-Architected pillar(s) it relates to
- **Service**: Which AWS service(s) it covers
- **Last Updated**: Date of last update
- **Source**: Original AWS documentation URL

## Phase 1 Implementation Steps

### Step 1: Curate Content (Manual)
1. Download AWS Well-Architected Framework PDFs/HTML
2. Extract relevant sections into markdown files
3. Organize by pillar and topic
4. Write custom anti-pattern content
5. Add reference architectures

**Estimated Time**: 20-30 hours (manual curation)

### Step 2: Upload to S3
```bash
aws s3 sync ./knowledge-base-docs s3://tesseric-knowledge-base-prod/ \
  --exclude "*.git/*" \
  --exclude ".DS_Store"
```

### Step 3: Create Bedrock Knowledge Base
1. AWS Console → Bedrock → Knowledge Bases → Create
2. **Data source**: S3 bucket (`tesseric-knowledge-base-prod`)
3. **Embedding model**: Titan Embeddings G1 - Text
4. **Vector store**: OpenSearch Serverless (managed)
5. **Chunking**: Fixed-size (512 tokens, 50 overlap)
6. **Sync**: Enable automatic sync on S3 changes

### Step 4: Test Retrieval
```python
import boto3

bedrock = boto3.client('bedrock-agent-runtime', region_name='us-east-1')

response = bedrock.retrieve(
    knowledgeBaseId='YOUR_KB_ID',
    retrievalQuery={
        'text': 'What are best practices for multi-AZ deployments?'
    },
    retrievalConfiguration={
        'vectorSearchConfiguration': {
            'numberOfResults': 10
        }
    }
)

for result in response['retrievalResults']:
    print(f"Score: {result['score']}")
    print(f"Content: {result['content']['text'][:200]}...")
    print(f"Source: {result['location']['s3Location']['uri']}")
    print("---")
```

### Step 5: Integrate with RAG Service
Update `backend/app/services/bedrock.py` and `backend/app/services/rag.py` to use real Bedrock calls.

## Cost Estimates (Phase 1)

### Bedrock Knowledge Base
- **OpenSearch Serverless**: ~$700/month (minimum 2 OCUs)
  - 1 OCU for indexing
  - 1 OCU for search
  - Each OCU: ~$350/month
- **Storage**: S3 Standard (~100 MB) = $0.023/month (negligible)
- **Embeddings**: Titan Embeddings G1
  - $0.0001 per 1,000 input tokens
  - One-time indexing: ~5M tokens = $0.50
  - Ongoing: negligible (only new docs)

### Bedrock Inference (Per Review)
- **Claude 3 Sonnet**:
  - Input: $3.00 per 1M tokens
  - Output: $15.00 per 1M tokens
- **Typical Review**:
  - Input: ~2,000 tokens (retrieved context + user design) = $0.006
  - Output: ~1,000 tokens (structured JSON) = $0.015
  - **Total per review**: ~$0.021

**Monthly Cost Estimate (1,000 reviews)**:
- Knowledge Base: $700
- Inference: $21
- **Total**: ~$721/month

**Alternative**: If OpenSearch Serverless is too expensive, consider:
- Self-hosted pgvector on RDS (~$100/month)
- Amazon Kendra (~$750/month, comparable)

## Versioning Strategy

### Quarterly Updates
- Review AWS Well-Architected updates (AWS releases quarterly)
- Update markdown files with new best practices
- Sync to S3 (triggers automatic re-indexing)
- Track changes in git:
  ```
  knowledge-base-docs/
  ├── .git/
  ├── CHANGELOG.md  # Track what changed each quarter
  └── ... (markdown files)
  ```

### Version Tags
- `v2026-Q1`: January 2026 content
- `v2026-Q2`: April 2026 content
- etc.

## Quality Assurance

### Before Upload
1. **Validate markdown**: Ensure all files parse correctly
2. **Check links**: Verify all reference URLs are valid
3. **Review content**: Ensure accuracy and completeness
4. **Test chunking**: Verify chunks preserve context

### After Upload
1. **Test retrieval**: Query KB with sample questions
2. **Measure relevance**: Score top 10 results for relevance
3. **Review coverage**: Ensure all pillars are represented
4. **Cost validation**: Confirm OpenSearch OCU usage matches expectations

## Future Enhancements (v1.1+)

### Additional Content Sources
- AWS Security Hub findings (common vulnerabilities)
- AWS Trusted Advisor checks (real-world patterns)
- CIS AWS Foundations Benchmark
- NIST Cybersecurity Framework mappings
- Industry-specific compliance (HIPAA, PCI-DSS, SOC 2)

### Structured Data
- JSON schemas for each service's best practices
- Queryable database of anti-patterns
- Cost optimization rules engine

### Multi-Language Support
- Translate markdown files to Spanish, French, etc.
- Language detection in user input
- Multilingual retrieval

---

## Summary

This knowledge base is the **foundation** of Tesseric's intelligence. The better the curation, the better the AI reviews. Phase 1 focuses on AWS Well-Architected Framework as the primary source, with service-specific best practices and anti-patterns as supporting content.

**Next Steps**:
1. Begin manual curation of markdown files (20-30 hours)
2. Set up S3 bucket and Bedrock Knowledge Base
3. Test retrieval quality with sample queries
4. Integrate with backend RAG service
5. Iterate on prompt engineering for optimal JSON output

**Documentation Location**: This file resides in `memory-bank/` (local only, not committed to git).
