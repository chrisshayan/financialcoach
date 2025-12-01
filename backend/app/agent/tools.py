"""LangChain Tools for Financial Calculations"""

from langchain_core.tools import tool
from typing import Dict, Any
import json
from pathlib import Path

from app.calculator.dti_calculator import DTICalculator
from app.calculator.affordability import AffordabilityCalculator
from app.calculator.readiness_score import ReadinessScoreCalculator
from app.calculator.transaction_analyzer import TransactionAnalyzer


def _load_user_context(user_id: str) -> Dict[str, Any]:
    """Load user context from JSON file."""
    try:
        data_path = Path(__file__).parent.parent / "data" / "mock_user_context.json"
        with open(data_path, "r") as f:
            data = json.load(f)
            return data.get(user_id, data.get("user_001", {}))
    except FileNotFoundError:
        return {
            "income": {"monthly_gross": 0},
            "debts": [],
            "savings": {"total": 0}
        }


def get_financial_tools(user_id: str):
    """Create LangChain tools for financial calculations."""
    
    dti_calc = DTICalculator()
    affordability_calc = AffordabilityCalculator()
    readiness_calc = ReadinessScoreCalculator()
    transaction_analyzer = TransactionAnalyzer()
    
    @tool
    def calculate_dti() -> str:
        """Calculate the user's Debt-to-Income ratio. 
        
        Use this when user asks about DTI, debt ratio, or how much debt they have relative to income.
        Returns a JSON string with DTI calculation results.
        """
        user_context = _load_user_context(user_id)
        result = dti_calc.calculate(user_context)
        return json.dumps(result, indent=2)
    
    @tool
    def calculate_affordability(home_price: float) -> str:
        """Check if a home price is affordable based on user's financial situation.
        
        Args:
            home_price: The home price in dollars (e.g., 400000 for $400k)
        
        Use this when user asks 'Can I afford X?', 'Is X affordable?', or similar affordability questions.
        Returns a JSON string with affordability analysis.
        """
        user_context = _load_user_context(user_id)
        result = affordability_calc.check_affordability(home_price, user_context)
        return json.dumps(result, indent=2)
    
    @tool
    def get_readiness_score() -> str:
        """Get the user's overall readiness score (0-100) for homeownership.
        
        Use this when user asks about readiness, how ready they are, or their overall status.
        Returns a JSON string with readiness score and breakdown.
        """
        user_context = _load_user_context(user_id)
        result = readiness_calc.calculate(user_context)
        return json.dumps(result, indent=2)
    
    @tool
    def create_action_plan(goal: str = "homeownership") -> str:
        """Create a personalized action plan to help the user achieve their homeownership goals.
        
        Args:
            goal: The goal to create a plan for (default: "homeownership")
        
        Use this when user asks for a plan, roadmap, steps to take, or "what should I do next?"
        Returns a JSON string with a structured action plan including steps, timeline, and priorities.
        """
        user_context = _load_user_context(user_id)
        readiness_calc = ReadinessScoreCalculator()
        readiness = readiness_calc.calculate(user_context)
        dti_calc = DTICalculator()
        dti_result = dti_calc.calculate(user_context)
        
        # Generate action plan based on readiness score breakdown
        plan = {
            "goal": goal,
            "current_status": {
                "readiness_score": readiness["readiness_score"],
                "level": readiness["level"],
                "dti": dti_result.get("dti", 0)
            },
            "timeline_months": 18,  # Default 18-month plan
            "priority_actions": [],
            "monthly_goals": [],
            "milestones": []
        }
        
        # Add priority actions based on weaknesses
        breakdown = readiness.get("breakdown", {})
        
        if breakdown.get("savings_score", {}).get("points", 20) < 15:
            plan["priority_actions"].append({
                "action": "Increase Monthly Savings",
                "priority": "high",
                "description": f"Current savings: ${user_context.get('savings', {}).get('total', 0):,.0f}. Target: $80,000 down payment.",
                "target": "Save $3,000+ per month",
                "timeline": "6-12 months"
            })
        
        if breakdown.get("dti_score", {}).get("points", 40) < 30:
            plan["priority_actions"].append({
                "action": "Reduce Debt-to-Income Ratio",
                "priority": "high",
                "description": f"Current DTI: {dti_result.get('dti', 0):.1f}%. Target: <36%.",
                "target": "Pay down high-interest debt first",
                "timeline": "3-6 months"
            })
        
        if breakdown.get("credit_score", {}).get("points", 30) < 20:
            plan["priority_actions"].append({
                "action": "Improve Credit Score",
                "priority": "medium",
                "description": f"Current score: {user_context.get('credit', {}).get('score', 0)}. Target: 760+.",
                "target": "Make all payments on time, reduce credit utilization",
                "timeline": "6-12 months"
            })
        
        # Add monthly goals
        monthly_savings = user_context.get("savings", {}).get("monthly_savings_rate", 0)
        target_monthly = 3000
        if monthly_savings < target_monthly:
            plan["monthly_goals"].append({
                "month": "Next 3 months",
                "goal": f"Increase savings rate from ${monthly_savings:,.0f}/month to ${target_monthly:,.0f}/month",
                "actions": [
                    "Review monthly expenses and cut non-essentials",
                    "Set up automatic transfers to savings",
                    "Consider a side income source"
                ]
            })
        
        # Add milestones
        plan["milestones"] = [
            {
                "milestone": "Month 3",
                "target": "DTI below 40%",
                "status": "pending"
            },
            {
                "milestone": "Month 6",
                "target": "$30,000 in savings",
                "status": "pending"
            },
            {
                "milestone": "Month 12",
                "target": "Credit score 740+",
                "status": "pending"
            },
            {
                "milestone": "Month 18",
                "target": "Ready to apply for mortgage",
                "status": "pending"
            }
        ]
        
        return json.dumps(plan, indent=2)
    
    @tool
    def analyze_spending(months: int = 3) -> str:
        """Analyze user's spending patterns, detect overspending, and compare to peer benchmarks.
        
        Args:
            months: Number of months to analyze (default: 3)
        
        Use this when user asks about:
        - Spending habits, where they're overspending
        - Transaction analysis, spending patterns
        - Peer comparison, how they compare to others
        - Budget analysis, expense breakdown
        - "Am I spending too much on X?"
        
        Returns a JSON string with spending analysis, overspending alerts, and peer benchmarks.
        """
        user_context = _load_user_context(user_id)
        result = transaction_analyzer.analyze(user_context, months=months)
        return json.dumps(result, indent=2)
    
    return [calculate_dti, calculate_affordability, get_readiness_score, create_action_plan, analyze_spending]
