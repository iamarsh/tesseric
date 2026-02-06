"""
Unit tests for score calculation logic.
"""

from app.models.response import RiskItem
from app.services.rag import calculate_score


def build_risk(severity: str, suffix: str) -> RiskItem:
    return RiskItem(
        id=f"TEST-{suffix}",
        title="Test Risk",
        severity=severity,
        pillar="security",
        impact="Test impact",
        finding="Test finding",
        remediation="Test remediation",
        references=[],
    )


def test_calculate_score_no_risks():
    assert calculate_score([]) == 100


def test_calculate_score_severity_weights():
    risks = [
        build_risk("CRITICAL", "C"),
        build_risk("HIGH", "H"),
        build_risk("MEDIUM", "M"),
        build_risk("LOW", "L"),
    ]

    assert calculate_score(risks) == 49


def test_calculate_score_floor_at_zero():
    risks = [build_risk("CRITICAL", str(i)) for i in range(10)]
    assert calculate_score(risks) == 0
