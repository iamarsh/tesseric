# Tesseric Backend

FastAPI-based backend service for AI-powered AWS architecture review.

## Overview

The Tesseric backend provides a REST API for analyzing AWS architecture descriptions and returning structured, Well-Architected-aligned feedback.

- **v0.1 (Current)**: Stubbed RAG service with pattern detection for local testing
- **v1.0 (Target)**: Real Amazon Bedrock integration with Claude 3 + Knowledge Bases

## Tech Stack

- **Framework**: FastAPI 0.109+
- **Python**: 3.11+
- **Validation**: Pydantic v2
- **AWS SDK**: boto3 (for Phase 1+ Bedrock integration)
- **Server**: uvicorn (ASGI server)
- **Testing**: pytest + pytest-asyncio

## Setup

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

### Installation

```bash
# Install in editable mode
pip install -e .

# Or install specific dependencies
pip install fastapi uvicorn[standard] pydantic pydantic-settings boto3 python-dotenv httpx pytest pytest-asyncio
```

### Configuration

Create a `.env` file in the `backend/` directory (copy from `.env.example` in repo root):

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default  # For local dev only

# Bedrock Configuration (Phase 1+)
BEDROCK_KB_ID=your-knowledge-base-id-here
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Backend Configuration
BACKEND_PORT=8000
LOG_LEVEL=INFO

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**IMPORTANT**: Never commit `.env` files. They are git-ignored for security.

## Running Locally

### Start Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The server will start on http://localhost:8000

**Endpoints**:
- Health check: http://localhost:8000/health
- API docs (Swagger UI): http://localhost:8000/docs
- ReDoc docs: http://localhost:8000/redoc

### Run Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_health.py -v

# Run with coverage
pytest --cov=app --cov-report=html
```

## API Reference

### POST /review

Analyze AWS architecture and return structured feedback.

**Request**:
```json
{
  "design_text": "Single AZ deployment with EC2 instances behind an ALB. RDS MySQL database. No backups configured.",
  "format": "markdown",
  "tone": "standard"
}
```

**Response** (200 OK):
```json
{
  "review_id": "review-550e8400-e29b-41d4-a716-446655440000",
  "architecture_score": 67,
  "risks": [
    {
      "id": "REL-001",
      "title": "Single Availability Zone Deployment",
      "severity": "HIGH",
      "pillar": "reliability",
      "impact": "Service unavailable during AZ failure",
      "likelihood": "MEDIUM",
      "finding": "Architecture uses single AZ",
      "remediation": "Deploy across multiple AZs",
      "references": [
        "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/"
      ]
    }
  ],
  "summary": "Found 3 issues across 2 pillars...",
  "tone": "standard",
  "created_at": "2026-01-21T12:00:00Z"
}
```

**Errors**:
- 422: Validation error (invalid request format)
- 500: Internal server error

### GET /health

Health check endpoint for monitoring.

**Response** (200 OK):
```json
{
  "status": "ok",
  "version": "0.1.0-alpha",
  "service": "Tesseric Backend"
}
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── api/                 # API route handlers
│   │   ├── health.py        # GET /health
│   │   └── review.py        # POST /review
│   ├── core/                # Core configuration
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   └── logging.py       # Logging config (future)
│   ├── models/              # Pydantic models
│   │   ├── request.py       # ReviewRequest
│   │   └── response.py      # ReviewResponse, RiskItem
│   ├── services/            # Business logic
│   │   ├── bedrock.py       # Bedrock client (stubbed for v0.1)
│   │   ├── rag.py           # RAG analysis logic
│   │   ├── storage.py       # Review history (future)
│   │   └── parsing.py       # Text parsing (future)
│   └── utils/               # Utility functions
├── tests/                   # Test suite
│   ├── test_health.py
│   └── test_review.py
├── pyproject.toml           # Dependencies and project metadata
└── README.md                # This file
```

## Development Workflow

1. **Make changes** to code (e.g., add new endpoint in `api/`)
2. **Add tests** in `tests/`
3. **Run tests**: `pytest`
4. **Test manually** via Swagger UI (http://localhost:8000/docs) or curl
5. **Update documentation** if API changes

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AWS_REGION` | AWS region | `us-east-1` | No |
| `AWS_PROFILE` | AWS CLI profile (dev only) | `None` | No |
| `BEDROCK_KB_ID` | Bedrock Knowledge Base ID | `None` | Phase 1+ |
| `BEDROCK_MODEL_ID` | Bedrock model ID | `anthropic.claude-3-sonnet-20240229-v1:0` | No |
| `BACKEND_PORT` | Server port | `8000` | No |
| `LOG_LEVEL` | Logging level | `INFO` | No |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000,http://127.0.0.1:3000` | No |

## Troubleshooting

### Import Errors
If you see `ModuleNotFoundError: No module named 'app'`, make sure you:
1. Installed the package: `pip install -e .`
2. Are running from the `backend/` directory

### Port Already in Use
If port 8000 is already in use:
```bash
# Use a different port
uvicorn app.main:app --reload --port 8080
```

### CORS Errors
If frontend can't connect, check:
1. `CORS_ORIGINS` in `.env` includes frontend URL
2. Frontend is running on correct port (default: 3000)

## Next Steps (Phase 1)

- [ ] Implement real Bedrock client in `services/bedrock.py`
- [ ] Replace stubbed RAG with Bedrock KB retrieval + Claude 3 generation
- [ ] Add prompt engineering for standard vs roast tones
- [ ] Add proper logging (JSON format for CloudWatch)
- [ ] Add retry logic with exponential backoff
- [ ] Add cost tracking for Bedrock API calls

## Contributing

See main repo [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

[To be determined]
