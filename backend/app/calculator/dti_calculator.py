"""Debt-to-Income (DTI) Calculator - Deterministic Truth Layer"""

from typing import Dict, Any


class DTICalculator:
    """
    Calculates Debt-to-Income ratio.
    NO LLM, NO HALLUCINATION - Pure deterministic math.
    """
    
    def calculate(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate DTI ratio.
        
        Args:
            user_context: User financial data from JSON
            
        Returns:
            Dictionary with DTI calculation results
        """
        monthly_income = user_context.get("income", {}).get("monthly_gross", 0)
        debts = user_context.get("debts", [])
        
        if monthly_income == 0:
            return {
                "error": "Monthly income is required for DTI calculation",
                "dti": None
            }
        
        # Sum all monthly debt payments
        total_monthly_debts = sum(
            debt.get("monthly_payment", 0) for debt in debts
        )
        
        # Calculate DTI (back-end ratio)
        dti = (total_monthly_debts / monthly_income) * 100 if monthly_income > 0 else 0
        
        # Calculate front-end ratio (housing costs only - not applicable here without home)
        front_end_ratio = 0
        
        # Determine status
        if dti <= 36:
            status = "excellent"
            message = "Your DTI is excellent. You're in great shape for homeownership."
        elif dti <= 43:
            status = "good"
            message = "Your DTI is within acceptable limits for most lenders."
        elif dti <= 50:
            status = "fair"
            message = "Your DTI is on the higher side. Consider reducing debt before applying."
        else:
            status = "poor"
            message = "Your DTI is too high. Focus on paying down debt first."
        
        return {
            "dti": round(dti, 2),
            "monthly_income": round(monthly_income, 2),
            "total_monthly_debts": round(total_monthly_debts, 2),
            "front_end_ratio": round(front_end_ratio, 2),
            "status": status,
            "message": message,
            "guideline_max": 43.0,
            "is_within_guidelines": dti <= 43.0,
            "debt_breakdown": [
                {
                    "type": debt.get("type", "unknown"),
                    "monthly_payment": debt.get("monthly_payment", 0),
                    "balance": debt.get("balance", 0)
                }
                for debt in debts
            ]
        }

