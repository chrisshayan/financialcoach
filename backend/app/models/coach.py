"""Coach Marketplace Models"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
from enum import Enum


class CoachCategory(str, Enum):
    REAL_ESTATE = "real_estate"
    AUTO = "auto"
    CREDIT = "credit"
    MORTGAGE = "mortgage"
    HOME_SERVICES = "home_services"
    INSURANCE = "insurance"


class Coach(BaseModel):
    """Coach definition in the marketplace"""
    id: str
    name: str
    description: str
    category: CoachCategory
    powered_by: str  # e.g., "Zillow.com", "CarMax.com"
    icon: str  # emoji or icon identifier
    required_data: List[str]  # e.g., ["income", "credit_score", "savings"]
    capabilities: List[str]  # What the coach can help with
    api_endpoint: Optional[str] = None  # For future API integration
    is_active: bool = True


class ConsentRequest(BaseModel):
    """User consent for data sharing with a coach"""
    coach_id: str
    data_fields: List[str]
    duration_hours: int  # 24, 72 (3 days), or 168 (7 days)
    user_id: str


class Consent(BaseModel):
    """Active consent record"""
    id: str
    coach_id: str
    user_id: str
    data_fields: List[str]
    granted_at: datetime
    expires_at: datetime
    status: str  # "active", "revoked", "expired"
    audit_log: List[Dict[str, Any]] = []


# Predefined coaches in the marketplace
AVAILABLE_COACHES = [
    Coach(
        id="zillow_coach",
        name="Zillow Coach",
        description="Get personalized property recommendations, neighborhood insights, and home value estimates powered by Zillow's real estate data.",
        category=CoachCategory.REAL_ESTATE,
        powered_by="Zillow.com",
        icon="🏠",
        required_data=["income", "savings", "credit_score", "affordability_range"],
        capabilities=[
            "Property search",
            "Neighborhood analysis",
            "Home value estimates",
            "Market trends",
            "School district info"
        ],
        is_active=True
    ),
    Coach(
        id="carmax_coach",
        name="CarMax Coach",
        description="Find the perfect car within your budget, get pre-approved for auto loans, and explore financing options powered by CarMax.",
        category=CoachCategory.AUTO,
        powered_by="CarMax.com",
        icon="🚗",
        required_data=["income", "credit_score", "monthly_budget"],
        capabilities=[
            "Car search",
            "Auto loan pre-approval",
            "Financing options",
            "Trade-in estimates",
            "Vehicle recommendations"
        ],
        is_active=True
    ),
    Coach(
        id="credit_karma_coach",
        name="Credit Karma Coach",
        description="Understand, monitor, and improve your credit score with personalized recommendations, credit card matches, and credit building strategies powered by Credit Karma.",
        category=CoachCategory.CREDIT,
        powered_by="CreditKarma.com",
        icon="💳",
        required_data=["credit_score", "credit_utilization", "credit_history"],
        capabilities=[
            "Credit score analysis",
            "Credit card recommendations",
            "Credit building strategies",
            "Credit report insights",
            "Debt consolidation advice"
        ],
        is_active=True
    )
]


def get_coach_by_id(coach_id: str) -> Optional[Coach]:
    """Get a coach by ID"""
    return next((c for c in AVAILABLE_COACHES if c.id == coach_id), None)


def get_coaches_by_category(category: CoachCategory) -> List[Coach]:
    """Get all coaches in a category"""
    return [c for c in AVAILABLE_COACHES if c.category == category and c.is_active]


def get_all_coaches() -> List[Coach]:
    """Get all active coaches"""
    return [c for c in AVAILABLE_COACHES if c.is_active]

