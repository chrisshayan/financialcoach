"""Affordability Calculator - Deterministic Truth Layer"""

from typing import Dict, Any


class AffordabilityCalculator:
    """
    Calculates home affordability based on user's financial situation.
    NO LLM, NO HALLUCINATION - Pure deterministic math.
    """
    
    def __init__(self, interest_rate: float = 0.065, loan_term_years: int = 30):
        """
        Initialize calculator with mortgage assumptions.
        
        Args:
            interest_rate: Annual interest rate (default 6.5%)
            loan_term_years: Loan term in years (default 30)
        """
        self.interest_rate = interest_rate
        self.loan_term_years = loan_term_years
        self.monthly_rate = interest_rate / 12
        self.num_payments = loan_term_years * 12
    
    def check_affordability(
        self, 
        home_price: float, 
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Check if a home price is affordable.
        
        Based on:
        - Max DTI: 43% (Fannie Mae guideline)
        - Down payment: 20% (to avoid PMI)
        - Max monthly payment: 28% of gross income (front-end ratio)
        
        Args:
            home_price: Home price in dollars
            user_context: User financial data
            
        Returns:
            Dictionary with affordability analysis
        """
        monthly_income = user_context.get("income", {}).get("monthly_gross", 0)
        debts = user_context.get("debts", [])
        savings = user_context.get("savings", {}).get("total", 0)
        
        if monthly_income == 0:
            return {
                "error": "Monthly income is required for affordability calculation",
                "is_affordable": False
            }
        
        # Calculate required down payment (20%)
        required_down_payment = home_price * 0.20
        
        # Calculate loan amount
        loan_amount = home_price - required_down_payment
        
        # Calculate monthly payment (P&I)
        monthly_pi = self._calculate_monthly_payment(loan_amount)
        
        # Add estimated taxes and insurance (1.2% of home value annually)
        monthly_taxes_insurance = (home_price * 0.012) / 12
        total_monthly_payment = monthly_pi + monthly_taxes_insurance
        
        # Calculate total monthly debt obligations
        monthly_debts = sum(debt.get("monthly_payment", 0) for debt in debts)
        total_monthly_obligations = total_monthly_payment + monthly_debts
        
        # Calculate DTI
        dti = (total_monthly_obligations / monthly_income) * 100
        
        # Calculate front-end ratio (housing costs / income)
        front_end_ratio = (total_monthly_payment / monthly_income) * 100
        
        # Check affordability criteria
        is_affordable = (
            dti <= 43.0 and  # Back-end DTI limit
            front_end_ratio <= 28.0 and  # Front-end ratio limit
            savings >= required_down_payment  # Can afford down payment
        )
        
        # Calculate max affordable home price
        max_monthly_payment = (monthly_income * 0.28) - monthly_debts
        if max_monthly_payment > 0:
            max_loan_amount = self._calculate_max_loan(max_monthly_payment)
            max_home_price = max_loan_amount / 0.80  # Assuming 20% down
        else:
            max_home_price = 0
        
        # Generate reasoning
        reasons = []
        if dti > 43.0:
            reasons.append(f"DTI of {dti:.1f}% exceeds 43% guideline")
        if front_end_ratio > 28.0:
            reasons.append(f"Front-end ratio of {front_end_ratio:.1f}% exceeds 28% guideline")
        if savings < required_down_payment:
            reasons.append(f"Insufficient savings (need ${required_down_payment:,.0f}, have ${savings:,.0f})")
        
        reasoning = "; ".join(reasons) if reasons else "Meets all affordability criteria"
        
        return {
            "home_price": round(home_price, 2),
            "is_affordable": is_affordable,
            "dti": round(dti, 2),
            "front_end_ratio": round(front_end_ratio, 2),
            "monthly_payment": round(total_monthly_payment, 2),
            "monthly_principal_interest": round(monthly_pi, 2),
            "monthly_taxes_insurance": round(monthly_taxes_insurance, 2),
            "required_down_payment": round(required_down_payment, 2),
            "can_afford_down_payment": savings >= required_down_payment,
            "current_savings": round(savings, 2),
            "max_affordable_home_price": round(max_home_price, 2),
            "loan_amount": round(loan_amount, 2),
            "reasoning": reasoning,
            "guidelines": {
                "max_dti": 43.0,
                "max_front_end_ratio": 28.0,
                "down_payment_percent": 20.0
            }
        }
    
    def _calculate_monthly_payment(self, loan_amount: float) -> float:
        """Calculate monthly P&I payment using standard mortgage formula."""
        if loan_amount <= 0:
            return 0
        
        if self.monthly_rate == 0:
            return loan_amount / self.num_payments
        
        # PMT = P * (r(1+r)^n) / ((1+r)^n - 1)
        numerator = self.monthly_rate * ((1 + self.monthly_rate) ** self.num_payments)
        denominator = ((1 + self.monthly_rate) ** self.num_payments) - 1
        return loan_amount * (numerator / denominator)
    
    def _calculate_max_loan(self, max_monthly_payment: float) -> float:
        """Calculate max loan amount given max monthly payment."""
        if max_monthly_payment <= 0:
            return 0
        
        if self.monthly_rate == 0:
            return max_monthly_payment * self.num_payments
        
        # Reverse the PMT formula
        numerator = ((1 + self.monthly_rate) ** self.num_payments) - 1
        denominator = self.monthly_rate * ((1 + self.monthly_rate) ** self.num_payments)
        return max_monthly_payment * (numerator / denominator)

