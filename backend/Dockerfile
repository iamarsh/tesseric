# Backend Dockerfile for Railway Deployment
# Python 3.11+ with FastAPI and Bedrock integration

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (if needed for boto3/cryptography)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will use $PORT env var, but default to 8000)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run uvicorn server
# Railway sets PORT env var, so we use ${PORT:-8000} to default to 8000 locally
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
