"""Service to generate personalized onboarding questions using LLM"""

import os
import json
from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from pathlib import Path


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


async def generate_personalized_questions(user_id: str, existing_goals: List[Dict[str, Any]] = None) -> List[str]:
    """
    Generate personalized onboarding questions based on user's financial context.
    
    Args:
        user_id: User identifier
        existing_goals: List of existing goals (if any)
    
    Returns:
        List of personalized question strings
    """
    user_context = _load_user_context(user_id)
    
    # Get user financial snapshot
    monthly_income = user_context.get("income", {}).get("monthly_gross", 0)
    total_savings = user_context.get("savings", {}).get("total", 0)
    credit_score = user_context.get("credit", {}).get("score", 0)
    debts = user_context.get("debts", [])
    total_debt = sum(d.get("balance", 0) for d in debts)
    
    # Determine existing goal types
    existing_goal_types = [g.get("type") for g in (existing_goals or [])] if existing_goals else []
    
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.7,
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    prompt = f"""You are a Financial Coach helping users prepare for homeownership and achieve their financial goals.

User's Financial Profile:
- Monthly Income: ${monthly_income:,.0f}
- Total Savings: ${total_savings:,.0f}
- Credit Score: {credit_score}
- Total Debt: ${total_debt:,.0f}
- Number of Debts: {len(debts)}

Existing Goals: {', '.join(existing_goal_types) if existing_goal_types else 'None'}

Based on this financial profile, generate 5-6 personalized, engaging questions that:
1. Are relevant to their current financial situation
2. Help them understand their financial health
3. Suggest next steps based on their profile
4. Include questions about goals they don't have yet (if applicable)
5. Reference our latest features: goal management, spending analysis, scenario planning, AI transparency
6. Are conversational and encouraging (not too formal)
7. Vary in complexity (some quick checks, some deeper analysis)

Available Features to Reference:
- Readiness score calculation
- DTI calculation
- Affordability checks
- Spending analysis with peer benchmarks
- Goal creation (homeownership, retirement, education, debt payoff, emergency fund, major purchase)
- Scenario planning ("what if" analysis)
- AI transparency (understanding recommendations)
- Product recommendations

Focus Areas Based on Profile:
- If savings < $10k: Emphasize savings goals and emergency fund
- If credit score < 700: Emphasize credit improvement
- If total_debt > $20k: Emphasize debt payoff strategies
- If no emergency fund goal: Suggest emergency fund goal
- If no retirement goal: Suggest retirement planning
- If high DTI: Emphasize debt reduction

Return ONLY a JSON array of question strings, nothing else. Example format:
["What is my readiness score?", "Can I afford a $400k home?", "Should I create an emergency fund goal?"]

Questions should be:
- Specific to their situation
- Action-oriented
- Use natural, conversational language
- Reference specific amounts or goals when relevant
"""

    try:
        response = await llm.ainvoke(prompt)
        content = response.content.strip()
        
        # Try to parse as JSON
        if content.startswith('[') or content.startswith('{'):
            questions = json.loads(content)
            if isinstance(questions, list):
                return questions[:6]  # Limit to 6 questions
            elif isinstance(questions, dict) and 'questions' in questions:
                return questions['questions'][:6]
        
        # Fallback: try to extract questions from text
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        questions = []
        for line in lines:
            if line.startswith('"') or line.startswith("'"):
                q = line.strip('"\'')
                if q.endswith('?'):
                    questions.append(q)
            elif '?' in line:
                questions.append(line.split('?')[0] + '?')
        
        return questions[:6] if questions else _get_fallback_questions(user_context, existing_goal_types)
    
    except Exception as e:
        print(f"Error generating questions: {e}")
        return _get_fallback_questions(user_context, existing_goal_types)


def _get_fallback_questions(user_context: Dict[str, Any], existing_goal_types: List[str]) -> List[str]:
    """Fallback questions if LLM generation fails."""
    questions = []
    
    monthly_income = user_context.get("income", {}).get("monthly_gross", 0)
    total_savings = user_context.get("savings", {}).get("total", 0)
    credit_score = user_context.get("credit", {}).get("score", 0)
    debts = user_context.get("debts", [])
    total_debt = sum(d.get("balance", 0) for d in debts)
    
    # Always include readiness score
    questions.append("What is my readiness score?")
    
    # DTI question
    if total_debt > 0:
        questions.append("What's my debt-to-income ratio?")
    
    # Affordability question
    if monthly_income > 0:
        questions.append("Can I afford a $400k home?")
    
    # Goal-related questions
    if 'emergency_fund' not in existing_goal_types and total_savings < 10000:
        questions.append("Should I create an emergency fund goal?")
    
    if 'retirement' not in existing_goal_types:
        questions.append("How should I start planning for retirement?")
    
    # Spending analysis
    if monthly_income > 0:
        questions.append("Analyze my spending patterns")
    
    # Fill remaining slots
    if len(questions) < 5:
        questions.extend([
            "Which debt should I pay off first?",
            "What's my credit score impact on mortgage rates?"
        ])
    
    return questions[:6]

