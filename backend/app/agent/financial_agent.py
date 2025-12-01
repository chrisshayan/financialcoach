"""LangChain-based Financial Agent"""

import os
import json
from typing import AsyncGenerator, List, Dict, Any

# Disable LangSmith tracing (prevents 404 errors)
os.environ["LANGCHAIN_TRACING_V2"] = "false"
os.environ["LANGCHAIN_API_KEY"] = ""

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage

from app.agent.tools import get_financial_tools
from app.agent.memory_manager import FinancialMemoryManager


class FinancialAgent:
    """
    LangChain-based agent that orchestrates the Neuro-Symbolic flow.
    Handles intent detection, tool calling, and contextual conversation.
    """
    
    def __init__(self, user_id: str = "user_001"):
        self.user_id = user_id
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.1,  # Low for financial accuracy
            streaming=True,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Get financial calculation tools
        self.tools = get_financial_tools(user_id)
        
        # Setup memory for contextual conversations
        self.memory_manager = FinancialMemoryManager(user_id)
        self._last_tool_results = []  # Store tool results from last message
        
        # Create agent using LangChain 1.0+ API
        # Use create_agent which is the new way to create agents
        self.agent_runnable = create_agent(
            model=self.llm,
            tools=self.tools,
            system_prompt=self._get_system_prompt()
        )
    
    def _get_system_prompt(self) -> str:
        """System prompt with user context injected."""
        user_context = self.memory_manager.get_user_context()
        monthly_income = user_context.get("income", {}).get("monthly_gross", 0)
        total_savings = user_context.get("savings", {}).get("total", 0)
        last_dti = self.memory_manager.get_last_dti()
        
        dti_text = f"{last_dti:.1f}%" if last_dti > 0 else "Not calculated yet"
        
        return f"""You are a Financial Coach helping users prepare for homeownership.

CRITICAL RULES:
1. You CANNOT perform financial calculations yourself.
2. When a user asks about affordability, DTI, or readiness, you MUST use the provided tools.
3. After receiving calculation results, narrate them in an empathetic, encouraging tone.
4. Never invent numbers. Only use numbers returned from tools.
5. Reference previous conversation context when relevant.
6. Suggest actionable next steps based on calculations.
7. When you call create_action_plan tool, DO NOT repeat the entire plan in your response. Just acknowledge that you've created a plan and highlight 1-2 key priorities. The structured plan will be displayed automatically.

User's Current Financial Snapshot:
- Monthly Income: ${monthly_income:,.0f}
- Total Savings: ${total_savings:,.0f}
- Last Calculated DTI: {dti_text}

Available Tools:
- calculate_dti: Calculate Debt-to-Income ratio
- calculate_affordability: Determine if a home price is affordable (requires home_price parameter)
- get_readiness_score: Get overall readiness score (0-100)
- create_action_plan: Create a personalized action plan with steps, timeline, and milestones
- analyze_spending: Analyze spending patterns, detect overspending, and compare to peer benchmarks

Conversation Style:
- Be encouraging and supportive - you're coaching a First-Time Home Buyer
- Be PROACTIVE: Don't wait for questions, suggest next steps and create action plans
- After calculating readiness or DTI, automatically offer to create an action plan
- When users ask about spending, expenses, or transactions, use analyze_spending tool
- Use specific numbers from calculations
- Reference previous discussions when relevant
- Offer actionable suggestions with timelines
- Create personalized plans that address the user's specific gaps
- When transaction analysis shows overspending, be empathetic but direct about opportunities to save
- Ask clarifying questions when needed, but also take initiative
"""
    
    async def process_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Process user message with full conversation context.
        Streams response chunks for real-time UX.
        """
        # Load conversation history from memory
        chat_history = []
        for msg in self.memory_manager.get_chat_history():
            if msg["role"] == "user":
                chat_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                chat_history.append(AIMessage(content=msg["content"]))
        
        # Add any provided history (from frontend)
        if conversation_history:
            for msg in conversation_history:
                if msg["role"] == "user":
                    chat_history.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    chat_history.append(AIMessage(content=msg["content"]))
        
        # Prepare messages for agent
        # LangChain 1.0+ create_agent expects messages in the input
        input_data = {
            "messages": chat_history + [HumanMessage(content=user_message)]
        }
        
        # Execute agent with streaming
        full_response = ""
        
        try:
            # Use invoke first to get the full response, then we'll handle streaming
            response = await self.agent_runnable.ainvoke(input_data)
            
            # Extract tool results and final response from the agent
            tool_results = []
            if "messages" in response:
                # First pass: Extract all tool results
                for message in response["messages"]:
                    # Check if this is a ToolMessage (result from tool execution)
                    if isinstance(message, ToolMessage) or (hasattr(message, "__class__") and "ToolMessage" in str(type(message))):
                        if hasattr(message, "content") and message.content:
                            content = str(message.content)
                            # Try to parse as JSON (tool results)
                            try:
                                result = json.loads(content)
                                if isinstance(result, dict):
                                    # Store calculation results
                                    if "dti" in result and "is_affordable" not in result:
                                        self.memory_manager.store_calculation("dti", result)
                                        tool_results.append(("dti", result))
                                    elif "is_affordable" in result:
                                        self.memory_manager.store_calculation("affordability", result)
                                        tool_results.append(("affordability", result))
                                    elif "readiness_score" in result:
                                        self.memory_manager.store_calculation("readiness", result)
                                        tool_results.append(("readiness", result))
                                    elif "action_plan" in result or "priority_actions" in result or "goal" in result:
                                        self.memory_manager.store_calculation("action_plan", result)
                                        tool_results.append(("action_plan", result))
                                    elif "spending_by_category" in result or "overspending_alerts" in result or "peer_comparisons" in result:
                                        self.memory_manager.store_calculation("transaction_analysis", result)
                                        tool_results.append(("transaction_analysis", result))
                            except json.JSONDecodeError:
                                pass  # Not JSON, continue
                    # Also check regular messages that might contain JSON (fallback)
                    elif hasattr(message, "content") and message.content:
                        content = str(message.content)
                        # Skip if it's an AIMessage (those are responses, not tool results)
                        if isinstance(message, AIMessage):
                            continue
                        # Try to parse as JSON (tool results)
                        try:
                            result = json.loads(content)
                            if isinstance(result, dict):
                                # Store calculation results
                                if "dti" in result and "is_affordable" not in result:
                                    self.memory_manager.store_calculation("dti", result)
                                    tool_results.append(("dti", result))
                                elif "is_affordable" in result:
                                    self.memory_manager.store_calculation("affordability", result)
                                    tool_results.append(("affordability", result))
                                elif "readiness_score" in result:
                                    self.memory_manager.store_calculation("readiness", result)
                                    tool_results.append(("readiness", result))
                                elif "action_plan" in result or "priority_actions" in result or "goal" in result:
                                    self.memory_manager.store_calculation("action_plan", result)
                                    tool_results.append(("action_plan", result))
                        except json.JSONDecodeError:
                            pass  # Not JSON, continue
                
                # Second pass: Find the final text response (last non-tool message)
                for message in reversed(response["messages"]):
                    if hasattr(message, "content") and message.content:
                        content = str(message.content)
                        # Skip JSON (tool results)
                        try:
                            json.loads(content)
                            continue  # This is a tool result, skip it
                        except json.JSONDecodeError:
                            # This is a text response - stream it
                            full_response = content
                            # Stream word by word for better UX
                            words = content.split()
                            for i, word in enumerate(words):
                                yield word + (" " if i < len(words) - 1 else "")
                            break  # Found the response, stop looking
                
                # Store tool results for later retrieval
                self._last_tool_results = tool_results
                            
        except Exception as e:
            error_msg = f"Error processing message: {str(e)}"
            yield error_msg
            full_response = error_msg
            self._last_tool_results = []
        
        # Save to memory
        self.memory_manager.add_message("user", user_message)
        self.memory_manager.add_message("assistant", full_response)
        
        # Extract and store any calculations for future reference
        # This would be enhanced to parse tool outputs
        self._extract_and_store_calculations(full_response)
    
    def _extract_and_store_calculations(self, response: str):
        """Extract calculation results from tool outputs for future context."""
        # In a full implementation, we'd parse the tool execution results
        # For now, we rely on the memory manager's last_calculations
        pass

