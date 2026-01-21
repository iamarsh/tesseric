# Claude Working Contract - Tesseric

**Last Updated**: 2026-01-21

## Project Overview

**Tesseric** - AI-powered AWS architecture review service
- **Live at**: tesseric.ca (future)
- **Repository**: github.com/iamarsh/tesseric
- **Tagline**: "Architecture, piece by piece."
- **Purpose**: Analyze AWS architectures and return structured, Well-Architected-aligned feedback

## Core Rules (READ EVERY SESSION)

### 1. Security First (NON-NEGOTIABLE)

- **NEVER commit secrets** (.env, credentials, tokens, API keys)
- **NEVER print secrets** in logs or comments
- **NEVER echo real PAT/keys** in code
- Always check `.gitignore` includes: `.env`, `.env.local`, `memory-bank/`, `*.pem`, `secrets/`
- Use env vars with placeholders only (real values in local `.env` or AWS Secrets Manager)

### 2. Memory Bank System

- **Always read `memory-bank/` docs first** before making changes (local, git-ignored)
- **Files**:
  - `project-goals.md` - Vision, roadmap, differentiators
  - `architecture.md` - System design, data models, AWS components
  - `decisions.log.md` - ADRs (Architectural Decision Records)
  - `progress.md` - Phase-based task tracking
- **Update `progress.md` after every session** (mark completed tasks with `[x]` and date)
- **When making architectural changes**, check `decisions.log.md` first for prior decisions
- **Add new ADRs** to `decisions.log.md` when making significant decisions (use template in file)

### 3. Code Quality

- Prefer small, PR-sized changes with clear descriptions
- Follow existing patterns in the codebase
- Write tests for new endpoints/features (pytest for backend)
- Keep services modular and testable
- Document TODOs for future phases (e.g., "TODO(Phase 1): Replace with real Bedrock call")

### 4. AWS Alignment

- Follow Well-Architected Framework principles in our own code
- Consider cost optimization (we're on limited AWS credits)
- Use IAM roles, not access keys
- Plan for observability (CloudWatch logs/metrics)
- Document infrastructure decisions in `decisions.log.md`

## How to Run Locally

### Backend (FastAPI + Python 3.11+)

```bash
cd backend
pip install -e .                    # Install in editable mode
cp ../.env.example .env             # Create local .env (NEVER commit this!)
# Edit .env with your AWS credentials (if testing real Bedrock in Phase 1+)
uvicorn app.main:app --reload --port 8000
```

Access:
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Frontend (Next.js 14 + TypeScript + Tailwind CSS)

```bash
cd frontend
npm install                         # Install dependencies
npm run dev                         # Start dev server
```

Access:
- Frontend: http://localhost:3000

### Tests

```bash
cd backend
pytest                              # Run all tests
pytest tests/test_health.py -v     # Run specific test with verbose output
```

## How to Update Documentation

### After Each Coding Session

1. **Read** `memory-bank/progress.md` to see current state
2. **Mark completed tasks** with `[x]` and add date (e.g., `[x] Create .gitignore - 2026-01-21`)
3. **Add new tasks** discovered during work to appropriate phase
4. **Update `decisions.log.md`** if architectural decisions were made
5. **Update `architecture.md`** if system design changed (e.g., new endpoints, data models)

### Adding an ADR (Architectural Decision Record)

Create new entry in `memory-bank/decisions.log.md`:

```markdown
## ADR-XXX – [Title]
**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-YYY
**Decision**: What we decided
**Rationale**: Why we decided it
**Consequences**: What this means for the codebase/operations
**Alternatives Considered**: What we didn't choose and why
```

## Project Phases

- **Phase 0**: Bootstrap (repo structure, memory bank, security) ← **CURRENT** (v0.1)
- **Phase 1**: Backend RAG (real Bedrock integration with Knowledge Bases)
- **Phase 2**: Frontend polish + Roast mode activation
- **Phase 3**: Image parsing, Terraform analysis
- **Phase 4**: Deployment (AWS App Runner), monitoring, production readiness
- **Phase 5**: Multi-tenant SaaS (tesseric.ca launch)

## Tech Stack Reference

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Validation**: Pydantic v2 for request/response models
- **AWS SDK**: boto3 for Bedrock, S3, DynamoDB
- **Server**: uvicorn (ASGI server)
- **Testing**: pytest, pytest-asyncio

### Frontend
- **Framework**: Next.js 14 (App Router, not Pages Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Runtime**: React 18
- **HTTP**: Fetch API for backend calls

### AWS Services (v1.0+)
- **AI/ML**: Amazon Bedrock (Claude 3 Sonnet + Knowledge Bases)
- **Storage**: S3 (knowledge base docs), DynamoDB (review history)
- **Compute**: AWS App Runner or ECS Fargate
- **Observability**: CloudWatch (logs, metrics, alarms)
- **Secrets**: AWS Secrets Manager or SSM Parameter Store

## Common Tasks

### Add a New API Endpoint

1. Create router in `backend/app/api/` (e.g., `new_feature.py`)
2. Add Pydantic models in `backend/app/models/` if needed
3. Implement service logic in `backend/app/services/`
4. Include router in `backend/app/main.py`:
   ```python
   from app.api import new_feature
   app.include_router(new_feature.router)
   ```
5. Write tests in `backend/tests/test_new_feature.py`
6. Update OpenAPI docs (auto-generated by FastAPI at `/docs`)

### Deploy to AWS (Phase 4+)

1. Review `infra/app-runner.md` for deployment guide
2. Build Docker image: `docker build -t tesseric-backend ./backend`
3. Push to ECR: `docker push <ecr-repo-url>`
4. Deploy via App Runner console or AWS CLI
5. Configure environment variables in App Runner (from .env)
6. Set up CloudWatch alarms for 5xx errors, latency

### Run Backend with Docker (Optional)

```bash
cd backend
docker build -t tesseric-backend .
docker run -p 8000:8000 --env-file .env tesseric-backend
```

## Session Workflow (Recommended)

1. **Start**: Read `memory-bank/progress.md` to see current phase and tasks
2. **Plan**: Check relevant `memory-bank/*.md` docs for context (goals, architecture, decisions)
3. **Code**: Make focused changes, test locally (pytest + manual testing)
4. **Test**: Run `pytest` and manual tests via curl/browser
5. **Document**:
   - Update `progress.md` (mark tasks complete)
   - Update `decisions.log.md` if architectural decisions were made
   - Update `architecture.md` if system design changed
6. **Commit**: Clear commit messages, **never commit secrets**

## Questions to Check Before Asking

- **Project vision/scope**: Check `memory-bank/project-goals.md`
- **System design**: Check `memory-bank/architecture.md`
- **Past decisions**: Check `memory-bank/decisions.log.md`
- **Current status**: Check `memory-bank/progress.md`

## Common Pitfalls to Avoid

1. **Committing secrets**: Always verify `git status` doesn't show `.env` or `memory-bank/`
2. **Ignoring memory bank**: Decisions may have been made in prior sessions; check ADRs first
3. **Skipping tests**: All new endpoints need pytest tests
4. **Overengineering**: v0.1 is MVP; don't add features not in scope
5. **Forgetting progress updates**: Update `progress.md` every session so future sessions know where we are

## Useful Commands

```bash
# Backend
cd backend && pytest                          # Run all tests
cd backend && pytest -v -s                    # Verbose with print statements
cd backend && uvicorn app.main:app --reload  # Start dev server

# Frontend
cd frontend && npm run dev                    # Start dev server
cd frontend && npm run build                  # Production build
cd frontend && npm run lint                   # Lint TypeScript

# Git
git status                                    # Verify no secrets
git log --oneline -10                         # Recent commits
git diff                                      # See unstaged changes

# AWS (Phase 1+)
aws bedrock-agent list-knowledge-bases        # List Bedrock KBs
aws s3 ls s3://tesseric-kb-dev-us-east-1/     # List S3 docs
```

## Environment Variables Reference

### Backend (.env)
```bash
AWS_REGION=us-east-1
AWS_PROFILE=default                           # Dev only (use IAM roles in prod)
BEDROCK_KB_ID=your-kb-id-here                 # Phase 1+
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BACKEND_PORT=8000
LOG_LEVEL=INFO
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000     # Dev
# NEXT_PUBLIC_API_URL=https://api.tesseric.ca # Prod
```

## ADR Quick Reference

See `memory-bank/decisions.log.md` for full ADRs. Key decisions:

- **ADR-001**: Bedrock vs external LLMs → Bedrock (AWS native)
- **ADR-002**: Bedrock KB vs custom vector store → Bedrock KB (managed)
- **ADR-003**: App Runner vs ECS vs Lambda → App Runner (v0.1), re-evaluate for v1.0
- **ADR-004**: DynamoDB vs Postgres → DynamoDB (v1.0), SQLite (v0.1)
- **ADR-005**: Tone modes → Same analysis, different prompts
- **ADR-006**: Python 3.11+ minimum
- **ADR-007**: Tailwind CSS for frontend
- **ADR-008**: Include sample Well-Architected docs
- **ADR-009**: Keep .env.local for local git ops

## Contact & Feedback

- **GitHub Issues**: github.com/iamarsh/tesseric/issues
- **Project Owner**: Arsh Singh

---

**Remember**: This is a portfolio piece AND a learning tool for AWS SAA. Every decision should consider: security, cost, Well-Architected alignment, and production readiness.

**Before ending any session**: Update `memory-bank/progress.md` with completed tasks!
