"""Transaction Analyzer - Deterministic Truth Layer for Spending Analysis"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from collections import defaultdict


class TransactionAnalyzer:
    """
    Analyzes user transactions to detect overspending and provide peer benchmarking.
    NO LLM, NO HALLUCINATION - Pure deterministic analysis.
    """
    
    # Peer benchmarking thresholds (as % of monthly income)
    # Based on typical spending patterns for first-time home buyers
    PEER_BENCHMARKS = {
        "dining": 0.05,  # 5% of income
        "shopping": 0.08,  # 8% of income
        "entertainment": 0.03,  # 3% of income
        "groceries": 0.10,  # 10% of income
        "utilities": 0.04,  # 4% of income
        "rent": 0.30,  # 30% of income (housing)
    }
    
    def analyze(self, user_context: Dict[str, Any], months: int = 3) -> Dict[str, Any]:
        """
        Analyze transactions for overspending and peer comparison.
        
        Args:
            user_context: User financial data including transactions
            months: Number of months to analyze (default: 3)
            
        Returns:
            Dictionary with spending analysis, overspending alerts, and peer benchmarks
        """
        transactions = user_context.get("transactions", [])
        monthly_income = user_context.get("income", {}).get("monthly_gross", 0)
        
        if not transactions or monthly_income == 0:
            return {
                "error": "Insufficient transaction data or income information",
                "analysis": None
            }
        
        # Find the most recent transaction date to use as reference point
        # This handles mock data that may have historical dates
        transaction_dates = [datetime.strptime(t["date"], "%Y-%m-%d") for t in transactions]
        if not transaction_dates:
            return {
                "error": "No valid transaction dates found",
                "analysis": None
            }
        most_recent_date = max(transaction_dates)
        
        # Filter transactions for the last N months from the most recent transaction
        cutoff_date = most_recent_date - timedelta(days=months * 30)
        recent_transactions = [
            t for t in transactions
            if datetime.strptime(t["date"], "%Y-%m-%d") >= cutoff_date
        ]
        
        # Separate income and expenses
        expenses = [t for t in recent_transactions if t["amount"] < 0]
        income_transactions = [t for t in recent_transactions if t["amount"] > 0]
        
        # Calculate total income for the period
        total_income = sum(t["amount"] for t in income_transactions)
        avg_monthly_income = total_income / months if months > 0 else monthly_income
        
        # Group expenses by category
        category_spending = defaultdict(float)
        category_counts = defaultdict(int)
        
        for expense in expenses:
            category = expense.get("category", "other")
            amount = abs(expense["amount"])
            category_spending[category] += amount
            category_counts[category] += 1
        
        # Calculate monthly averages
        monthly_spending_by_category = {
            cat: spending / months for cat, spending in category_spending.items()
        }
        
        # Calculate total monthly spending
        total_monthly_spending = sum(monthly_spending_by_category.values())
        
        # Identify overspending categories (compared to peer benchmarks)
        overspending_alerts = []
        peer_comparisons = {}
        
        for category, monthly_spend in monthly_spending_by_category.items():
            if category in self.PEER_BENCHMARKS:
                benchmark_pct = self.PEER_BENCHMARKS[category]
                benchmark_amount = avg_monthly_income * benchmark_pct
                peer_avg = benchmark_amount
                
                # Calculate variance
                variance = monthly_spend - benchmark_amount
                variance_pct = (variance / benchmark_amount * 100) if benchmark_amount > 0 else 0
                
                peer_comparisons[category] = {
                    "your_spending": round(monthly_spend, 2),
                    "peer_average": round(peer_avg, 2),
                    "variance": round(variance, 2),
                    "variance_percentage": round(variance_pct, 1),
                    "is_over_budget": monthly_spend > benchmark_amount * 1.2  # 20% over = alert
                }
                
                # Flag if significantly over budget (20%+ over peer average)
                if monthly_spend > benchmark_amount * 1.2:
                    overspending_alerts.append({
                        "category": category,
                        "your_monthly": round(monthly_spend, 2),
                        "peer_average": round(peer_avg, 2),
                        "over_by": round(monthly_spend - peer_avg, 2),
                        "over_by_percentage": round(variance_pct, 1),
                        "potential_savings": round((monthly_spend - benchmark_amount) * 12, 2),  # Annual savings
                        "severity": "high" if variance_pct > 50 else "medium"
                    })
        
        # Calculate savings rate
        savings_rate = ((avg_monthly_income - total_monthly_spending) / avg_monthly_income * 100) if avg_monthly_income > 0 else 0
        
        # Identify top spending categories
        top_categories = sorted(
            monthly_spending_by_category.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            overspending_alerts,
            savings_rate,
            monthly_spending_by_category,
            avg_monthly_income
        )
        
        return {
            "analysis_period_months": months,
            "total_transactions_analyzed": len(recent_transactions),
            "average_monthly_income": round(avg_monthly_income, 2),
            "total_monthly_spending": round(total_monthly_spending, 2),
            "monthly_savings": round(avg_monthly_income - total_monthly_spending, 2),
            "savings_rate_percentage": round(savings_rate, 1),
            "spending_by_category": {
                cat: round(amount, 2) for cat, amount in monthly_spending_by_category.items()
            },
            "top_spending_categories": [
                {"category": cat, "monthly_average": round(amount, 2)}
                for cat, amount in top_categories
            ],
            "peer_comparisons": peer_comparisons,
            "overspending_alerts": overspending_alerts,
            "recommendations": recommendations,
            "summary": self._generate_summary(overspending_alerts, savings_rate, total_monthly_spending, avg_monthly_income)
        }
    
    def _generate_recommendations(
        self,
        overspending_alerts: List[Dict],
        savings_rate: float,
        category_spending: Dict[str, float],
        monthly_income: float
    ) -> List[str]:
        """Generate actionable recommendations based on analysis."""
        recommendations = []
        
        # High priority: Address overspending
        if overspending_alerts:
            high_priority = [a for a in overspending_alerts if a["severity"] == "high"]
            if high_priority:
                top_alert = high_priority[0]
                recommendations.append(
                    f"Reduce {top_alert['category']} spending by ${top_alert['over_by']:.0f}/month "
                    f"to align with peer average. This could save ${top_alert['potential_savings']:.0f}/year."
                )
        
        # Savings rate recommendations
        if savings_rate < 20:
            recommendations.append(
                f"Your current savings rate is {savings_rate:.1f}%. "
                "Aim for 20-30% to accelerate your homeownership goals."
            )
        
        # Category-specific recommendations
        if "dining" in category_spending:
            dining_pct = (category_spending["dining"] / monthly_income * 100) if monthly_income > 0 else 0
            if dining_pct > 8:
                recommendations.append(
                    f"Dining out represents {dining_pct:.1f}% of your income. "
                    "Consider meal prepping or reducing restaurant visits to save more."
                )
        
        if "shopping" in category_spending:
            shopping_pct = (category_spending["shopping"] / monthly_income * 100) if monthly_income > 0 else 0
            if shopping_pct > 10:
                recommendations.append(
                    f"Shopping expenses are {shopping_pct:.1f}% of income. "
                    "Review discretionary purchases and prioritize needs over wants."
                )
        
        return recommendations
    
    def _generate_summary(
        self,
        overspending_alerts: List[Dict],
        savings_rate: float,
        total_spending: float,
        monthly_income: float
    ) -> str:
        """Generate a human-readable summary."""
        if overspending_alerts:
            alert_count = len(overspending_alerts)
            top_category = overspending_alerts[0]["category"]
            return (
                f"Found {alert_count} category{'ies' if alert_count > 1 else ''} where you're spending "
                f"significantly above peer averages, with {top_category} being the highest. "
                f"Your savings rate is {savings_rate:.1f}%, which {'is good' if savings_rate >= 20 else 'could be improved'}."
            )
        else:
            return (
                f"Your spending patterns align well with peer benchmarks. "
                f"Your savings rate is {savings_rate:.1f}%, which is {'excellent' if savings_rate >= 25 else 'good' if savings_rate >= 20 else 'moderate'}."
            )

