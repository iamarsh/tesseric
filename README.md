# Tesseric

**Instant AWS architecture reviews.**

Instant AWS architecture review service that returns a Well-Architected-aligned score, risks, and remediation steps in seconds.

![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![Next.js](https://img.shields.io/badge/next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-teal)
![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-orange)
![Status](https://img.shields.io/badge/status-production-success)
![Neo4j](https://img.shields.io/badge/Neo4j-AuraDB-008CC1)

[![Backend Tests](https://github.com/iamarsh/tesseric/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/iamarsh/tesseric/actions/workflows/backend-tests.yml)
[![Frontend Tests](https://github.com/iamarsh/tesseric/actions/workflows/frontend-tests.yml/badge.svg)](https://github.com/iamarsh/tesseric/actions/workflows/frontend-tests.yml)
[![Integration Tests](https://github.com/iamarsh/tesseric/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/iamarsh/tesseric/actions/workflows/integration-tests.yml)
[![Security Scan](https://github.com/iamarsh/tesseric/actions/workflows/security-scan.yml/badge.svg)](https://github.com/iamarsh/tesseric/actions/workflows/security-scan.yml)

🔗 **Live Site**: [https://www.tesseric.ca](https://www.tesseric.ca)
🔗 **Production API**: [https://tesseric-production.up.railway.app](https://tesseric-production.up.railway.app)
🔗 **Knowledge Graph**: [https://www.tesseric.ca/graph](https://www.tesseric.ca/graph)

---

## 🎯 What Makes Tesseric Different

Unlike pasting your architecture into ChatGPT, Tesseric provides:

| Feature | ChatGPT | Tesseric |
|---------|---------|----------|
| **AWS Expertise** | Generic 2023 knowledge | Curated AWS Well-Architected Framework (2024) |
| **Output Format** | Unstructured paragraphs | Structured JSON with pillar mapping |
| **Recommendations** | Generic ("use encryption") | AWS-specific ("use AWS KMS with CMK") |
| **Consistency** | Variable responses | Deterministic risk framework |
| **Cost Tracking** | None | Token usage logging and cost estimation |
| **Multi-AZ Analysis** | May or may not mention | Always evaluates (AWS best practice) |
| **AWS Doc Links** | Rarely provided | Always included in references |
| **Tone Options** | One | Professional + Roast modes |
| **Knowledge Graph** | None | Neo4j-powered relationship visualization |
| **Image Analysis** | Limited | Bedrock vision for architecture diagrams |

### Key Differentiators

- ✅ **6 AWS Well-Architected Pillars**: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability
- ✅ **Structured Risk Assessment**: Severity levels (CRITICAL, HIGH, MEDIUM, LOW) with impact analysis
- ✅ **AWS Service-Specific**: Recommends actual AWS services (Multi-AZ RDS, ASG, KMS, CloudWatch)
- ✅ **Knowledge Graph Visualization**: Interactive Neo4j-powered graph showing service relationships and patterns
- ✅ **Image Upload Support**: Analyze architecture diagrams (PNG, JPG, PDF) using Bedrock vision
- ✅ **Graceful Degradation**: Falls back to pattern matching if AI unavailable
- ✅ **Roast Mode**: Get brutally honest feedback with dark humor (optional)
- ✅ **Production Ready**: Live at tesseric.ca with 2-4 second response times

---

## 🏗️ Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      User / Frontend (Vercel)                       │
│                         Next.js 14 + TypeScript                     │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐         │
│   │  /review    │  │  /graph     │  │  /graph?id=X     │         │
│   │ (Analysis)  │  │ (Global)    │  │  (Single Review) │         │
│   └─────────────┘  └─────────────┘  └──────────────────┘         │
└─────────┬────────────────┬──────────────────┬─────────────────────┘
          │ POST /review   │ GET /api/graph/* │
          │                │                   │
          ▼                ▼                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                   Production API (Railway)                          │
│                    FastAPI + Python 3.11                            │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │ /health  │  │ /review  │  │ /api/graph/*  │  │    /docs     │ │
│  └──────────┘  └─────┬────┘  └──────┬────────┘  └──────────────┘ │
│                      │                │                             │
│  ┌───────────────────▼────────────────┼─────────────────────────┐ │
│  │       Analysis Orchestration       │     Graph API Layer     │ │
│  │  • Image parsing (vision)          │  • Neo4j queries        │ │
│  │  • Bedrock AI analysis             │  • Node/edge mapping    │ │
│  │  • Cost tracking                   │  • Health checks        │ │
│  │  • Background graph write  ────────┼───────────▶             │ │
│  └────────────┬───────────────────────┴─────────────────────────┘ │
└───────────────┼───────────────────────┬─────────────────────────────┘
                │                       │
      ┌─────────┴──────────┐           │
      │                    │           │
      ▼                    ▼           ▼
┌──────────────┐   ┌──────────────┐   ┌─────────────────────────┐
│   Bedrock    │   │   Bedrock    │   │   Neo4j AuraDB          │
│  (us-east-2) │   │   Vision     │   │   Knowledge Graph       │
│              │   │              │   │                         │
│ Claude 3.5   │   │ Claude 3     │   │ • Analyses (reviews)    │
│   Haiku      │   │   Sonnet     │   │ • Findings (risks)      │
│              │   │              │   │ • AWS Services          │
│ ~$0.001/call │   │ ~$0.012/img  │   │ • Remediations          │
│ Text → JSON  │   │ Image → Text │   │ • Relationships         │
└──────────────┘   └──────────────┘   └─────────────────────────┘
```

### Data Flow

```
1. User Input
   │
   ├─ Architecture description (text)
   ├─ Format (text/markdown)
   ├─ Tone (standard/roast)
   └─ Provider (aws)
   │
   ▼
2. Backend Processing
   │
   ├─ Validate request (Pydantic)
   ├─ Build prompt (System + AWS Well-Architected context + User message)
   ├─ Estimate cost (~7,600 input tokens, ~700 output tokens)
   │
   ▼
3. AI Analysis (Bedrock)
   │
   ├─ Invoke Claude 3.5 Haiku via inference profile
   ├─ Temperature: 0.3 (deterministic)
   ├─ Response time: 2-4 seconds
   │
   ▼
4. Response Generation
   │
   ├─ Parse JSON (risks, score, summary)
   ├─ Map to AWS Well-Architected pillars
   ├─ Add metadata (cost, token usage, method)
   ├─ Apply tone modifier (standard/roast)
   │
   ▼
5. Return ReviewResponse
   │
   └─ JSON with: review_id, architecture_score, risks[], summary, metadata
```

---

## 🚀 Quick Start

### Easy Mode: Use dev.sh Script ⭐

We provide a convenient script to manage development servers with **3 ways to use it**:

**1️⃣ Interactive Menu** (no arguments):
```bash
./dev.sh
# Shows a beautiful menu with numbered options 1-9
```

**2️⃣ Quick Numerical Shortcuts**:
```bash
./dev.sh 3    # Start everything (fastest!)
./dev.sh 8    # Check server status
./dev.sh 7    # Restart all servers
./dev.sh 6    # Stop everything
```

**3️⃣ Traditional Command Names**:
```bash
./dev.sh start-all     # Start both servers
./dev.sh status        # Show server status
./dev.sh restart-all   # Restart everything
./dev.sh kill-all      # Stop all servers
./dev.sh help          # Show help menu
```

**Available Commands**:
- `1` or `start-frontend` - Start Next.js on port 3000
- `2` or `start-backend` - Start FastAPI on port 8000
- `3` or `start-all` - Start both servers together ⭐
- `4` or `kill-frontend` - Stop frontend server
- `5` or `kill-backend` - Stop backend server
- `6` or `kill-all` - Stop all servers
- `7` or `restart-all` - Restart both servers
- `8` or `status` - Show server status with PIDs
- `9` or `help` - Show detailed help

---

### Local Development

#### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **AWS Account** (for Bedrock API calls)

#### Backend Setup

```bash
cd backend
pip install -e .                    # Install in editable mode

# Configure AWS credentials (create .env from template)
cp ../.env.example .env
# Add your AWS credentials to .env:
# AWS_REGION=us-east-2
# AWS_ACCESS_KEY_ID=your_key_here
# AWS_SECRET_ACCESS_KEY=your_secret_here
# BEDROCK_MODEL_ID=arn:aws:bedrock:us-east-2:...:inference-profile/...

# Start server
uvicorn app.main:app --reload       # Runs on http://localhost:8000
```

**Verify**:
- Health check: [http://localhost:8000/health](http://localhost:8000/health)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Frontend Setup

```bash
cd frontend
npm install                         # Install dependencies
npm run dev                         # Start dev server on http://localhost:3000
```

#### Run Tests

```bash
cd backend
pytest                              # Run all tests
pytest -v                           # Verbose output
pytest tests/test_review.py -v     # Specific test file
```

### Production API

**Base URL**: `https://tesseric-production.up.railway.app`

**Endpoints**:
- `GET /health` - Health check
- `POST /review` - Submit architecture for review
- `GET /docs` - Interactive API documentation

**Example Request**:

```bash
curl -X POST https://tesseric-production.up.railway.app/review \
  -H "Content-Type: application/json" \
  -d '{
    "design_text": "AWS architecture with EC2 instances in single AZ (us-east-1a) behind ALB. RDS MySQL with no encryption and no automated backups. S3 bucket for product images is public. No auto-scaling configured.",
    "format": "text",
    "tone": "standard",
    "provider": "aws"
  }'
```

**Example Response**:

```json
{
  "review_id": "review-abc123",
  "architecture_score": 45,
  "risks": [
    {
      "id": "SEC-001",
      "title": "RDS Database Not Encrypted at Rest",
      "severity": "CRITICAL",
      "pillar": "security",
      "impact": "Sensitive data exposed if storage accessed...",
      "finding": "RDS MySQL configured without encryption...",
      "remediation": "Enable encryption at rest using AWS KMS. For existing databases, create encrypted snapshot and restore...",
      "references": [
        "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html"
      ]
    }
  ],
  "summary": "Found 4 issues across 3 Well-Architected pillars, including 2 critical/high severity findings.",
  "tone": "standard",
  "created_at": "2026-01-25T06:48:18Z",
  "metadata": {
    "analysis_method": "bedrock_claude_3_5_haiku",
    "provider": "aws",
    "token_usage": {
      "input_tokens": 7623,
      "output_tokens": 687
    },
    "processing_time_ms": 2340
  }
}
```

### Upload Architecture Diagram (Phase 2.1+)

You can now upload AWS architecture diagrams (PNG, JPG, PDF) for analysis:

```bash
curl -X POST https://tesseric-production.up.railway.app/review \
  -F "file=@/path/to/architecture-diagram.png" \
  -F "tone=standard" \
  -F "provider=aws"
```

**With Roast Mode**:

```bash
curl -X POST https://tesseric-production.up.railway.app/review \
  -F "file=@/path/to/terrible-architecture.jpg" \
  -F "tone=roast" \
  -F "provider=aws"
```

**Image Requirements**:
- Formats: PNG, JPG, PDF
- Max size: 5 MB
- Max dimensions: 2048x2048px (auto-resized if larger)
- Content: AWS architecture diagrams with service labels

**How it Works**:
1. Backend validates and processes image
2. Bedrock vision API (Claude 3 Sonnet) extracts architecture details
3. Extracted text feeds into existing analysis pipeline (Claude 3.5 Haiku)
4. Returns same structured response as text reviews

**Example Response (Image Upload)**:

```json
{
  "review_id": "review-img456",
  "architecture_score": 52,
  "risks": [ ... ],
  "summary": "Analyzed architecture from uploaded diagram...",
  "tone": "standard",
  "created_at": "2026-01-31T12:00:00Z",
  "metadata": {
    "input_method": "image",
    "image_filename": "architecture-diagram.png",
    "image_format": "png",
    "image_size_kb": 127,
    "image_dimensions": [800, 600],
    "extraction_model": "anthropic.claude-3-sonnet-20240229-v1:0",
    "analysis_method": "bedrock_claude_3_5_haiku",
    "processing_time_ms": 3450
  }
}
```

### Knowledge Graph Visualization (Phase 3)

Every architecture review is automatically persisted to Neo4j and visualized as an interactive knowledge graph.

**Access the Graph**:
- **Global Graph**: [https://www.tesseric.ca/graph](https://www.tesseric.ca/graph) - View all analyses and service patterns
- **Review-Specific Graph**: https://www.tesseric.ca/graph?id=review-xxxxx - View graph for a specific review

**Graph API Endpoints**:

```bash
# Health check
curl https://tesseric-production.up.railway.app/api/graph/health

# Get graph for specific review
curl https://tesseric-production.up.railway.app/api/graph/review-xxxxx

# Get global graph (all analyses)
curl https://tesseric-production.up.railway.app/api/graph/global/all?limit=100
```

**Graph Schema**:

The knowledge graph uses 4 node types and 4 relationship types:

**Node Types**:
- `(:Analysis)` - Review metadata (id, score, summary, timestamp)
- `(:Finding)` - Individual security/reliability/cost risks
- `(:AWSService)` - AWS services (EC2, RDS, S3, etc.) - merged across reviews
- `(:Remediation)` - Fix steps with AWS documentation links

**Relationships**:
- `(:Analysis)-[:HAS_FINDING]->(:Finding)` - Reviews contain findings
- `(:Finding)-[:REMEDIATED_BY]->(:Remediation)` - Findings have remediation steps
- `(:Finding)-[:INVOLVES_SERVICE]->(:AWSService)` - Findings relate to AWS services
- `(:AWSService)-[:CO_OCCURS_WITH {count}]->(:AWSService)` - Service co-occurrence patterns

**Example Graph Response**:

```json
{
  "nodes": [
    {
      "id": "review-abc123",
      "label": "Analysis",
      "type": "Analysis",
      "properties": {
        "id": "review-abc123",
        "score": 65,
        "summary": "Found 3 security issues...",
        "timestamp": "2026-02-22T10:00:00Z"
      }
    },
    {
      "id": "ec2-service",
      "label": "EC2",
      "type": "AWSService",
      "properties": {
        "name": "EC2",
        "category": "compute"
      }
    }
  ],
  "edges": [
    {
      "source": "review-abc123",
      "target": "finding-001",
      "type": "HAS_FINDING"
    },
    {
      "source": "finding-001",
      "target": "ec2-service",
      "type": "INVOLVES_SERVICE"
    }
  ]
}
```

**Features**:
- ✅ Interactive visualization powered by ReactFlow + Dagre layout
- ✅ Color-coded nodes by type (Analysis=blue, Finding=by severity, Service=purple)
- ✅ Automatic background writes (non-blocking, doesn't delay review responses)
- ✅ Pattern discovery across multiple reviews
- ✅ Service co-occurrence tracking (e.g., "EC2+RDS appear together 15 times")

---

## 📁 Project Structure

```
tesseric/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/                # API routers
│   │   │   ├── health.py       # GET /health
│   │   │   ├── review.py       # POST /review (text + image)
│   │   │   └── graph.py        # GET /api/graph/* (Neo4j queries)
│   │   ├── core/
│   │   │   └── config.py       # Settings (Pydantic)
│   │   ├── graph/              # Neo4j knowledge graph
│   │   │   ├── neo4j_client.py # Neo4j CRUD operations
│   │   │   └── service_parser.py # AWS service extraction
│   │   ├── models/
│   │   │   ├── request.py      # ReviewRequest
│   │   │   ├── response.py     # ReviewResponse, RiskItem
│   │   │   └── graph.py        # GraphNode, GraphEdge, GraphResponse
│   │   ├── services/
│   │   │   ├── bedrock.py      # Bedrock client (boto3)
│   │   │   ├── vision.py       # Image processing + Bedrock vision
│   │   │   ├── prompts.py      # AWS Well-Architected context
│   │   │   └── rag.py          # RAG orchestration + fallback
│   │   └── utils/
│   │       ├── exceptions.py   # Custom exceptions
│   │       └── token_counter.py # Cost estimation
│   ├── tests/                  # pytest suite
│   ├── .env                    # Local config (git-ignored)
│   ├── requirements.txt        # Production dependencies
│   └── pyproject.toml          # Dev dependencies
│
├── frontend/                   # Next.js TypeScript frontend
│   ├── app/                    # App Router pages
│   │   ├── page.tsx            # Home (review form)
│   │   ├── graph/              # Knowledge graph visualization
│   │   │   └── page.tsx        # Interactive graph page
│   │   ├── results/            # Review results page
│   │   └── roadmap/            # Product roadmap
│   ├── components/             # React components
│   │   ├── ReviewForm.tsx      # Text + image upload form
│   │   ├── ReviewResults.tsx   # Results display with graph link
│   │   ├── GraphViewer.tsx     # ReactFlow graph visualization
│   │   └── home/               # Landing page components
│   └── lib/
│       ├── api.ts              # Review API client
│       └── graphApi.ts         # Graph API client
│
├── infra/                      # Infrastructure docs
│   └── bedrock.md              # AWS Bedrock setup guide
│
├── docs/                       # Sample Well-Architected docs
│
├── memory-bank/                # Project documentation (local only)
│   ├── project-goals.md        # Vision and roadmap
│   ├── architecture.md         # System design
│   ├── decisions.log.md        # ADRs (Architectural Decision Records)
│   └── progress.md             # Task tracking
│
├── Dockerfile                  # Production container
├── railway.json                # Railway deployment config
├── railway.toml                # Railway TOML config
├── .dockerignore               # Docker build exclusions
├── .gitignore                  # Secrets excluded
├── .env.example                # Environment template
└── README.md                   # This file
```

---

## 🔐 Security

**Never commit secrets.** All sensitive data is excluded via `.gitignore`.

### Local Development
- Store AWS credentials in `.env` (git-ignored)
- Use IAM users with least-privilege permissions
- Enable MFA on AWS accounts

### Production
- **Railway**: Environment variables stored securely
- **AWS**: IAM roles with `bedrock:InvokeModel` permission only
- **Secrets**: Rotate credentials regularly

### If You Accidentally Commit a Secret
1. **Rotate immediately** in AWS Console
2. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
3. Force-push after cleaning: `git push --force`

---

## 📚 Documentation

- **API Documentation**: [/docs](https://tesseric-production.up.railway.app/docs) (interactive)
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Infrastructure**: [infra/](infra/)
- **Memory Bank**: `memory-bank/` (local only, comprehensive project docs)

---

## 🗺️ Roadmap

### Phase 0: Bootstrap ✅ COMPLETE (2026-01-21)
- ✅ Repository structure with security-first setup
- ✅ Memory bank documentation (4 comprehensive files)
- ✅ FastAPI backend scaffold with stubbed RAG
- ✅ Next.js frontend with theme switcher
- ✅ Pydantic models for 6 AWS Well-Architected pillars
- ✅ pytest suite (13 tests)

### Phase 1: AWS Bedrock Integration ✅ COMPLETE (2026-01-22)
- ✅ Real Amazon Bedrock integration (Claude 3.5 Haiku)
- ✅ AWS Well-Architected context (~6K tokens inline)
- ✅ Token usage tracking and cost estimation
- ✅ Professional + Roast tone modes
- ✅ Graceful fallback to pattern matching
- ✅ Provider validation (AWS-only for v1)

### Phase 2: Production Deployment ✅ COMPLETE (2026-01-25)
- ✅ Docker containerization (Python 3.11-slim)
- ✅ Railway deployment (https://tesseric-production.up.railway.app)
- ✅ Production CORS configuration
- ✅ AWS environment variables configured
- ✅ Health and review endpoints live
- ✅ Frontend deployment to Vercel (https://www.tesseric.ca)
- ✅ Custom domain setup (tesseric.ca)

### Phase 2.1: AWS Diagram Parsing ✅ COMPLETE (2026-02-01)
- ✅ Image upload support (PNG, JPG, PDF up to 5MB)
- ✅ Bedrock vision API integration (Claude 3 Sonnet)
- ✅ Architecture component extraction from diagrams
- ✅ Visual element to text conversion
- ✅ Feed extracted text to existing RAG pipeline
- ✅ Processing time tracking for performance monitoring

### Phase 3: Knowledge Graph & Production Polish ✅ COMPLETE (2026-02-22)
- ✅ Neo4j AuraDB knowledge graph backend integration
- ✅ Interactive graph visualization at /graph (ReactFlow + Dagre)
- ✅ Automatic analysis-to-graph persistence (background writes)
- ✅ Relationship mapping (Analyses → Findings → AWS Services → Remediations)
- ✅ Service co-occurrence tracking (CO_OCCURS_WITH relationships)
- ✅ Graph API endpoints (health, single review, global graph)
- ✅ Production-ready error handling and loading states
- ✅ CI/CD workflows (GitHub Actions for backend/frontend/integration tests)
- ✅ Neo4j Railway connection fix (Shared Variables → Service Variables)

### Phase 4: Review History & Advanced Features (Current)
- Review history storage (DynamoDB or Neo4j time-series)
- User session tracking (anonymous for now)
- Rate limiting on backend API (prevent abuse)
- Monitoring and analytics (Vercel Analytics, backend metrics)
- Graph query API (search findings, AWS services)
- Performance optimization (caching, query optimization)
- Enhanced graph visualization (filtering, search, zoom controls)

### Phase 5: Multi-Cloud Expansion (Future)
- Azure Well-Architected Framework support
- GCP Cloud Architecture Framework support
- n8n workflow analysis
- Provider abstraction layer
- Auto-detection of cloud platform
- Multi-cloud best practices knowledge base

### Phase 6: IaC Analysis (Future)
- AWS CloudFormation template analysis
- Terraform HCL parsing and review
- CDK/Pulumi support
- IaC security scanning
- Drift detection

### Phase 7: SaaS Launch (Future)
- Multi-tenant architecture
- User authentication (Cognito)
- Team collaboration features
- Custom knowledge bases
- CLI tool (`tesseric review`)
- API authentication with rate limiting

---

## 💰 Infrastructure

### Technology Stack
- **AI/ML**: Amazon Bedrock with Claude 3.5 Haiku for text analysis, Claude 3 Sonnet for vision extraction
- **Knowledge Graph**: Neo4j AuraDB Free tier (200K nodes, 400K relationships)
- **Backend Hosting**: Railway (Hobby plan)
- **Frontend Hosting**: Vercel (Hobby plan)
- **Cost Tracking**: Built-in token usage logging and cost estimation for analysis

---

## 📊 Code Quality

### Metrics Overview

| Metric | Value | Notes |
|--------|-------|-------|
| **Backend (Python)** | 4,089 LOC | Core application logic |
| **Frontend (TypeScript/React)** | 9,857 LOC | UI components + pages |
| **Tests** | 245 LOC | Backend integration tests |
| **Backend Dependencies** | 11 packages | Minimal, production-focused |
| **Frontend Dependencies** | 31 packages | Next.js ecosystem |
| **Type Coverage** | 100% | Strict TypeScript + mypy |
| **Production Builds** | ✅ Passing | Zero errors in CI/CD |

### Quality Standards

**Type Safety**:
- ✅ **TypeScript**: Strict mode enabled, no `any` types
- ✅ **Python**: Type hints with Pydantic v2 models
- ✅ **API Contracts**: Pydantic generates OpenAPI schemas
- ✅ **Cross-Stack**: TypeScript interfaces mirror Pydantic models

**Code Organization**:
- ✅ **Backend**: Modular architecture (api/, services/, models/, utils/)
- ✅ **Frontend**: Component-based (app/, components/, lib/)
- ✅ **Single Responsibility**: Each module has clear purpose
- ✅ **Dependency Injection**: Services injected, not hardcoded

**Development Practices**:
- ✅ **Linting**: ESLint (frontend), Ruff (backend)
- ✅ **Formatting**: Prettier (frontend), Black (backend)
- ✅ **Git Hooks**: Pre-commit checks for code quality
- ✅ **CI/CD**: GitHub Actions for automated testing

### Verification Commands

**Lines of Code**:
```bash
# Backend Python
find backend/app -name "*.py" | xargs wc -l | tail -1

# Frontend TypeScript/React
find frontend/app frontend/components frontend/lib \
  -name "*.tsx" -o -name "*.ts" | xargs wc -l | tail -1

# Tests
find backend/tests -name "*.py" | xargs wc -l | tail -1
```

**Type Checking**:
```bash
# Backend (mypy)
cd backend && mypy app/ --strict

# Frontend (tsc)
cd frontend && npx tsc --noEmit
```

**Linting**:
```bash
# Backend (ruff)
cd backend && ruff check app/

# Frontend (eslint)
cd frontend && npm run lint
```

**Dependency Count**:
```bash
# Backend
grep -c "^[a-zA-Z]" backend/requirements.txt

# Frontend
cat frontend/package.json | jq '.dependencies | length'
```

### Key Files Demonstrating Patterns

**Backend Architecture**:
- [backend/app/main.py](backend/app/main.py) - FastAPI app with CORS, routers, error handling
- [backend/app/core/config.py](backend/app/core/config.py) - Pydantic settings with validation
- [backend/app/services/bedrock.py](backend/app/services/bedrock.py) - AWS Bedrock client with retry logic
- [backend/app/graph/neo4j_client.py](backend/app/graph/neo4j_client.py) - Neo4j async client with background writes

**Frontend Architecture**:
- [frontend/app/page.tsx](frontend/app/page.tsx) - Homepage with state management
- [frontend/components/layout/SiteLayout.tsx](frontend/components/layout/SiteLayout.tsx) - Layout wrapper
- [frontend/lib/api.ts](frontend/lib/api.ts) - API client with error handling and fallback
- [frontend/components/playground/ConfigPanel.tsx](frontend/components/playground/ConfigPanel.tsx) - Complex form component

**API Contract**:
- [backend/app/models/request.py](backend/app/models/request.py) - Pydantic request models
- [backend/app/models/response.py](backend/app/models/response.py) - Pydantic response models
- [frontend/lib/api.ts](frontend/lib/api.ts) - TypeScript interfaces matching Pydantic

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest                              # Run all tests
pytest -v                           # Verbose
pytest tests/test_review.py         # Specific module
pytest --cov=app                    # With coverage
```

**Test Coverage**:
- ✅ Health endpoint
- ✅ Review endpoint (validation, provider filtering)
- ✅ Request/response models
- ✅ AWS pattern matching fallback
- ✅ Token estimation
- ✅ Cost calculation

### Manual Testing

Test production API:

```bash
# Health check
curl https://tesseric-production.up.railway.app/health

# Review request (standard tone)
curl -X POST https://tesseric-production.up.railway.app/review \
  -H "Content-Type: application/json" \
  -d '{"design_text":"AWS EC2 in single AZ with no backups","format":"text","tone":"standard","provider":"aws"}'

# Review request (roast mode) 😈
curl -X POST https://tesseric-production.up.railway.app/review \
  -H "Content-Type: application/json" \
  -d '{"design_text":"Public S3 bucket with customer PII, no encryption anywhere","format":"text","tone":"roast","provider":"aws"}'
```

---

## 🤝 Contributing

This is currently a portfolio/learning project for AWS Solutions Architect preparation. Contributions welcome once v1.0 is stable.

### Development Process
1. Read `memory-bank/progress.md` for current tasks
2. Check `memory-bank/decisions.log.md` for ADRs
3. Create feature branch: `git checkout -b feature/your-feature`
4. Write tests for new functionality
5. Update documentation
6. Submit PR with clear description

---

## 📝 License

Copyright (c) 2026 Arshdeep Singh. All rights reserved.

This project is proprietary software. The source code is publicly visible for educational
and reference purposes only. See [LICENSE](LICENSE) for full terms.

**Summary**:
- ✅ You may view and study the code
- ❌ No copying, modification, or redistribution without permission
- ❌ No commercial use without a separate license agreement

For licensing inquiries or permission requests, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- **AWS Well-Architected Framework** team for comprehensive documentation
- **Amazon Bedrock** team for Claude 3.5 Haiku access
- **Anthropic** for Claude AI models
- **FastAPI** and **Next.js** communities
- **Railway** for simple, affordable deployment

---

## 📧 Contact

- **Project Owner**: Arshdeep Singh
- **Repository**: [github.com/iamarsh/tesseric](https://github.com/iamarsh/tesseric)
- **Issues**: [github.com/iamarsh/tesseric/issues](https://github.com/iamarsh/tesseric/issues)
- **Production API**: [https://tesseric-production.up.railway.app](https://tesseric-production.up.railway.app)
