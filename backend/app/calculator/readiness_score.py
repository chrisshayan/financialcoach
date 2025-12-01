"""Readiness Score Calculator - Deterministic Truth Layer"""

from typing import Dict, Any


class ReadinessScoreCalculator:
    """
    Calculates overall readiness score (0-100) for homeownership.
    NO LLM, NO HALLUCINATION - Pure deterministic scoring.
    """
    
    def calculate(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate readiness score based on multiple factors.
        
        Scoring factors:
        - DTI (40 points max): Lower is better
        - Credit Score (30 points max): Higher is better
        - Savings/Down Payment (20 points max): More is better
        - Employment Stability (10 points max): Longer is better
        
        Args:
            user_context: User financial data
            
        Returns:
            Dictionary with readiness score and breakdown
        """
        income = user_context.get("income", {})
        savings = user_context.get("savings", {})
        debts = user_context.get("debts", [])
        credit = user_context.get("credit", {})
        
        monthly_income = income.get("monthly_gross", 0)
        credit_score = credit.get("score", 0)
        total_savings = savings.get("total", 0)
        employment_months = income.get("employment_length_months", 0)
        
        # Calculate DTI score (40 points max)
        monthly_debts = sum(debt.get("monthly_payment", 0) for debt in debts)
        dti = (monthly_debts / monthly_income * 100) if monthly_income > 0 else 100
        
        if dti <= 36:
            dti_score = 40
        elif dti <= 43:
            dti_score = 35
        elif dti <= 50:
            dti_score = 25
        elif dti <= 60:
            dti_score = 15
        else:
            dti_score = 5
        
        # Calculate Credit Score (30 points max)
        if credit_score >= 760:
            credit_score_points = 30
        elif credit_score >= 720:
            credit_score_points = 25
        elif credit_score >= 680:
            credit_score_points = 20
        elif credit_score >= 640:
            credit_score_points = 15
        elif credit_score >= 600:
            credit_score_points = 10
        else:
            credit_score_points = 5
        
        # Calculate Savings Score (20 points max)
        # Assuming target down payment of $80k for a $400k home
        target_down_payment = 80000
        savings_ratio = min(total_savings / target_down_payment, 1.0) if target_down_payment > 0 else 0
        savings_score = int(savings_ratio * 20)
        
        # Calculate Employment Stability (10 points max)
        if employment_months >= 24:
            employment_score = 10
        elif employment_months >= 12:
            employment_score = 7
        elif employment_months >= 6:
            employment_score = 5
        else:
            employment_score = 2
        
        # Total score
        total_score = dti_score + credit_score_points + savings_score + employment_score
        
        # Determine readiness level
        if total_score >= 80:
            level = "excellent"
            message = "You're in excellent shape for homeownership!"
        elif total_score >= 65:
            level = "good"
            message = "You're in good shape, with some areas to improve."
        elif total_score >= 50:
            level = "fair"
            message = "You're making progress, but there's work to do."
        else:
            level = "needs_improvement"
            message = "Focus on improving your financial foundation first."
        
        return {
            "readiness_score": total_score,
            "level": level,
            "message": message,
            "breakdown": {
                "dti_score": {
                    "points": dti_score,
                    "max_points": 40,
                    "current_dti": round(dti, 2)
                },
                "credit_score": {
                    "points": credit_score_points,
                    "max_points": 30,
                    "current_score": credit_score
                },
                "savings_score": {
                    "points": savings_score,
                    "max_points": 20,
                    "current_savings": round(total_savings, 2),
                    "target_down_payment": target_down_payment
                },
                "employment_score": {
                    "points": employment_score,
                    "max_points": 10,
                    "employment_months": employment_months
                }
            },
            "recommendations": self._generate_recommendations(
                dti_score, credit_score_points, savings_score, employment_score
            )
        }
    
    def _generate_recommendations(
        self, 
        dti_score: int, 
        credit_score: int, 
        savings_score: int, 
        employment_score: int
    ) -> list:
        """Generate actionable recommendations based on scores."""
        recommendations = []
        
        if dti_score < 30:
            recommendations.append("Focus on reducing your debt-to-income ratio by paying down debts")
        
        if credit_score < 20:
            recommendations.append("Work on improving your credit score through on-time payments")
        
        if savings_score < 15:
            recommendations.append("Increase your savings rate to build a larger down payment")
        
        if employment_score < 7:
            recommendations.append("Build employment history - most lenders prefer 2+ years")
        
        if not recommendations:
            recommendations.append("Keep up the great work! You're on track for homeownership.")
        
        return recommendations

