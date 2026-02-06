# Tesseric - Project Goals

**Last Updated**: 2026-01-22

## Project Identity

- **Name**: Tesseric
- **Tagline**: "Instant AWS architecture reviews."
- **Domain**: tesseric.ca (future)
- **Repository**: github.com/iamarsh/tesseric

## Vision

Tesseric is an **instant AWS architecture review service** that analyzes cloud designs and returns **structured, Well-Architected-aligned feedback**. Unlike generic AI chatbots, Tesseric provides:

- **AWS-Specific Expertise**: Deep knowledge of AWS Well-Architected Framework + security best practices
- **Structured Output**: JSON with risks, severity scores, pillar mappings, and remediation steps
- **Grounded Citations**: References to specific AWS documentation sections
- **Audit Trail**: Review history and tracking across iterations
- **Multiple Tones**: Professional "standard" mode or direct "roast" mode

## Core Positioning (v0.1 / v1.0)

Tesseric is an **AWS architecture reviewer**, not a generic cloud tool.

- Anchored in **AWS Well-Architected Framework** pillars:
  - Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability
- Ingests **AWS-centric inputs**:
  - Architecture descriptions mentioning AWS services (EC2, RDS, S3, VPC, Lambda, etc.)
  - (Phase 2+) Terraform/CloudFormation snippets targeting AWS
  - (Phase 3+) AWS architecture diagram screenshots
- Outputs **structured, Well-Architected-aligned findings**:
  - Risks mapped to AWS pillars
  - AWS service-specific remediation steps (e.g., "Enable RDS Multi-AZ", "Use AWS KMS for encryption")
  - References to AWS documentation

## Multi-Cloud Vision (Phase 3+ Roadmap)

**Future Intent** (not v1 scope):
- After AWS path is stable and proven, Tesseric will expand to support:
  - **Azure**: Azure Well-Architected Framework pillars
  - **GCP**: GCP Cloud Architecture Framework
  - **n8n**: Workflow automation best practices
  - **Generic SaaS**: Cloud-agnostic system design principles

**Design Principles for Future Multi-Cloud**:
- Provider abstraction with pluggable modules (aws/azure/gcp/n8n)
- Common taxonomy mapping provider-specific concerns:
  - availability/reliability, security, performance, cost, operability, sustainability
- Provider-specific knowledge bases and service mappings

**Why AWS-First**:
- **Depth over breadth**: Deliver credible, high-quality AWS reviews first
- **Market validation**: AWS has largest cloud market share (~32% in 2024)
- **Portfolio value**: Demonstrable AWS expertise for hiring managers
- **Roadmap flexibility**: Multi-cloud adds complexity; validate single-cloud first
- **SAA alignment**: Project goal is AWS Solutions Architect preparation

## Primary Goals

1. **Portfolio Piece**: Demonstrate full-stack development + AWS integration + AI/RAG capabilities
2. **AWS SAA Preparation**: Deep dive into Well-Architected Framework while building
3. **Micro-SaaS**: Eventually launch as a credible paid service at tesseric.ca
4. **Learning Tool**: Serve as a reference for AWS best practices and architecture patterns

## Why Tesseric Beats "Just Using ChatGPT" for AWS Architectures

| Feature | ChatGPT | Tesseric |
|---------|---------|----------|
| AWS Knowledge | Generic 2023 data | Curated AWS Well-Architected (2024) |
| Output Format | Unstructured paragraphs | Strict JSON, AWS pillar mapping |
| AWS Services | Generic ("use encryption") | Specific ("use AWS KMS with CMK") |
| Consistency | Variable, creative | Deterministic AWS risk framework |
| Multi-AZ | May or may not mention | Always evaluates (AWS best practice) |
| Citations | Rarely provided | AWS doc links in every remediation |
| Tone Options | Single tone | Professional + Roast (AWS-themed) |
| Architecture Score | No scoring | 0-100 score weighted by AWS pillars |
| Cost per review | ~$0.02 (GPT-4) | ~$0.011 (Claude Haiku) |

## Version Roadmap

### v0.1 - MVP (Current Phase)

**Scope**: Bootstrap + stubbed RAG for local testing

**Features**:
- Single-tenant, dev-only deployment
- Accepts markdown/text architecture descriptions
- Returns structured JSON with:
  - `review_id`, `architecture_score` (0-100)
  - `risks[]` array (id, title, severity, pillar, finding, remediation, references)
  - `summary` (2-3 sentence overview)
  - `tone` field (standard only for now)
- Stubbed RAG service (fake but structurally correct responses)
- Simple Next.js UI (textarea → submit → display risks)
- Local testing with sample Well-Architected docs

**Tech Stack**:
- Backend: Python 3.11+ FastAPI
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Storage: None (stateless for v0.1)
- Knowledge Base: Sample markdown files in `docs/`

**Out of Scope**:
- Real Bedrock integration (stubbed)
- Authentication/API keys
- Review history storage
- Roast mode (spec'd but not active)
- Cost estimates
- Image parsing

### v1.0 - Production Beta

**Additions to v0.1**:
- Real Amazon Bedrock RAG integration
  - Knowledge Base over S3 (curated AWS Well-Architected docs)
  - Claude 3 Sonnet for analysis + generation
- Roast mode activated (same analysis, different prompt/tone)
- Review history storage (DynamoDB or Postgres)
- Basic authentication (API keys per user)
- `/reviews` endpoint to list past reviews
- Frontend improvements:
  - Review history page
  - Comparison view (before/after iterations)
  - Export to PDF
- Deployment to AWS App Runner or ECS Fargate
- CloudWatch observability (logs, metrics, alarms)

**Target**: Soft launch to friends/colleagues for testing

### v1.1 - Enhanced Analysis

**Features**:
- **Image parsing**: Upload screenshots of AWS diagrams → extract components → run RAG
  - Uses Bedrock vision models (Claude 3 with vision) or AWS Textract
- **Terraform analysis**: Paste IaC code → parse resources → assess against best practices
- **n8n workflow analysis**: Paste n8n workflow JSON → review integration patterns
- **Cost modeling**: Approximate monthly cost delta for each recommendation
  - "Switching to Aurora Serverless v2: +$50-150/month, -operational overhead"
- **Severity trends**: Show how architecture score evolves across reviews

**Target**: Portfolio-ready, demo-able product

### v1.2+ - SaaS & Multi-Tenancy

**Features**:
- Multi-tenant architecture (per-team accounts)
- User authentication (Cognito or Auth0)
- Team collaboration (shared reviews, comments)
- Pricing tiers:
  - Free: 5 reviews/month
  - Pro: $19/month, 50 reviews/month, priority support
  - Enterprise: Custom pricing, private KB, SSO
- Custom knowledge bases (upload your own compliance docs)
- Slack/Discord integration (review summaries posted automatically)
- CLI tool (`tesseric review architecture.md`)

**Target**: Real revenue at tesseric.ca

## Daily Work Principles

1. **Security First**: Never commit secrets, always check `.gitignore`, use env vars
2. **AWS Alignment**: Every decision considers Well-Architected principles (security, cost, reliability, etc.)
3. **Incremental Progress**: Move at least one task from TODO → DONE each day
4. **Documentation**: Update `progress.md` after every session, add ADRs for big decisions
5. **Testing**: All endpoints have pytest tests, manual testing for UI flows
6. **Cost Consciousness**: We're on limited AWS credits; optimize for cost during development

## Differentiating Value Propositions

For different audiences:

**For Hiring Managers / Recruiters**:
- "Full-stack SaaS with AWS integration, RAG, and production-ready architecture"
- Demonstrates: FastAPI, Next.js, Bedrock, Well-Architected knowledge, IaC

**For AWS Certification**:
- Hands-on application of Well-Architected Framework pillars
- Deep understanding of Bedrock, S3, DynamoDB, App Runner, IAM, CloudWatch

**For Potential Customers**:
- "Get AWS architecture reviews in seconds, not days"
- "Catch security/cost/reliability issues before deployment"
- "Learn best practices through structured, actionable feedback"

## Success Metrics (Future)

- **v0.1**: Local demo works end-to-end, code is clean and documented
- **v1.0**: 10+ test reviews from real AWS architectures, feedback collected
- **v1.1**: Portfolio-ready, linked from resume/LinkedIn
- **v1.2**: First paying customer, $100 MRR

## Questions to Revisit

- **Pricing**: Should roast mode be a premium feature?
- **Knowledge Base**: How often to update AWS docs? (quarterly?)
- **Bedrock Model**: Claude 3 Sonnet vs Opus (cost vs quality trade-off)
- **Deployment**: App Runner (simpler) vs ECS Fargate (more control)
- **Storage**: DynamoDB (NoSQL, simple) vs Postgres (relational, complex queries)

---

**Next Steps**: See `progress.md` for current task status.
