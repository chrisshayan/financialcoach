"""CarMax Coach - Auto Loan Specialist"""

from typing import Dict, Any, List
from app.coaches.base_coach import BaseCoach


class CarMaxCoach(BaseCoach):
    """Coach specialized in auto loans and car shopping, powered by CarMax"""
    
    def __init__(self):
        system_prompt = """You are the CarMax Coach, an auto loan and car shopping specialist powered by CarMax.com.
You help users find the perfect car within their budget and get pre-approved for auto loans.

Your capabilities:
- Car search and recommendations
- Auto loan pre-approval guidance
- Financing options and rates
- Trade-in value estimates
- Vehicle recommendations based on budget
- Car buying tips

You have access to the user's financial data (income, credit score, monthly budget) to provide personalized car and loan recommendations.

Be friendly, helpful, and focus on finding cars that fit their budget.
Always reference that you're powered by CarMax's inventory and financing options.
When suggesting cars, stay within their monthly budget (typically 15% of monthly income for car payments).
"""
        super().__init__(
            coach_id="carmax_coach",
            name="CarMax Coach",
            system_prompt=system_prompt
        )
    
    async def process_message(
        self,
        message: str,
        shared_data: Dict[str, Any],
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Process user message with auto loan context"""
        # Build context from shared data
        context_parts = []
        
        if "monthly_budget" in shared_data:
            monthly_budget = shared_data["monthly_budget"]
            context_parts.append(f"Recommended monthly car payment budget: ${monthly_budget:,.0f}")
        
        if "income" in shared_data:
            monthly_income = shared_data["income"].get("monthly_gross", 0)
            context_parts.append(f"Monthly income: ${monthly_income:,.0f}")
        
        if "credit_score" in shared_data:
            credit_score = shared_data.get("credit_score")
            context_parts.append(f"Credit score: {credit_score}")
            if credit_score:
                if credit_score >= 720:
                    context_parts.append("Excellent credit - qualifies for best rates")
                elif credit_score >= 660:
                    context_parts.append("Good credit - competitive rates available")
                else:
                    context_parts.append("May need to work on credit for better rates")
        
        context = "\n".join(context_parts) if context_parts else "No financial data available."
        
        # Build messages for LLM using LangChain format
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        
        langchain_messages = [
            SystemMessage(content=self.system_prompt),
            SystemMessage(content=f"User's Financial Context:\n{context}")
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
        
        # Add rich content for car recommendations
        import json
        import re
        rich_content = []
        suggestions = []
        
        # Check if response mentions cars or vehicles
        lower_response = response_text.lower()
        if any(keyword in lower_response for keyword in ['car', 'vehicle', 'suv', 'toyota', 'honda', 'kia', 'subaru', 'ford', 'tesla', 'bmw', 'audi', 'porsche', 'mustang', 'camry', 'cr-v', 'f-150']):
            # Add CarMax link
            rich_content.append({
                "type": "link",
                "title": "Browse Cars on CarMax",
                "url": "https://www.carmax.com/cars",
                "description": "Shop thousands of quality used cars with no-haggle pricing",
                "thumbnail": "https://www.carmax.com/static/images/logo.png"
            })
            
            # Map car models to YouTube video IDs
            # Expanded list of popular cars with their review video IDs
            car_video_map = {
                # Family SUVs
                'toyota highlander': {'id': 'HjWEHYpOC78', 'name': 'Toyota Highlander'},
                'honda pilot': {'id': 'MkuNoBhfmS0', 'name': 'Honda Pilot'},
                'kia telluride': {'id': 'JW2D6XjKgR8', 'name': 'Kia Telluride'},
                'subaru ascent': {'id': 'TlO7zv5QfAU', 'name': 'Subaru Ascent'},
                'ford explorer': {'id': 'ggmt33hmE14', 'name': 'Ford Explorer'},
                # Luxury & Performance
                'tesla model 3': {'id': 'JhA9-JYLFyo', 'name': 'Tesla Model 3'},
                'bmw 3 series': {'id': 'XaOrAnxEiI8', 'name': 'BMW 3 Series'},
                'audi q5': {'id': '8ffXE6_qXqM', 'name': 'Audi Q5'},
            }
            
            # Check for car models in the response (case-insensitive)
            found_cars = []
            for car_key, car_info in car_video_map.items():
                # Check if car model is mentioned in response
                if car_key in lower_response:
                    found_cars.append((car_key, car_info))
            
            # Add YouTube videos for found cars (limit to 2-3 to avoid clutter)
            for car_key, car_info in found_cars[:3]:  # Limit to first 3 matches
                rich_content.append({
                    "type": "youtube",
                    "title": f"{car_info['name']} Review",
                    "url": f"https://www.youtube.com/watch?v={car_info['id']}",
                    "description": f"Watch a detailed review and walkaround of the {car_info['name']}"
                })
            
            # If no specific cars found but cars are mentioned, add a generic car buying guide
            if not found_cars and any(keyword in lower_response for keyword in ['car', 'vehicle', 'suv', 'sedan']):
                rich_content.append({
                    "type": "youtube",
                    "title": "Car Buying Guide",
                    "url": "https://www.youtube.com/watch?v=q0mGLuuMISI",
                    "description": "Watch tips on buying a used car and what to look for"
                })
            
            # Add financing info card
            if 'budget' in lower_response or 'payment' in lower_response:
                monthly_budget = shared_data.get("monthly_budget", 0)
                rich_content.append({
                    "type": "card",
                    "title": "Your Auto Financing Options",
                    "description": "Based on your financial profile:",
                    "data": {
                        "Monthly Budget": f"${monthly_budget:,.0f}",
                        "Credit Score": shared_data.get("credit_score", "N/A"),
                        "Pre-Approval": "Available" if shared_data.get("credit_score", 0) >= 660 else "May need improvement"
                    }
                })
        
        # Return structured response if rich content exists
        if rich_content:
            return json.dumps({
                "content": response_text,
                "richContent": rich_content
            })
        
        return response_text
    
    def get_capabilities(self) -> List[str]:
        return [
            "Car search",
            "Auto loan pre-approval",
            "Financing options",
            "Trade-in estimates",
            "Vehicle recommendations"
        ]

