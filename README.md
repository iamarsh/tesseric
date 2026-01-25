# Tesseric

**Architecture, piece by piece.**

AI-powered AWS architecture review service that analyzes your cloud designs and returns structured, AWS Well-Architected Framework-aligned feedback with actionable remediation steps.

![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![Next.js](https://img.shields.io/badge/next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-teal)
![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-orange)
![Status](https://img.shields.io/badge/status-production-success)

🔗 **Production API**: [https://tesseric-production.up.railway.app](https://tesseric-production.up.railway.app)

---

## 🎯 What Makes Tesseric Different

Unlike pasting your architecture into ChatGPT, Tesseric provides:

| Feature | ChatGPT | Tesseric |
|---------|---------|----------|
| **AWS Expertise** | Generic 2023 knowledge | Curated AWS Well-Architected Framework (2024) |
| **Output Format** | Unstructured paragraphs | Structured JSON with pillar mapping |
| **Recommendations** | Generic ("use encryption") | AWS-specific ("use AWS KMS with CMK") |
| **Consistency** | Variable responses | Deterministic risk framework |
| **Cost Tracking** | None | ~$0.011 per review with token logging |
| **Multi-AZ Analysis** | May or may not mention | Always evaluates (AWS best practice) |
| **AWS Doc Links** | Rarely provided | Always included in references |
| **Tone Options** | One | Professional + Roast modes |

### Key Differentiators

- ✅ **6 AWS Well-Architected Pillars**: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability
- ✅ **Structured Risk Assessment**: Severity levels (CRITICAL, HIGH, MEDIUM, LOW) with impact analysis
- ✅ **AWS Service-Specific**: Recommends actual AWS services (Multi-AZ RDS, ASG, KMS, CloudWatch)
- ✅ **Graceful Degradation**: Falls back to pattern matching if AI unavailable
- ✅ **Roast Mode**: Get brutally honest feedback with dark humor (optional)
- ✅ **Production Ready**: Live API with 2-4 second response times

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User / Frontend                          │
│                     (Next.js - Port 3000)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             │ POST /review
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Production API Gateway                        │
│              Railway (tesseric-production.up.railway.app)        │
│                         Port 8080                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                             │
│                     (Python 3.11)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   /health    │  │   /review    │  │   /docs      │         │
│  └──────────────┘  └──────┬───────┘  └──────────────┘         │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐        │
│  │           RAG Orchestration Layer                   │        │
│  │  - Cost estimation (~$0.011/review)                 │        │
│  │  - Prompt building (AWS Well-Architected context)   │        │
│  │  - Response parsing & validation                    │        │
│  │  - Graceful fallback to pattern matching            │        │
│  └─────────────────────────┬──────────────────────────┘        │
└────────────────────────────┼────────────────────────────────────┘
                             │
              ┌──────────────┴───────────────┐
              │                              │
              ▼                              ▼
    ┌─────────────────┐          ┌──────────────────────┐
    │  Amazon Bedrock │          │  Pattern Matching    │
    │  (us-east-2)    │          │  Fallback Engine     │
    │                 │          │  (6 AWS Patterns)    │
    │  Claude 3.5     │          └──────────────────────┘
    │  Haiku          │
    │                 │
    │  - AWS Context  │
    │    (~6K tokens) │
    │  - JSON Output  │
    │  - Cost: ~$0.01 │
    └─────────────────┘
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
    "cost_usd": 0.0112
  }
}
```

---

## 📁 Project Structure

```
tesseric/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/                # API routers
│   │   │   ├── health.py       # GET /health
│   │   │   └── review.py       # POST /review
│   │   ├── core/
│   │   │   └── config.py       # Settings (Pydantic)
│   │   ├── models/
│   │   │   ├── request.py      # ReviewRequest
│   │   │   └── response.py     # ReviewResponse, RiskItem
│   │   ├── services/
│   │   │   ├── bedrock.py      # Bedrock client (boto3)
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
│   │   ├── results/            # Review results page
│   │   └── roadmap/            # Product roadmap
│   ├── components/             # React components
│   │   ├── ReviewForm.tsx
│   │   └── ReviewResults.tsx
│   └── lib/
│       └── api.ts              # API client
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
- ✅ Token usage tracking and cost logging (~$0.011/review)
- ✅ Professional + Roast tone modes
- ✅ Graceful fallback to pattern matching
- ✅ Provider validation (AWS-only for v1)

### Phase 2: Production Deployment ✅ COMPLETE (2026-01-25)
- ✅ Docker containerization (Python 3.11-slim)
- ✅ Railway deployment (https://tesseric-production.up.railway.app)
- ✅ Production CORS configuration
- ✅ AWS environment variables configured
- ✅ Health and review endpoints live
- ⏳ Custom domain setup (api.tesseric.ca)
- ⏳ Frontend deployment to Vercel

### Phase 3: Multi-Cloud Expansion (Future)
- Azure Well-Architected Framework support
- GCP Cloud Architecture Framework support
- n8n workflow analysis
- Provider abstraction layer

### Phase 4: Enhanced Features (Future)
- Review history storage (DynamoDB)
- Image parsing (AWS diagram screenshots)
- Terraform/CloudFormation analysis
- Cost impact modeling
- API authentication

### Phase 5: SaaS Launch (Future)
- Multi-tenant architecture
- User authentication (Cognito)
- Team collaboration features
- Custom knowledge bases
- CLI tool (`tesseric review`)
- Launch at **tesseric.ca**

---

## 💰 Cost Breakdown

### Per Review
- **AI Analysis**: ~$0.011 (Claude 3.5 Haiku)
  - Input tokens: ~7,600 ($0.0076)
  - Output tokens: ~700 ($0.0035)
- **Total**: ~$0.011 per architecture review

### Monthly Infrastructure
- **Railway Hosting**: $5-10/month (Hobby plan)
- **AWS Bedrock**: Pay-per-use (no fixed costs)
- **Total**: ~$5-10/month + $0.011 per review

### Scaling Estimates
- 1,000 reviews/month: $11 AI + $10 hosting = **$21/month**
- 10,000 reviews/month: $110 AI + $10 hosting = **$120/month**
- 100,000 reviews/month: $1,100 AI + hosting = **~$1,100/month**

**Compare**: ChatGPT API (GPT-4) costs ~$0.15/review (14x more expensive)

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

[To be determined]

---

## 🙏 Acknowledgments

- **AWS Well-Architected Framework** team for comprehensive documentation
- **Amazon Bedrock** team for Claude 3.5 Haiku access
- **Anthropic** for Claude AI models
- **FastAPI** and **Next.js** communities
- **Railway** for simple, affordable deployment

---

## 📧 Contact

- **Project Owner**: Arsh Singh
- **Repository**: [github.com/iamarsh/tesseric](https://github.com/iamarsh/tesseric)
- **Issues**: [github.com/iamarsh/tesseric/issues](https://github.com/iamarsh/tesseric/issues)
- **Production API**: [https://tesseric-production.up.railway.app](https://tesseric-production.up.railway.app)

---

**Built with ❤️ for AWS Solutions Architect preparation and real-world architecture reviews**

*"Architecture, piece by piece."* — Tesseric
