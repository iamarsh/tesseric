# Test Architecture Descriptions

**Purpose**: Sample architecture texts for testing Tesseric v0.1 MVP

These texts are designed to trigger different pattern detections in the stubbed RAG service. Use them to test the frontend and backend locally.

---

## Test 1: Single AZ Deployment (Reliability Issue)

**Triggers**: REL-001 (HIGH severity)

```
I'm deploying a web application on EC2 in a single availability zone (us-east-1a).
The app uses RDS MySQL for the database and serves traffic through an Application Load Balancer.
Users access the app via Route 53 with a simple routing policy.
```

**Expected Output**:
- Risk: Single Availability Zone Deployment (HIGH)
- Pillar: reliability
- Score: ~85/100

---

## Test 2: Security Issues (Multiple Critical Issues)

**Triggers**: SEC-001 (CRITICAL), SEC-002 (CRITICAL)

```
My architecture uses S3 buckets with public read access to serve static assets.
The data is stored unencrypted, and EC2 instances connect directly to the internet
without a NAT gateway. RDS database has no encryption at rest. Customer data
including PII is stored in these S3 buckets and database.
```

**Expected Output**:
- Risk 1: Data Not Encrypted at Rest (CRITICAL)
- Risk 2: Public S3 Bucket Access (CRITICAL)
- Pillar: security
- Score: ~50/100

---

## Test 3: No Backup Strategy (Reliability Issue)

**Triggers**: REL-002 (HIGH severity)

```
I have a three-tier application with EC2 instances, RDS database, and S3 storage.
Currently, I don't have any backup strategy configured for the database or automated
snapshots. The application runs across multiple AZs for high availability. Data is
encrypted at rest. No disaster recovery plan exists yet.
```

**Expected Output**:
- Risk: No Backup Strategy Configured (HIGH)
- Pillar: reliability
- Score: ~85/100

---

## Test 4: Performance Issues (Auto-Scaling Missing)

**Triggers**: PERF-001 (MEDIUM severity)

```
My application doesn't use auto-scaling - I manually add EC2 instances when traffic increases.
The load balancer distributes traffic across 5 t2.micro instances that run 24/7.
Database connections are not pooled. We experience slowdowns during peak hours but
haven't implemented any caching layer yet.
```

**Expected Output**:
- Risk: No Auto-Scaling Configured (MEDIUM)
- Pillar: performance_efficiency
- Score: ~92/100

---

## Test 5: Cost Optimization Issues (Over-Provisioning)

**Triggers**: COST-001 (MEDIUM severity)

```
I'm running 20 m5.4xlarge instances continuously for a workload that only peaks during
business hours (9 AM - 5 PM EST, Monday-Friday). All instances are on-demand with no
reserved capacity. The application could handle variable load but isn't configured to
scale down during off-hours. We're spending about $15,000/month on compute alone.
```

**Expected Output**:
- Risk: Over-Provisioned Resources (MEDIUM)
- Pillar: cost_optimization
- Score: ~92/100

---

## Test 6: Multiple Critical Issues (Worst Case)

**Triggers**: REL-001 (HIGH), SEC-001 (CRITICAL), REL-002 (HIGH), SEC-002 (CRITICAL), PERF-001 (MEDIUM), COST-001 (MEDIUM)

```
I'm building an e-commerce platform with the following setup:

- Single AZ deployment in us-west-2a (no multi-AZ)
- EC2 instances without auto-scaling (5 t2.large running 24/7)
- RDS MySQL database with no encryption and no automated backups
- S3 bucket for product images set to public read access
- Customer data (names, emails, addresses) stored unencrypted in RDS and S3
- All instances are over-provisioned m5.2xlarge running continuously
- No monitoring or alerting configured
- No disaster recovery plan
- Manual scaling when traffic increases
```

**Expected Output**:
- 6 risks across multiple pillars
- Score: ~10-30/100 (very poor)
- Mix of CRITICAL, HIGH, and MEDIUM severity issues

---

## Test 7: Well-Architected Design (Best Case)

**Triggers**: None (or minimal LOW severity suggestions)

```
My application uses a well-architected design:

- Multi-AZ deployment across us-east-1a and us-east-1b for high availability
- Auto Scaling Groups with target tracking policies (CPU-based)
- Encrypted RDS database with automated daily backups and 7-day retention
- Private S3 buckets with CloudFront for public content delivery
- All data encrypted at rest (EBS, RDS, S3) using KMS
- Data encrypted in transit using TLS 1.2+
- Right-sized EC2 instances (t3.medium) with Reserved Instance pricing for predictable load
- CloudWatch monitoring with SNS alerts for critical metrics
- WAF in front of CloudFront for DDoS protection
- IAM roles with least privilege policies
- Regular automated backups tested quarterly
- Disaster recovery plan with 4-hour RTO and 1-hour RPO
```

**Expected Output**:
- 0-1 risks (maybe LOW severity suggestions)
- Score: ~95-100/100 (excellent)
- Positive summary highlighting good practices

---

## Test 8: Mixed Quality (Realistic Scenario)

**Triggers**: REL-001 (HIGH), COST-001 (MEDIUM)

```
My company runs a web application with the following architecture:

- EC2 instances in a single AZ (us-east-1a) behind an ALB
- RDS PostgreSQL Multi-AZ with automated backups enabled
- S3 buckets are private with encryption enabled (SSE-S3)
- CloudFront CDN for static content delivery
- All data encrypted in transit using TLS 1.3
- IAM roles follow least privilege principle
- CloudWatch monitoring with custom dashboards
- However, instances are over-provisioned (m5.xlarge) running 24/7 for variable workload
- No auto-scaling configured, manual intervention needed during traffic spikes
```

**Expected Output**:
- Risk 1: Single AZ for compute tier (HIGH)
- Risk 2: Over-provisioned without auto-scaling (MEDIUM)
- Score: ~77-85/100
- Mix of good (security, backups) and needs improvement (reliability, cost)

---

## Test 9: Serverless Architecture

**Triggers**: Potentially none (serverless is generally well-architected)

```
My application is fully serverless:

- Lambda functions behind API Gateway
- DynamoDB tables with on-demand capacity
- S3 for static website hosting with CloudFront
- Cognito for user authentication
- EventBridge for event-driven workflows
- All data encrypted at rest and in transit
- Lambda functions run in VPC with private subnets
- CloudWatch Logs for monitoring
- X-Ray for distributed tracing
```

**Expected Output**:
- 0 risks or LOW severity suggestions (serverless best practices)
- Score: ~95-100/100
- Positive summary

---

## Test 10: Legacy Migration (Common Real-World Scenario)

**Triggers**: SEC-001 (CRITICAL), REL-002 (HIGH), PERF-001 (MEDIUM)

```
We recently migrated a legacy on-premises application to AWS:

- Lift-and-shift migration using EC2 instances (t2.large)
- Single VPC with public and private subnets across 2 AZs
- RDS MySQL database (unencrypted) for backwards compatibility with old app
- No automated backups configured yet (planning to add)
- S3 buckets for file storage (encrypted)
- No auto-scaling, manual scaling during peak times
- ALB with health checks configured
- Security groups restrict access appropriately
- Planning to add CloudWatch monitoring next quarter
```

**Expected Output**:
- Risk 1: No encryption on RDS (CRITICAL)
- Risk 2: No backups (HIGH)
- Risk 3: No auto-scaling (MEDIUM)
- Score: ~58-70/100
- Summary: "Legacy migration with security and operational gaps to address"

---

## Testing Instructions

### Frontend Testing (via UI)

1. Start frontend: `cd frontend && npm run dev`
2. Open http://localhost:3000 (or 3001 if port in use)
3. Copy/paste one of the test texts above
4. Select tone: **Professional** or **Roast**
5. Click "Review My Architecture"
6. Verify results display correctly with:
   - Architecture score
   - Risk cards with severity badges
   - Pillar icons
   - Finding, impact, remediation sections
   - References (if any)

### Backend Testing (via curl)

```bash
curl -X POST http://localhost:8000/review \
  -H "Content-Type: application/json" \
  -d '{
    "design_text": "I am deploying a web application on EC2 in a single availability zone...",
    "format": "text",
    "tone": "standard"
  }' | jq
```

### Tone Toggle Testing

1. Submit a review in **Professional** mode
2. Click "Switch to Roast Mode" button
3. Verify:
   - No need to re-type architecture description
   - Backend returns different summary/tone
   - Risk titles remain the same (only summary changes)
   - Loading state shows during API call

---

## Expected Behavior by Pattern

| Pattern | Risk ID | Severity | Pillar | Score Impact |
|---------|---------|----------|--------|--------------|
| Single AZ | REL-001 | HIGH | reliability | -15 |
| No encryption | SEC-001 | CRITICAL | security | -25 |
| No backups | REL-002 | HIGH | reliability | -15 |
| Public S3 | SEC-002 | CRITICAL | security | -25 |
| No auto-scaling | PERF-001 | MEDIUM | performance_efficiency | -8 |
| Over-provisioned | COST-001 | MEDIUM | cost_optimization | -8 |

**Score Calculation**: Start at 100, subtract penalties for each risk detected.

---

## Tips for Creating Your Own Test Cases

1. **Single Issue**: Focus on one keyword (e.g., "single az") to isolate behavior
2. **Multiple Issues**: Combine keywords to test scoring algorithm
3. **Edge Cases**: Very short text (<50 chars), very long text (>5000 chars)
4. **Tone Comparison**: Submit same text in both Professional and Roast modes
5. **Real Architectures**: Use actual project architectures (anonymized) for realistic testing

---

## Next Steps (Phase 1)

Once Bedrock integration is complete, these test cases can be used to:
- Compare stubbed pattern detection vs real AI analysis
- Validate that Bedrock returns structured JSON matching our schema
- Fine-tune prompts for optimal risk identification
- Benchmark cost per review
- Test retrieval quality from Knowledge Base

**Document Location**: This file is committed to git (not in memory-bank/) so all developers can use these test cases.
