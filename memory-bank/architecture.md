# Tesseric - System Architecture

**Last Updated**: 2026-01-22

## Current Architecture (v0.1 - AWS-Only MVP)

### High-Level Overview

```
┌──────────┐
│   User   │
└────┬─────┘
     │ (Browser)
     ▼
┌─────────────────────┐
│  Next.js Frontend   │
│  (Port 3000)        │
│  - ReviewForm       │
│  - ReviewResults    │
└──────────┬──────────┘
           │ HTTP POST /review
           │ (JSON: provider="aws")
           ▼
┌─────────────────────┐
│  FastAPI Backend    │
│  (Port 8000)        │
│  - /health          │
│  - /review          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  AWS-Focused        │
│  Analysis Pipeline  │
│  (Bedrock + inline  │
│   AWS context)      │
└─────────────────────┘
```

### AWS-Focused Analysis Pipeline

1. **User submits AWS architecture description** (text input)
2. **Backend validates request** (Pydantic: provider must be "aws")
3. **RAG service**:
   - Builds prompt with AWS Well-Architected context (~6K tokens)
   - Calls Bedrock Claude 3.5 Haiku for analysis
   - Parses JSON response into ReviewResponse (risks mapped to AWS pillars)
4. **Returns structured AWS-specific feedback**

### Knowledge Source (v0.1)

- **Inline AWS Context**: Curated AWS Well-Architected best practices embedded in prompts (~6K tokens)
  - **Operational Excellence**: CloudFormation, CloudWatch, Systems Manager, CodePipeline
  - **Security**: IAM, KMS, GuardDuty, Security Hub, VPC design, encryption at rest/transit
  - **Reliability**: Multi-AZ, RDS Multi-AZ, automated backups, health checks, Route 53
  - **Performance Efficiency**: Auto Scaling, ElastiCache, CloudFront, right-sizing, Compute Optimizer
  - **Cost Optimization**: Reserved Instances, Savings Plans, Spot Instances, right-sizing
  - **Sustainability**: Serverless (Lambda, Fargate), Graviton processors, efficient instance types
- **AWS Service-Specific**: EC2, RDS, S3, VPC, Lambda, ECS/EKS best practices

**Why Inline Context Instead of Knowledge Bases**:
- Zero fixed costs (no OpenSearch Serverless minimum ~$730/month)
- Single API call to Bedrock (no retrieval step)
- Cost: ~$0.011 per review
- Simple to maintain and version control
- Deep AWS focus with comprehensive coverage

### Target Architecture (v1.0 - Production)

```
┌──────────┐
│   User   │
└────┬─────┘
     │ (Browser or API)
     ▼
┌─────────────────────┐      ┌──────────────────┐
│  Next.js Frontend   │      │   API Clients    │
│  (App Runner)       │      │   (curl, SDKs)   │
└──────────┬──────────┘      └────────┬─────────┘
           │                          │
           └──────────┬───────────────┘
                      │ HTTPS (API Gateway or ALB)
                      │ + API Key Auth
                      ▼
           ┌─────────────────────┐
           │  FastAPI Backend    │
           │  (App Runner / ECS) │
           │  - /health          │
           │  - /review          │
           │  - /reviews (list)  │
           └──────────┬──────────┘
                      │
          ┏━━━━━━━━━━┻━━━━━━━━━━┓
          ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│  Amazon Bedrock  │   │    DynamoDB      │
│  - Knowledge Base│   │  - reviews table │
│  - Claude 3      │   │    (history)     │
│  - Retrieval     │   └──────────────────┘
└────────┬─────────┘
         │ Retrieves from
         ▼
┌──────────────────┐
│   S3 Bucket      │
│  - AWS Well-     │
│    Architected   │
│    docs (curated)│
└──────────────────┘
         │
         ▼ (Optional)
┌──────────────────┐
│   CloudWatch     │
│  - Logs          │
│  - Metrics       │
│  - Alarms        │
└──────────────────┘
```

**v1.0 Data Flow**:
1. User submits architecture via UI or API (with API key)
2. Backend validates API key, rate limits
3. RAG service:
   a. Calls Bedrock Knowledge Base retrieval with `design_text`
   b. Gets top K relevant doc chunks from S3 (via Bedrock)
   c. Constructs prompt: system context + retrieved docs + user design + output format
   d. Calls Bedrock Claude 3 Sonnet for generation
   e. Parses JSON response into `ReviewResponse` model
4. Backend stores review in DynamoDB (review_id, input, output, timestamp, user_id)
5. Returns structured JSON to frontend

### Component Specifications

#### Frontend (Next.js 14 + TypeScript + Tailwind CSS)

**Directory Structure**:
```
frontend/
├── app/
│   ├── layout.tsx        # Root layout (metadata, fonts)
│   ├── page.tsx          # Home page (review form + results)
│   └── globals.css       # Tailwind imports + custom styles
├── components/
│   ├── ReviewForm.tsx    # Input form (textarea, tone selector, submit)
│   └── ReviewResults.tsx # Display review (score, risks, summary)
├── lib/
│   └── api.ts            # API client (submitReview function)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

**Key Features**:
- Single-page app for v0.1 (no routing yet)
- Responsive design (desktop + mobile via Tailwind)
- Loading states during API calls
- Error handling with user-friendly messages
- Clean, professional UI (no fancy animations, focus on clarity)

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Backend URL (default: `http://localhost:8000`)

#### Backend (FastAPI + Python 3.11)

**Directory Structure**:
```
backend/app/
├── main.py               # FastAPI app, CORS, routers
├── api/
│   ├── health.py         # GET /health
│   └── review.py         # POST /review
├── core/
│   ├── config.py         # Settings (pydantic-settings)
│   └── logging.py        # Logging configuration (future)
├── models/
│   ├── request.py        # ReviewRequest model
│   └── response.py       # ReviewResponse, RiskItem models
├── services/
│   ├── bedrock.py        # BedrockClient (stubbed for v0.1)
│   ├── rag.py            # analyze_design() function
│   ├── storage.py        # DynamoDB/SQLite wrapper (future)
│   └── parsing.py        # Architecture text parsing (future)
└── utils/
    └── (future utilities)
```

**Key Features**:
- FastAPI auto-generated OpenAPI docs at `/docs`
- CORS enabled for `localhost:3000` (dev) and `tesseric.ca` (prod)
- Pydantic validation for all requests/responses
- Structured logging (JSON format for CloudWatch)
- Health check endpoint for monitoring

**Environment Variables**:
- `AWS_REGION`: AWS region (default: `us-east-1`)
- `AWS_PROFILE`: AWS CLI profile (dev only)
- `BEDROCK_KB_ID`: Bedrock Knowledge Base ID
- `BEDROCK_MODEL_ID`: Bedrock model ID (default: Claude 3 Sonnet)
- `BACKEND_PORT`: Port to run on (default: `8000`)
- `LOG_LEVEL`: Logging level (default: `INFO`)

#### RAG Service (v0.1 Stub → v1.0 Real Bedrock)

**v0.1 Stubbed Implementation**:
```python
async def analyze_design(request: ReviewRequest) -> ReviewResponse:
    # Detect simple patterns in design_text
    design_lower = request.design_text.lower()

    risks = []
    if "single az" in design_lower or "one az" in design_lower:
        risks.append(RiskItem(
            id="REL-001",
            title="Single Availability Zone Deployment",
            severity="HIGH",
            pillar="reliability",
            impact="Service unavailable during AZ failure",
            finding="Architecture uses single AZ",
            remediation="Deploy across multiple AZs",
            references=["https://docs.aws.amazon.com/wellarchitected/..."]
        ))

    # ... more pattern detection ...

    return ReviewResponse(
        review_id=f"review-{uuid.uuid4()}",
        architecture_score=calculate_score(risks),
        risks=risks,
        summary="Found X issues across Y pillars",
        tone=request.tone,
        created_at=datetime.now()
    )
```

**v1.0 Real Implementation**:
```python
async def analyze_design(request: ReviewRequest) -> ReviewResponse:
    # 1. Retrieve relevant docs from Bedrock KB
    retrieval_results = await bedrock_client.retrieve(
        kb_id=settings.BEDROCK_KB_ID,
        query=request.design_text,
        max_results=10
    )

    # 2. Construct prompt
    prompt = build_analysis_prompt(
        design=request.design_text,
        context=retrieval_results,
        tone=request.tone
    )

    # 3. Call Bedrock for generation
    response = await bedrock_client.generate(
        model_id=settings.BEDROCK_MODEL_ID,
        prompt=prompt,
        response_format="json"
    )

    # 4. Parse and validate
    review = parse_bedrock_response(response)
    return review
```

#### Knowledge Base (v1.0+)

**Contents**:
- AWS Well-Architected Framework (all 6 pillars)
  - Operational Excellence
  - Security
  - Reliability
  - Performance Efficiency
  - Cost Optimization
  - Sustainability
- AWS security best practices (IAM, encryption, network)
- Common anti-patterns and fixes
- Cost optimization patterns (right-sizing, RI/Spot, serverless)

**Storage**:
- S3 bucket: `tesseric-knowledge-base-prod`
- Organization: `/pillars/{pillar-name}/*.md`
- Format: Markdown with structured headers for chunking
- Versioning: Quarterly updates (track in git)

**Indexing**:
- Bedrock Knowledge Base with OpenSearch Serverless backend
- Chunking strategy: 512 tokens with 50 token overlap
- Embedding model: Titan Embeddings G1

### Data Models

#### ReviewRequest (Input)
```json
{
  "design_text": "string (500-10000 chars)",
  "format": "markdown | text",
  "tone": "standard | roast"
}
```

#### ReviewResponse (Output)
```json
{
  "review_id": "string (UUID)",
  "architecture_score": "int (0-100)",
  "risks": [
    {
      "id": "string (REL-001, SEC-002, etc.)",
      "title": "string",
      "severity": "CRITICAL | HIGH | MEDIUM | LOW",
      "pillar": "operational_excellence | security | reliability | performance_efficiency | cost_optimization | sustainability",
      "impact": "string (what happens if not fixed)",
      "likelihood": "string (optional: how likely is this to occur)",
      "finding": "string (what we found wrong)",
      "remediation": "string (how to fix it)",
      "references": ["string (AWS doc URLs)"]
    }
  ],
  "summary": "string (2-3 sentences)",
  "tone": "string (echoes request)",
  "created_at": "datetime (ISO 8601)"
}
```

#### Risk Scoring
- **Architecture Score**: Weighted average across pillars
  - Security: 30% weight
  - Reliability: 25%
  - Cost Optimization: 20%
  - Performance Efficiency: 10%
  - Operational Excellence: 10%
  - Sustainability: 5%
- Each pillar score: `100 - (sum of risk severity deductions)`
  - CRITICAL: -25 points
  - HIGH: -15 points
  - MEDIUM: -8 points
  - LOW: -3 points

### Deployment Architecture (v1.0+)

#### Compute
- **Option 1 (Preferred)**: AWS App Runner
  - Single container deployment
  - Auto-scaling (0.5-2 vCPU, 1-4 GB RAM)
  - Cost: ~$10-50/month at low volume
  - Pros: Simple, managed, HTTPS out of box
  - Cons: Less control, VPC integration limited

- **Option 2**: ECS Fargate
  - Task definition: 0.5 vCPU, 1 GB RAM
  - Auto-scaling: 1-5 tasks
  - ALB for load balancing
  - Cost: ~$20-80/month
  - Pros: More control, VPC native, better for scale
  - Cons: More setup, requires ALB

#### Networking
- **Dev**: Public endpoints, no VPC
- **Prod**: VPC with private subnets for backend, public subnets for ALB
- **Bedrock access**: VPC endpoints (no internet egress)

#### IAM Roles
- **Backend Task Role** (ECS/App Runner):
  - `bedrock:Retrieve` on KB
  - `bedrock:InvokeModel` on Claude 3
  - `dynamodb:PutItem`, `GetItem`, `Query` on reviews table
  - `logs:CreateLogStream`, `PutLogEvents` for CloudWatch

### AWS SAA Focus Areas

This project demonstrates:

1. **Compute**: App Runner vs ECS Fargate trade-offs
2. **AI/ML**: Amazon Bedrock integration (RAG pattern)
3. **Storage**: S3 for knowledge base, DynamoDB for reviews
4. **Networking**: VPC design, endpoints, ALB vs direct
5. **Security**: IAM roles, secrets management, encryption at rest/transit
6. **Monitoring**: CloudWatch logs, metrics, alarms
7. **Cost Optimization**: Right-sizing, Spot/Fargate Spot (future), Bedrock pricing
8. **Well-Architected**: All 6 pillars applied to own architecture

### Future Extensions (Phase 3+ - Not v1 Scope)

#### Multi-Cloud Provider Modules

**Design** (not implemented):
- Provider abstraction layer with modules: `providers/aws/`, `providers/azure/`, `providers/gcp/`, `providers/n8n/`
- Each module supplies:
  - Provider-specific knowledge base (Azure Well-Architected, GCP Cloud Architecture)
  - Service mappings (Azure SQL → RDS equivalent, Blob Storage → S3 equivalent)
  - Pillar taxonomy mapping to common concerns

**Implementation Plan** (future):
1. Extract AWS logic into `providers/aws/` module
2. Define common provider interface (analyze, map_findings, get_references)
3. Add `providers/azure/`, `providers/gcp/`, etc. when AWS is stable
4. Update ReviewRequest to accept `provider` enum with all values
5. Implement provider auto-detection based on service keywords

**Status**: **NOT IMPLEMENTED**, out of v1 scope

#### Other Future Enhancements (v1.1+)

- **Image Parsing**: API Gateway → Lambda → Bedrock (vision model) → extract text → RAG
- **Terraform Analysis**: Parse HCL → identify resources → RAG with IaC-specific docs
- **Batch Reviews**: SQS queue → Lambda workers → process multiple designs
- **Custom KBs**: Per-tenant S3 prefixes → separate Bedrock KB indices
- **Multi-Region**: Route 53 → CloudFront → regional backends (if scale demands)

---

**Next**: See `decisions.log.md` for architectural decision records (ADRs).
