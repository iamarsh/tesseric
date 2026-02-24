# Tesseric - System Architecture

**Last Updated**: 2026-02-23

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
│   ├── ReviewForm.tsx         # Input form (textarea, tone selector, submit)
│   ├── ReviewResults.tsx      # Display review (score, risks, summary)
│   ├── GraphViewer.tsx        # ReactFlow graph visualization with topology-aware layout
│   ├── ArchitectureViewer.tsx # Main container for architecture-first visualization (Phase 2.3)
│   └── ActionFindingCard.tsx  # Premium finding cards with bidirectional highlighting (Phase 2.3)
├── lib/
│   ├── api.ts            # API client (submitReview function)
│   └── graphApi.ts       # Graph API client (fetchArchitectureGraph)
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
- **Architecture Visualization** (Phase 2.3):
  - Interactive ReactFlow graphs showing AWS service topology
  - Severity-based visual indicators (borders, badges, pulse animations)
  - Bidirectional highlighting between graph nodes and finding cards
  - 60/40 split layout (graph top, action cards bottom)
  - Smart positioning based on architecture pattern detection (3-tier, serverless, microservices)

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Backend URL (default: `http://localhost:8000`)

#### Backend (FastAPI + Python 3.11)

**Directory Structure**:
```
backend/app/
├── main.py               # FastAPI app, CORS, routers
├── api/
│   ├── health.py         # GET /health
│   ├── review.py         # POST /review
│   ├── graph.py          # GET /api/graph/{analysis_id}, /api/graph/global/all, /api/graph/health
│   └── metrics.py        # GET /api/metrics/stats, DELETE /api/metrics/cache
├── core/
│   ├── config.py         # Settings (pydantic-settings)
│   └── logging.py        # Logging configuration (future)
├── models/
│   ├── request.py        # ReviewRequest model
│   ├── response.py       # ReviewResponse, RiskItem models
│   ├── graph.py          # GraphNode, GraphEdge, GraphResponse models
│   └── metrics.py        # MetricsResponse model
├── services/
│   ├── bedrock.py        # BedrockClient for AWS Bedrock API calls
│   ├── rag.py            # analyze_design() function with inline AWS context
│   ├── storage.py        # DynamoDB/SQLite wrapper (future)
│   └── parsing.py        # Architecture text parsing (future)
├── graph/
│   ├── neo4j_client.py   # Neo4jClient for knowledge graph operations
│   └── service_parser.py # AWS service extraction from findings
└── utils/
    ├── image_processing.py  # Image validation and resizing
    ├── exceptions.py        # Custom exception classes
    └── token_counter.py     # Token counting for cost tracking
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

### Neo4j Knowledge Graph Integration (Phase 2.2 - Implemented)

**Purpose**: Store and query architecture reviews as a knowledge graph to enable relationship discovery and aggregate metrics.

**Architecture**:
```
┌─────────────────────┐
│  POST /review       │
│  (Analysis Complete)│
└──────────┬──────────┘
           │ Background Task
           ▼
┌─────────────────────┐
│  Neo4j Client       │
│  write_analysis()   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Neo4j Database (Cloud)                 │
│  ┌─────────────────────────────────┐   │
│  │ Nodes:                          │   │
│  │ - Analysis (review_id, score)   │   │
│  │ - Finding (severity, pillar)    │   │
│  │ - Remediation (steps, docs)     │   │
│  │ - AWSService (name, category)   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Relationships:                  │   │
│  │ - HAS_FINDING                   │   │
│  │ - REMEDIATED_BY                 │   │
│  │ - INVOLVES_SERVICE              │   │
│  │ - CO_OCCURS_WITH (with count)   │   │
│  └─────────────────────────────────┘   │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  GET /api/graph/    │
│  - /{analysis_id}   │ → Single review graph
│  - /global/all      │ → Aggregate patterns
│  - /health          │ → Connection status
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  GET /api/metrics/  │
│  - /stats           │ → Aggregate metrics (cached 5 min)
│  - /cache (DELETE)  │ → Clear cache
└─────────────────────┘
```

**Graph Schema**:
- **Analysis Node**: `{id, timestamp, score, summary, tone, processing_time_ms}`
- **Finding Node**: `{id, title, severity, category, description, impact, remediation}`
- **Remediation Node**: `{id, steps, aws_doc_url}`
- **AWSService Node**: `{name, category}` (MERGE pattern - accumulates across analyses)

**Relationships**:
1. `(Analysis)-[:HAS_FINDING]->(Finding)` - Review contains findings
2. `(Finding)-[:REMEDIATED_BY]->(Remediation)` - Finding has remediation steps
3. `(Finding)-[:INVOLVES_SERVICE]->(AWSService)` - Finding involves specific AWS services
4. `(AWSService)-[:CO_OCCURS_WITH {count: int}]-(AWSService)` - Services appear together

**API Endpoints**:
- `GET /api/graph/{analysis_id}` - Fetch knowledge graph for single review
- `GET /api/graph/global/all?limit=100` - Fetch aggregate graph (top services by co-occurrence)
- `GET /api/graph/health` - Check Neo4j connection status
- `GET /api/metrics/stats` - Aggregate production metrics (total reviews, services, severity breakdown, avg time)
- `DELETE /api/metrics/cache` - Clear metrics cache (debugging)

**Metrics Dashboard (Phase 2.2)**:
- Frontend component queries `/api/metrics/stats` on page load
- Backend caches results for 5 minutes to reduce Neo4j load
- Displays real-time stats:
  - Total reviews analyzed
  - Unique AWS services recognized
  - Findings by severity (CRITICAL, HIGH, MEDIUM, LOW)
  - Average review processing time
- Subtle Neo4j branding badge (Database icon + "Live data from Neo4j")
- Graceful fallback to static values on API failure

**Neo4j Query Patterns**:
```cypher
// Metrics: Total reviews
MATCH (a:Analysis) RETURN count(a) as total_reviews

// Metrics: Unique AWS services
MATCH (s:AWSService) RETURN count(DISTINCT s.name) as unique_services

// Metrics: Severity breakdown
MATCH (f:Finding)
RETURN f.severity as severity, count(f) as count
ORDER BY CASE f.severity
  WHEN 'CRITICAL' THEN 1
  WHEN 'HIGH' THEN 2
  WHEN 'MEDIUM' THEN 3
  WHEN 'LOW' THEN 4
END

// Metrics: Average processing time
MATCH (a:Analysis)
WHERE a.processing_time_ms IS NOT NULL
RETURN avg(a.processing_time_ms) as avg_time_ms

// Graph: Single analysis
MATCH path = (a:Analysis {id: $analysis_id})-[*1..3]->(n)
RETURN path

// Graph: Global patterns (top services by co-occurrence)
MATCH (s:AWSService)
OPTIONAL MATCH (s)-[r:CO_OCCURS_WITH]-(s2:AWSService)
WITH s, count(r) as rel_count
ORDER BY rel_count DESC
LIMIT $limit
MATCH path = (s)-[r:CO_OCCURS_WITH]-(s2:AWSService)
RETURN path
```

**Performance**:
- Write: Async background task (doesn't block review response)
- Read (single): ~500-2000ms (first query), ~100-300ms (cached)
- Read (metrics): ~1500-3000ms (first query), instant (cached for 5 min)
- Cost: Neo4j AuraDB Free tier (200k nodes, 400k relationships) - sufficient for thousands of reviews

**Environment Variables**:
- `NEO4J_URI`: Neo4j connection URI (bolt+s://...)
- `NEO4J_USERNAME`: Database username
- `NEO4J_PASSWORD`: Database password
- `NEO4J_ENABLED`: Enable/disable Neo4j integration (default: true)

### Architecture-First Visualization (Phase 2.3 - Implemented)

**Purpose**: Transform generic knowledge graphs into architecture-first visualizations that show user's actual AWS topology with visual problem indicators.

**Architecture**:
```
┌─────────────────────┐
│  User Views Review  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  ArchitectureViewer (60/40 Split Container)         │
│  ┌─────────────────────────────────────────────┐   │
│  │ GraphViewer (60% height)                    │   │
│  │ - ReactFlow canvas                          │   │
│  │ - Service nodes with severity borders       │   │
│  │ - Finding count badges                      │   │
│  │ - Pulse animations for CRITICAL issues      │   │
│  │ - Smart topology-aware positioning          │   │
│  │ - Pattern detection (3-tier/serverless)     │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Action Cards Grid (40% height, scrollable)  │   │
│  │ - 2-column responsive grid                  │   │
│  │ - Sorted by severity (CRITICAL → LOW)       │   │
│  │ - Affected services badges (clickable)      │   │
│  │ - Collapsible remediation details           │   │
│  │ - Selection state with ring border          │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
           │
           ▼
   Bidirectional Highlighting:
   - Click service → highlight related cards
   - Click card → highlight affected services
   - Smooth scroll to relevant section
```

**Frontend Components**:

**1. ArchitectureViewer.tsx** (Main Orchestrator - 215 lines)
- Manages 60/40 split layout (graph top, cards bottom)
- Fetches architecture data from `/api/graph/{analysis_id}/architecture`
- Builds service ↔ finding mappings for bidirectional highlighting
- Shared state: `selectedServiceId`, `selectedFindingId`
- Smooth scrolling coordination with refs (`graphRef`, `cardsRef`)
- Backward compatible: falls back to generic graph if no topology

**2. ActionFindingCard.tsx** (Premium Card Component - 180 lines)
- Severity-based styling (CRITICAL: red border + pulse, HIGH: orange, MEDIUM: yellow, LOW: gray)
- Affected services section with clickable badges
- Collapsible remediation using HTML5 `<details>` element
- Selection state with ring border (`ring-2 ring-primary shadow-2xl`)
- Click handlers with `stopPropagation()` for nested interactions
- Icons from Lucide (AlertTriangle, Shield, Activity, etc.)

**3. GraphViewer.tsx** (Updated - 290 lines)
- External vs internal selection state pattern
- Props: `selectedServiceId`, `onServiceClick` (optional)
- Smart positioning algorithm:
  - Detects architecture pattern (3-tier, serverless, microservices)
  - Positions services in layers:
    - Layer 1 (Top): Edge services (CloudFront, ALB, Route 53)
    - Layer 2 (Middle): Compute (EC2, Lambda, ECS)
    - Layer 3 (Bottom): Data (RDS, DynamoDB, S3)
    - Layer 4 (Right): Cross-cutting (CloudWatch, IAM, KMS)
- Service node features:
  - Finding count badge (top-right corner)
  - Severity-based border colors with pulse animation for CRITICAL
  - AWS service icons
  - Interactive hover tooltips with finding preview

**Backend API Endpoint**:
```
GET /api/graph/{analysis_id}/architecture
```

**Response**:
```json
{
  "analysis_id": "string",
  "services": [
    {
      "service_name": "EC2",
      "category": "compute",
      "finding_count": 3,
      "severity_breakdown": {
        "CRITICAL": 1,
        "HIGH": 1,
        "MEDIUM": 1,
        "LOW": 0
      }
    }
  ],
  "connections": [
    {
      "source_service": "ALB",
      "target_service": "EC2",
      "relationship_type": "routes_to"
    }
  ],
  "architecture_pattern": "3-tier"
}
```

**Interaction Flow**:
1. User views review → ArchitectureViewer fetches graph data
2. GraphViewer positions services based on detected pattern
3. Services with findings show colored borders and badges
4. **Click Service** →
   - Selected service gets ring highlight
   - Related finding cards highlight and scroll into view
   - Irrelevant cards fade (opacity: 0.3)
5. **Click Finding Card** →
   - Selected card gets ring border
   - Affected services highlight in graph with pulse animation
   - Graph scrolls into view
6. **Hover Service** → Tooltip shows up to 3 finding titles

**Visual Design**:
- **CRITICAL**: Red border (`border-red-600`), pulse animation, red badge
- **HIGH**: Orange border (`border-orange-500`), orange badge
- **MEDIUM**: Yellow border (`border-yellow-500`), yellow badge
- **LOW**: Gray border (`border-gray-400`), gray badge
- Premium card shadows: `hover:shadow-2xl transition-all duration-300`
- Selection state: `ring-2 ring-primary shadow-2xl`
- Responsive grid: `grid-cols-1 lg:grid-cols-2 gap-6`

**Performance**:
- Graph render: ~100-200ms (ReactFlow optimization)
- Smooth scroll: `scrollIntoView({ behavior: "smooth", block: "start" })`
- Mapping lookups: O(1) with Map data structures
- Mobile optimized: Single column stack, touch-friendly interactions

**Tech Stack**:
- ReactFlow 11 for graph visualization
- Lucide React for icons
- Tailwind CSS for styling
- TypeScript for type safety
- React hooks: useState, useEffect, useRef, useCallback

### AWS SAA Focus Areas

This project demonstrates:

1. **Compute**: App Runner vs ECS Fargate trade-offs
2. **AI/ML**: Amazon Bedrock integration (RAG pattern)
3. **Storage**: S3 for knowledge base, DynamoDB for reviews, Neo4j for knowledge graph
4. **Networking**: VPC design, endpoints, ALB vs direct
5. **Security**: IAM roles, secrets management, encryption at rest/transit
6. **Monitoring**: CloudWatch logs, metrics, alarms
7. **Cost Optimization**: Right-sizing, Spot/Fargate Spot (future), Bedrock pricing
8. **Well-Architected**: All 6 pillars applied to own architecture
9. **Graph Databases**: Neo4j for relationship discovery and pattern analysis

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
