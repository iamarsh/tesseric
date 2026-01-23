"""
Tests for architecture review endpoint.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_review_endpoint_success():
    """Test that review endpoint returns 200 with valid request."""
    payload = {
        "design_text": "Single AZ deployment with EC2 instances behind an ALB. "
        "RDS MySQL database in the same AZ. No backups configured.",
        "format": "text",
        "tone": "standard",
    }

    response = client.post("/review", json=payload)
    assert response.status_code == 200


def test_review_response_structure():
    """Test that review response has expected structure."""
    payload = {
        "design_text": "Single AZ deployment with EC2 instances behind an ALB. "
        "RDS MySQL database. No encryption configured.",
        "format": "text",
        "tone": "standard",
    }

    response = client.post("/review", json=payload)
    data = response.json()

    # Check top-level fields
    assert "review_id" in data
    assert "architecture_score" in data
    assert "risks" in data
    assert "summary" in data
    assert "tone" in data
    assert "created_at" in data

    # Check types
    assert isinstance(data["review_id"], str)
    assert isinstance(data["architecture_score"], int)
    assert isinstance(data["risks"], list)
    assert isinstance(data["summary"], str)

    # Check score range
    assert 0 <= data["architecture_score"] <= 100


def test_review_detects_single_az():
    """Test that single AZ pattern is detected."""
    payload = {
        "design_text": "Single AZ deployment with EC2 instances behind an ALB.",
        "format": "text",
        "tone": "standard",
    }

    response = client.post("/review", json=payload)
    data = response.json()

    # Should find at least one risk
    assert len(data["risks"]) > 0

    # Check if single AZ risk is present
    risk_ids = [risk["id"] for risk in data["risks"]]
    assert "REL-001" in risk_ids


def test_review_invalid_request_missing_design_text():
    """Test that missing design_text returns 422."""
    payload = {
        "format": "text",
        "tone": "standard",
    }

    response = client.post("/review", json=payload)
    assert response.status_code == 422


def test_review_invalid_request_design_text_too_short():
    """Test that design_text < 50 chars returns 422."""
    payload = {
        "design_text": "EC2",
        "format": "text",
        "tone": "standard",
    }

    response = client.post("/review", json=payload)
    assert response.status_code == 422


def test_review_tone_standard():
    """Test review with standard tone."""
    payload = {
        "design_text": "Single AZ deployment with EC2 instances behind an ALB.",
        "format": "text",
        "tone": "standard",
    }

    response = client.post("/review", json=payload)
    data = response.json()

    assert data["tone"] == "standard"


def test_review_tone_roast():
    """Test review with roast tone."""
    payload = {
        "design_text": "Single AZ deployment with EC2 instances behind an ALB.",
        "format": "text",
        "tone": "roast",
    }

    response = client.post("/review", json=payload)
    data = response.json()

    assert data["tone"] == "roast"
    # Roast mode summary should have different wording (stub includes "Oof")
    assert "Oof" in data["summary"] or len(data["risks"]) == 0


def test_review_risk_item_structure():
    """Test that each risk has expected fields."""
    payload = {
        "design_text": "Single AZ deployment. No encryption configured. No backups.",
        "format": "text",
        "tone": "standard",
    }

    response = client.post("/review", json=payload)
    data = response.json()

    assert len(data["risks"]) > 0

    for risk in data["risks"]:
        # Check required fields
        assert "id" in risk
        assert "title" in risk
        assert "severity" in risk
        assert "pillar" in risk
        assert "impact" in risk
        assert "finding" in risk
        assert "remediation" in risk
        assert "references" in risk

        # Check severity is valid
        assert risk["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

        # Check pillar is valid
        valid_pillars = [
            "operational_excellence",
            "security",
            "reliability",
            "performance_efficiency",
            "cost_optimization",
            "sustainability",
        ]
        assert risk["pillar"] in valid_pillars
