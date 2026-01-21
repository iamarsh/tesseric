"""
Tests for health check endpoint.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_success():
    """Test that health check returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_check_structure():
    """Test that health check returns expected structure."""
    response = client.get("/health")
    data = response.json()

    assert "status" in data
    assert "version" in data
    assert "service" in data

    assert data["status"] == "ok"
    assert data["version"] == "0.1.0-alpha"
    assert "Tesseric" in data["service"]


def test_health_check_method_not_allowed():
    """Test that POST to /health returns 405."""
    response = client.post("/health")
    assert response.status_code == 405
