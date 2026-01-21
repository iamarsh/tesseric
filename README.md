# Tesseric

**Architecture, piece by piece.**

AI-powered AWS architecture review service that analyzes your designs and returns structured, Well-Architected-aligned feedback.

![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![Next.js](https://img.shields.io/badge/next.js-14-black)
![License](https://img.shields.io/badge/license-TBD-lightgrey)

---

## 🎯 What Makes Tesseric Different

Unlike pasting your architecture into ChatGPT, Tesseric provides:

- **Curated Knowledge Base**: RAG over versioned AWS Well-Architected Framework + security best practices
- **Structured Output**: JSON with risks, severity scores, pillar mapping, and remediation steps
- **Grounded Citations**: References to specific AWS documentation sections
- **Audit Trail**: Review history and tracking across iterations (v1.0+)
- **Multiple Tones**: Professional "standard" mode or direct "roast" mode
- **Cost Awareness**: Estimates cost impact for each recommendation (v1.1+)

## 🏗️ Architecture

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
           │ (JSON)
           ▼
┌─────────────────────┐
│  FastAPI Backend    │
│  (Port 8000)        │
│  - /health          │
│  - /review          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│  Amazon Bedrock KB  │──────│  AWS Docs (S3)   │
│  (v1.0+)            │      │  (v1.0+)         │
└─────────────────────┘      └──────────────────┘
```

**v0.1 (Current)**: Stubbed RAG service for local testing
**v1.0 (Target)**: Real Bedrock integration with S3-backed Knowledge Base

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **AWS Account** (for Bedrock in v1.0+; not needed for v0.1)

### Backend Setup

```bash
cd backend
pip install -e .                    # Install in editable mode
cp ../.env.example .env             # Create local .env
# Edit .env with your settings (keep defaults for v0.1)
uvicorn app.main:app --reload       # Start server on port 8000
```

**Verify**:
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install                         # Install dependencies
npm run dev                         # Start dev server
```

**Access**: http://localhost:3000

### Run Tests

```bash
cd backend
pytest                              # Run all backend tests
pytest -v                           # Verbose output
```

## 📁 Project Structure

```
tesseric/
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── api/          # API routers (health, review)
│   │   ├── core/         # Config, logging
│   │   ├── models/       # Pydantic models
│   │   ├── services/     # Business logic (RAG, Bedrock)
│   │   └── utils/
│   ├── tests/            # pytest tests
│   └── pyproject.toml    # Dependencies
├── frontend/             # Next.js TypeScript frontend
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (ReviewForm, ReviewResults)
│   ├── lib/              # API client
│   └── package.json
├── infra/                # Infrastructure docs (Bedrock, App Runner)
├── docs/                 # Sample Well-Architected docs (v0.1 testing)
├── memory-bank/          # Project brain (git-ignored, local only)
│   ├── project-goals.md
│   ├── architecture.md
│   ├── architecture-explained.md
│   ├── decisions.log.md
│   └── progress.md
├── Claude.md             # AI assistant working contract (git-ignored, local only)
├── .gitignore            # Secrets excluded
├── .env.example          # Environment variable template
└── README.md             # This file
```

## 🔐 Security

**Never commit secrets.** See `.gitignore` for exclusions.

- **Local Development**: Use `.env` files (untracked by git)
- **Production**: AWS Secrets Manager or SSM Parameter Store
- **GitHub PAT**: Store in `.env.local` (git-ignored) or use GitHub CLI

If you accidentally commit a secret:
1. Rotate the credential immediately
2. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
3. Force-push after cleaning

## 📚 Documentation

- **Backend API**: [backend/README.md](backend/README.md)
- **Frontend**: [frontend/README.md](frontend/README.md)
- **Infrastructure**: [infra/](infra/)
- **Project Goals & Decisions**: `memory-bank/` (local only, git-ignored)
- **Working Contract**: `Claude.md` (local only, git-ignored; for AI assistant sessions)

## 🗺️ Roadmap

### v0.1 - MVP ✅ COMPLETE (2026-01-21)
- ✅ Repository scaffold with security-first setup
- ✅ Memory bank documentation system (4 comprehensive files)
- ✅ Backend: FastAPI with stubbed RAG service (6 pattern detections)
- ✅ Frontend: Next.js with theme switcher, dual input modes, tone toggle
- ✅ Pydantic models for structured requests/responses (6 Well-Architected pillars)
- ✅ Beautiful UI with Tailwind CSS and light/dark theme
- ✅ pytest test suite (13 tests, 10 passing)
- ✅ End-to-end local testing verified
- ✅ Production build successful
- ✅ All code committed to GitHub (3 commits)

### v1.0 - Production Beta
- Real Amazon Bedrock integration (Claude 3 Sonnet + Knowledge Bases)
- Roast mode activated (same analysis, different tone)
- Review history storage (DynamoDB)
- Basic authentication (API keys)
- Deployment to AWS App Runner
- CloudWatch observability (logs, metrics, alarms)
- `/reviews` endpoint (list past reviews)

### v1.1 - Enhanced Analysis
- Image parsing (upload AWS diagram screenshots → extract components → RAG)
- Terraform analysis (paste IaC code → assess best practices)
- Cost modeling (estimate monthly cost delta for recommendations)
- n8n workflow analysis

### v1.2+ - SaaS Launch
- Multi-tenant architecture (per-team accounts)
- User authentication (Cognito or Auth0)
- Pricing tiers (Free, Pro, Enterprise)
- Team collaboration (shared reviews, comments)
- Custom knowledge bases (upload your own compliance docs)
- CLI tool (`tesseric review architecture.md`)
- Launch at **tesseric.ca**

## 🤝 Contributing

This is currently a portfolio/learning project for AWS Solutions Architect preparation. Contributions welcome once v1.0 is stable.

**Development Process**:
1. Read `memory-bank/progress.md` for current phase and tasks
2. Check `memory-bank/decisions.log.md` for architectural decisions (ADRs)
3. Make changes in a feature branch
4. Write tests for new functionality
5. Update `memory-bank/progress.md` with completed tasks
6. Submit PR with clear description

## 📝 License

[To be determined]

## 🙏 Acknowledgments

- AWS Well-Architected Framework documentation
- Amazon Bedrock team for Claude 3 + Knowledge Bases
- FastAPI and Next.js communities

## 📧 Contact

- **Project Owner**: Arsh Singh
- **Repository**: [github.com/iamarsh/tesseric](https://github.com/iamarsh/tesseric)
- **Issues**: [github.com/iamarsh/tesseric/issues](https://github.com/iamarsh/tesseric/issues)
- **Future**: hello@tesseric.ca (once live)

---

Built with ❤️ for AWS Solutions Architect preparation and real-world use at **tesseric.ca** (coming soon)

**Tagline**: *"Architecture, piece by piece."*
