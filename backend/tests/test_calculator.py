"""Tests for calculator classes"""

import pytest
from app.calculator.dti_calculator import DTICalculator
from app.calculator.affordability import AffordabilityCalculator
from app.calculator.readiness_score import ReadinessScoreCalculator


@pytest.fixture
def sample_user_context():
    return {
        "income": {
            "monthly_gross": 7500,
            "annual_gross": 90000,
            "employment_length_months": 36
        },
        "savings": {
            "total": 20500
        },
        "debts": [
            {
                "type": "student_loan",
                "balance": 25000,
                "monthly_payment": 350,
                "interest_rate": 5.5
            },
            {
                "type": "auto_loan",
                "balance": 12000,
                "monthly_payment": 450,
                "interest_rate": 4.2
            }
        ],
        "credit": {
            "score": 720
        }
    }


def test_dti_calculator(sample_user_context):
    calc = DTICalculator()
    result = calc.calculate(sample_user_context)
    
    assert "dti" in result
    assert result["dti"] == pytest.approx(10.67, rel=0.1)  # (350+450)/7500 * 100
    assert result["status"] in ["excellent", "good", "fair", "poor"]


def test_affordability_calculator(sample_user_context):
    calc = AffordabilityCalculator()
    result = calc.check_affordability(400000, sample_user_context)
    
    assert "is_affordable" in result
    assert "dti" in result
    assert "monthly_payment" in result
    assert isinstance(result["is_affordable"], bool)


def test_readiness_score_calculator(sample_user_context):
    calc = ReadinessScoreCalculator()
    result = calc.calculate(sample_user_context)
    
    assert "readiness_score" in result
    assert 0 <= result["readiness_score"] <= 100
    assert "level" in result
    assert "breakdown" in result

