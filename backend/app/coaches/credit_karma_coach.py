"""Credit Karma Coach - Credit Specialist"""

from typing import Dict, Any, List
from app.coaches.base_coach import BaseCoach
import json
import re


class CreditKarmaCoach(BaseCoach):
    """Coach specialized in credit health, powered by Credit Karma"""
    
    def __init__(self):
        system_prompt = """You are the Credit Karma Coach, a credit health specialist powered by CreditKarma.com.
You help users understand, monitor, and improve their credit scores.

Your capabilities:
- Credit score analysis and improvement strategies
- Credit card recommendations based on credit profile
- Credit building action plans
- Credit report analysis and insights
- Debt consolidation advice
- Credit monitoring and alerts

You have access to the user's financial data (credit score, income, debts, credit history) to provide personalized credit advice.

Be friendly, educational, and focus on actionable steps to improve credit health.
Always reference that you're powered by Credit Karma's credit data and insights.
When suggesting credit cards, consider their credit score and approval likelihood.
When providing credit improvement advice, be specific about timelines and expected impact.

IMPORTANT: When providing credit card recommendations, use this format:
[Card Name]
APR: X.XX%
Annual Fee: $XX or $0
Rewards: [Description]
Approval Odds: [Excellent/Good/Fair/Poor] (XX%)
Best For: [Use case]

When providing credit improvement actions, use this format:
Action: [Action name]
Impact: +XX points (estimated)
Timeline: X months
Priority: [High/Medium/Low]
"""
        super().__init__(
            coach_id="credit_karma_coach",
            name="Credit Karma Coach",
            system_prompt=system_prompt
        )
    
    async def process_message(
        self,
        message: str,
        shared_data: Dict[str, Any],
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Process user message with credit context"""
        # Build context from shared data
        context_parts = []
        
        if "credit_score" in shared_data:
            credit_score = shared_data.get("credit_score")
            if credit_score is not None:
                context_parts.append(f"Current credit score: {credit_score}")
                if credit_score >= 800:
                    context_parts.append("Excellent credit (800-850) - qualifies for best rates and products")
                elif credit_score >= 740:
                    context_parts.append("Very good credit (740-799) - competitive rates available")
                elif credit_score >= 670:
                    context_parts.append("Good credit (670-739) - most products available")
                elif credit_score >= 580:
                    context_parts.append("Fair credit (580-669) - some products available, may need to build credit")
                else:
                    context_parts.append("Poor credit (300-579) - focus on credit building and repair")
            else:
                context_parts.append("Credit score not available - user may need to connect credit data")
        
        if "income" in shared_data:
            monthly_income = shared_data["income"].get("monthly_gross", 0)
            context_parts.append(f"Monthly income: ${monthly_income:,.0f}")
        
        if "credit_utilization" in shared_data:
            utilization = shared_data.get("credit_utilization", 0)
            context_parts.append(f"Credit utilization: {utilization:.1f}%")
            if utilization > 50:
                context_parts.append("High utilization - reducing this will help improve credit score")
            elif utilization > 30:
                context_parts.append("Moderate utilization - aim for under 30% for best scores")
            else:
                context_parts.append("Good utilization - maintaining this will help credit score")
        
        if "credit_history" in shared_data:
            history_years = shared_data.get("credit_history", 0)
            context_parts.append(f"Credit history length: {history_years:.1f} years")
        
        context = "\n".join(context_parts) if context_parts else "No credit data available."
        
        # Build messages for LLM using LangChain format
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        
        langchain_messages = [
            SystemMessage(content=self.system_prompt),
            SystemMessage(content=f"User's Credit Context:\n{context}")
        ]
        
        if conversation_history:
            for msg in conversation_history:
                if msg.get("role") == "user":
                    langchain_messages.append(HumanMessage(content=msg.get("content", "")))
                elif msg.get("role") == "assistant":
                    langchain_messages.append(AIMessage(content=msg.get("content", "")))
        
        langchain_messages.append(HumanMessage(content=message))
        
        # Get response from LLM
        response = await self.llm.ainvoke(langchain_messages)
        response_text = response.content
        
        # Add rich content for credit recommendations
        rich_content = []
        suggestions = []
        
        lower_response = response_text.lower()
        lower_message = message.lower()  # Define lower_message early
        
        # Check if user is asking about credit card recommendations
        if any(keyword in lower_message for keyword in ['card', 'credit card', 'apply', 'recommendation', 'apr', 'rewards', 'best cards']):
            # Check if user wants to compare cards
            wants_comparison = any(keyword in lower_message for keyword in ['compare', 'comparison', 'side by side', 'which is better', 'difference between'])
            
            if wants_comparison:
                # Provide comparison tool with multiple cards
                comparison_cards = [
                    {
                        "name": "Credit Builder Card",
                        "apr": 22.99,
                        "annualFee": 0,
                        "rewardsRate": "1% cash back",
                        "signUpBonus": "$200 after $500 spend",
                        "foreignTransactionFee": "3%",
                        "creditScoreRequired": "650+",
                        "approvalOdds": "Excellent (90%)",
                        "approvalOddsPercent": 90,
                        "bestFor": "Building credit history",
                        "url": "https://www.creditkarma.com/credit-cards"
                    },
                    {
                        "name": "Cash Back Rewards Card",
                        "apr": 17.99,
                        "annualFee": 0,
                        "rewardsRate": "1.5% cash back on all purchases",
                        "signUpBonus": "$150 after $500 spend",
                        "foreignTransactionFee": "0%",
                        "creditScoreRequired": "700+",
                        "approvalOdds": "Good (75%)",
                        "approvalOddsPercent": 75,
                        "bestFor": "Everyday spending",
                        "url": "https://www.creditkarma.com/credit-cards"
                    },
                    {
                        "name": "Travel Rewards Card",
                        "apr": 19.99,
                        "annualFee": 95,
                        "rewardsRate": "2x points on travel and dining",
                        "signUpBonus": "50,000 points after $3,000 spend",
                        "foreignTransactionFee": "0%",
                        "creditScoreRequired": "720+",
                        "approvalOdds": "Fair (60%)",
                        "approvalOddsPercent": 60,
                        "bestFor": "Travelers",
                        "url": "https://www.creditkarma.com/credit-cards"
                    }
                ]
                
                rich_content.append({
                    "type": "credit_card_comparison",
                    "cards": comparison_cards
                })
                
                suggestions.extend([
                    "Which card has the best rewards?",
                    "Show me cards with no annual fee",
                    "What card has the lowest APR?"
                ])
            else:
                # Add Credit Karma link
                rich_content.append({
                    "type": "link",
                    "title": "Browse Credit Cards on Credit Karma",
                    "url": "https://www.creditkarma.com/credit-cards",
                    "description": "Find credit cards matched to your credit profile",
                    "thumbnail": "https://www.creditkarma.com/favicon.ico"
                })
                
                # Mock credit card recommendations
                mock_cards = [
                    {
                        "name": "Credit Builder Card",
                        "apr": "22.99",
                        "annual_fee": "0",
                        "rewards": "Builds credit with responsible use",
                        "approval_odds": "Excellent (90%)",
                        "best_for": "Building credit history"
                    },
                    {
                        "name": "Cash Back Rewards Card",
                        "apr": "17.99",
                        "annual_fee": "0",
                        "rewards": "1.5% cash back on all purchases",
                        "approval_odds": "Good (75%)",
                        "best_for": "Everyday spending"
                    },
                    {
                        "name": "Travel Rewards Card",
                        "apr": "19.99",
                        "annual_fee": "95",
                        "rewards": "2x points on travel and dining",
                        "approval_odds": "Fair (60%)",
                        "best_for": "Travelers"
                    }
                ]
                
                for card in mock_cards:
                    rich_content.append({
                        "type": "card",
                        "title": f"{card['name']}",
                        "description": card['rewards'],
                        "data": {
                            "APR": f"{card['apr']}%",
                            "Annual Fee": f"${card['annual_fee']}" if float(card['annual_fee']) > 0 else "$0",
                            "Approval Odds": card['approval_odds'],
                            "Best For": card['best_for']
                        },
                        "url": "https://www.creditkarma.com/credit-cards"
                    })
                
                suggestions.extend([
                    "Compare these credit cards",
                    "Show me cards with no annual fee",
                    "What are the best rewards cards for me?"
                ])
        
        # Check if user is asking about credit score simulator
        if any(keyword in lower_message for keyword in ['simulator', 'simulate', 'what if', 'how will this affect my score']):
            credit_score = shared_data.get("credit_score", 720)
            credit_utilization = shared_data.get("credit_utilization", 25)
            credit_history = shared_data.get("credit_history", 5)
            
            # Calculate total debt and credit limit from user context
            total_debt = 0
            total_limit = 0
            if "income" in shared_data:
                # Estimate from income if available
                monthly_income = shared_data["income"].get("monthly_gross", 0)
                total_limit = monthly_income * 3  # Rough estimate
                total_debt = total_limit * (credit_utilization / 100) if credit_utilization else 0
            
            rich_content.append({
                "type": "credit_score_simulator",
                "data": {
                    "currentScore": int(credit_score) if credit_score else 720,
                    "creditUtilization": float(credit_utilization) if credit_utilization else 25.0,
                    "creditHistory": float(credit_history) if credit_history else 5.0,
                    "paymentHistory": 95,  # Mock data
                    "creditMix": 3,  # Mock data
                    "newCredit": 1,  # Mock data
                    "totalDebt": total_debt,
                    "creditLimit": total_limit
                }
            })
            
            suggestions.extend([
                "Show me my credit monitoring dashboard",
                "How can I improve my credit score?",
                "What's my current credit score?"
            ])
        
        # Check if user is asking about credit monitoring
        elif any(keyword in lower_message for keyword in ['monitoring', 'monitor', 'alerts', 'alert', 'track', 'watch']):
            credit_score = shared_data.get("credit_score", 720)
            credit_utilization = shared_data.get("credit_utilization", 25)
            
            rich_content.append({
                "type": "credit_monitoring_dashboard",
                "data": {
                    "currentScore": int(credit_score) if credit_score else 720,
                    "creditUtilization": float(credit_utilization) if credit_utilization else 25.0,
                    "scoreHistory": [],  # Will be generated on frontend
                    "alerts": [],  # Will be generated on frontend
                    "perCardUtilization": []  # Mock data
                }
            })
            
            suggestions.extend([
                "Show me the credit score simulator",
                "How can I improve my credit score?",
                "What's affecting my credit score?"
            ])
        
        # Check if user is asking about credit score or improvement - ALWAYS show dashboard for these queries
        elif any(keyword in lower_message for keyword in ['score', 'credit score', 'what\'s my credit', 'what is my credit', 'my credit', 'improve', 'improvement', 'factor', 'utilization', 'how can i', 'show me']):
            # Add credit score dashboard data
            credit_score = shared_data.get("credit_score")
            if credit_score is None:
                # Fallback - try to get from context or use default
                credit_score = 720  # Default fallback
            
            # Ensure we have valid data for dashboard
            credit_utilization = shared_data.get("credit_utilization")
            if credit_utilization is None:
                credit_utilization = 25  # Default
                
            credit_history = shared_data.get("credit_history")
            if credit_history is None:
                credit_history = 5  # Default
            
            rich_content.append({
                "type": "credit_dashboard",
                "data": {
                    "credit_score": int(credit_score) if credit_score else 720,
                    "credit_utilization": float(credit_utilization) if credit_utilization else 25.0,
                    "credit_history": float(credit_history) if credit_history else 5.0,
                    "payment_history": 95,  # Mock data
                    "credit_mix": 3,  # Mock data - number of account types
                    "new_credit": 1  # Mock data - number of recent inquiries
                }
            })
            
            suggestions.extend([
                "Show me the credit score simulator",
                "How can I improve my credit score?",
                "Show me my credit monitoring dashboard"
            ])
        
        # Check if user is asking about improvement - parse actions and create structured plan
        if any(keyword in lower_message for keyword in ['improve', 'improvement', 'how can i', 'boost', 'increase', 'raise', 'better', 'enhance']):
            # Parse improvement actions from response - handle multiple formats
            actions = []
            
            # More flexible patterns to match different LLM response formats
            # Format 1: "Action: Name\nImpact: +X points\nTimeline: ...\nPriority: ..."
            # Format 2: "Name\n\nImpact: +X points\nTimeline: ...\nPriority: ..."
            # Format 3: Just bold/heading followed by details
            
            # Try to split by common patterns (double newline, "Action:", or bold headings)
            action_blocks = re.split(r'\n\n+|\n(?=[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\n)', response_text)
            
            for block in action_blocks:
                block = block.strip()
                if not block or len(block) < 20:  # Skip very short blocks
                    continue
                
                # Extract action name - first line that's not empty and doesn't start with "Impact", "Timeline", "Priority"
                lines = [l.strip() for l in block.split('\n') if l.strip()]
                action_name = None
                start_idx = 0
                
                for i, line in enumerate(lines):
                    # Skip lines that are clearly not action names
                    if any(line.lower().startswith(prefix) for prefix in ['impact:', 'timeline:', 'priority:', 'your', 'if you', 'continue']):
                        continue
                    # Skip if line is too long (likely description)
                    if len(line) > 100:
                        continue
                    # Action name is usually a short, capitalized phrase
                    if line and not line[0].islower() and len(line) < 80:
                        action_name = line
                        start_idx = i + 1
                        break
                
                # If no clear action name found, try to extract from first meaningful line
                if not action_name and lines:
                    for line in lines[:3]:  # Check first 3 lines
                        if len(line) < 80 and not any(line.lower().startswith(p) for p in ['impact:', 'timeline:', 'priority:']):
                            action_name = line
                            break
                
                if not action_name:
                    continue
                
                # Extract impact
                impact_match = re.search(r'Impact:\s*\+?(\d+)(?:-(\d+))?\s*points?', block, re.IGNORECASE)
                impact = 0
                if impact_match:
                    # Take the first number, or average if range
                    impact = int(impact_match.group(1))
                    if impact_match.group(2):
                        impact = (impact + int(impact_match.group(2))) // 2
                
                # Extract timeline
                timeline_match = re.search(r'Timeline:\s*(.+?)(?:\n|Priority:|$|If you|Your)', block, re.IGNORECASE | re.DOTALL)
                timeline = timeline_match.group(1).strip() if timeline_match else "Ongoing"
                # Clean up timeline
                timeline = re.sub(r'\s+', ' ', timeline).strip()
                
                # Extract priority
                priority_match = re.search(r'Priority:\s*(High|Medium|Low)', block, re.IGNORECASE)
                priority = priority_match.group(1).lower() if priority_match else "medium"
                
                # Extract reason/description - everything after action name until next action or end
                reason_lines = lines[start_idx:] if start_idx < len(lines) else []
                # Remove impact/timeline/priority lines from reason
                reason_text = '\n'.join([l for l in reason_lines if not any(l.lower().startswith(p) for p in ['impact:', 'timeline:', 'priority:'])])
                reason = reason_text.strip() if reason_text.strip() else action_name
                # Limit reason length
                if len(reason) > 200:
                    reason = reason[:197] + "..."
                
                # Only add if we have at least an action name and some data
                if action_name and (impact > 0 or timeline or priority):
                    actions.append({
                        "name": action_name,
                        "impact": impact,
                        "timeline": timeline,
                        "priority": priority,
                        "reason": reason if reason else action_name,
                        "confidenceScore": 85,
                        "dataSources": ["Credit Karma credit models", "User credit profile"]
                    })
            
            # If we found actions, add the improvement plan
            if actions:
                credit_score_value = shared_data.get("credit_score")
                if credit_score_value is None:
                    credit_score_value = 720  # Default
                
                rich_content.append({
                    "type": "credit_improvement_plan",
                    "data": {
                        "currentScore": int(credit_score_value) if credit_score_value else 720,
                        "actions": actions[:5]  # Limit to 5 actions
                    }
                })
                
                suggestions.extend([
                    "What's affecting my credit score?",
                    "Show me credit card recommendations",
                    "How long until I see improvement?"
                ])
        
        # Check if response mentions building credit
        if any(keyword in lower_response for keyword in ['build', 'building', 'start', 'beginner', 'no credit']):
            suggestions.extend([
                "What's the fastest way to build credit?",
                "Should I get a secured card?",
                "How do I become an authorized user?"
            ])
        
        # Check if response mentions debt consolidation
        if any(keyword in lower_response for keyword in ['consolidate', 'consolidation', 'debt', 'pay off']):
            suggestions.extend([
                "Should I consolidate my debt?",
                "What's the best way to pay off credit card debt?",
                "Will debt consolidation hurt my credit?"
            ])
        
        # Return structured response with rich content and suggestions
        result = {"content": response_text}
        if rich_content:
            result["richContent"] = rich_content
        if suggestions:
            result["suggestions"] = suggestions[:3]  # Limit to 3 suggestions
        
        if rich_content or suggestions:
            return json.dumps(result)
        
        return response_text
    
    def get_capabilities(self) -> List[str]:
        return [
            "Credit score analysis",
            "Credit card recommendations",
            "Credit building strategies",
            "Credit report insights",
            "Debt consolidation advice"
        ]

