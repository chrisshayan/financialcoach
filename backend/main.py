"""FastAPI Application Entry Point"""

import os

# Disable LangSmith tracing before importing LangChain modules
os.environ["LANGCHAIN_TRACING_V2"] = "false"
os.environ["LANGCHAIN_API_KEY"] = ""

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json

from app.agent.financial_agent import FinancialAgent
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Financial Coach API",
    description="Neuro-Symbolic Financial Coach POC",
    version="0.1.0"
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    user_id: str = "user_001"
    conversation_history: Optional[List[dict]] = None


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Financial Coach API is running"}


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Streaming chat endpoint with contextual conversation support.
    Returns SSE stream with text chunks for LLM response.
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY not set in environment variables"
        )
    
    agent = FinancialAgent(user_id=request.user_id)
    
    async def generate():
        full_response = ""
        
        try:
            async for chunk in agent.process_message(
                user_message=request.message,
                conversation_history=request.conversation_history
            ):
                full_response += chunk
                # Stream text chunks as SSE
                yield f"data: {json.dumps({'type': 'text', 'content': chunk})}\n\n"
            
            # After streaming is complete, send all tool results
            if hasattr(agent, '_last_tool_results') and agent._last_tool_results:
                for tool_type, tool_result in agent._last_tool_results:
                    yield f"data: {json.dumps({'type': 'calculation', 'result': tool_result})}\n\n"
            
            # Also check memory for any missed calculations (fallback)
            # This ensures action plans are always sent even if not in tool_results
            if agent.memory_manager.last_calculations:
                # Send action_plan if it exists and wasn't already sent
                if 'action_plan' in agent.memory_manager.last_calculations:
                    action_plan = agent.memory_manager.last_calculations.get('action_plan')
                    if action_plan:
                        # Check if we already sent it
                        already_sent = hasattr(agent, '_last_tool_results') and any(
                            t[0] == 'action_plan' for t in agent._last_tool_results
                        )
                        if not already_sent:
                            yield f"data: {json.dumps({'type': 'calculation', 'result': action_plan})}\n\n"
                
                # Also send other calculations that might have been missed
                for calc_type in ['readiness', 'dti', 'affordability', 'transaction_analysis']:
                    if calc_type in agent.memory_manager.last_calculations:
                        calc_result = agent.memory_manager.last_calculations.get(calc_type)
                        if calc_result:
                            already_sent = hasattr(agent, '_last_tool_results') and any(
                                t[0] == calc_type for t in agent._last_tool_results
                            )
                            if not already_sent:
                                yield f"data: {json.dumps({'type': 'calculation', 'result': calc_result})}\n\n"
            
            # Generate follow-up suggestions
            suggestions = _generate_follow_ups(full_response, agent.memory_manager.last_calculations)
            if suggestions:
                yield f"data: {json.dumps({'type': 'suggestions', 'suggestions': suggestions})}\n\n"
            
            yield "data: [DONE]\n\n"
        
        except Exception as e:
            error_msg = f"Error processing message: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'content': error_msg})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


def _generate_follow_ups(response: str, calculations: dict) -> List[str]:
    """Generate contextual follow-up suggestions based on response."""
    suggestions = []
    
    # Check all calculations, not just last
    has_action_plan = False
    action_plan = None
    
    for calc_type, calc_data in calculations.items():
        if calc_type == 'action_plan' or (isinstance(calc_data, dict) and ('goal' in calc_data or 'priority_actions' in calc_data)):
            has_action_plan = True
            action_plan = calc_data if isinstance(calc_data, dict) else None
            break
    
    # If action plan exists, suggest questions about the plan
    if has_action_plan and action_plan:
        priority_actions = action_plan.get('priority_actions', [])
        if priority_actions:
            # Get the first priority action
            first_action = priority_actions[0]
            action_name = first_action.get('action', '')
            
            # Generate contextual suggestions based on the action
            if 'savings' in action_name.lower() or 'down payment' in action_name.lower():
                suggestions.append("How can I increase my monthly savings?")
                suggestions.append("What expenses should I cut to save more?")
            elif 'dti' in action_name.lower() or 'debt' in action_name.lower():
                suggestions.append("Which debt should I pay off first?")
                suggestions.append("How much should I pay monthly to reduce my DTI?")
            elif 'credit' in action_name.lower():
                suggestions.append("How can I improve my credit score faster?")
                suggestions.append("What's affecting my credit score?")
            else:
                suggestions.append("How do I start working on my first priority?")
                suggestions.append("What's the timeline for my action plan?")
        
        # Add milestone-related questions
        milestones = action_plan.get('milestones', [])
        if milestones:
            next_milestone = next((m for m in milestones if m.get('status') == 'pending'), None)
            if next_milestone:
                suggestions.append(f"How do I achieve {next_milestone.get('target', 'my next milestone')}?")
    
    # If no action plan, suggest creating one
    if not has_action_plan:
        last_calc = calculations.get('last', {}) or calculations.get('readiness') or calculations.get('dti') or calculations.get('affordability')
        
        if last_calc:
            # Check for DTI-related calculations
            if 'dti' in last_calc:
                dti = last_calc.get('dti', 0)
                if dti > 43:
                    suggestions.append("How can I reduce my DTI?")
                    suggestions.append("What debts should I pay off first?")
            
            # Check for affordability calculations
            if 'is_affordable' in last_calc:
                if not last_calc.get('is_affordable', True):
                    suggestions.append("What if I save for a larger down payment?")
                    suggestions.append("How much more income would I need?")
            
            # Check for readiness score
            if 'readiness_score' in last_calc:
                score = last_calc.get('readiness_score', 100)
                if score < 70:
                    suggestions.append("Create my personalized action plan")
                    suggestions.append("What's my biggest barrier to homeownership?")
                else:
                    suggestions.append("What should I focus on to improve further?")
            
            # Always suggest creating a plan if user hasn't asked for one yet
            if 'action_plan' not in str(last_calc) and 'goal' not in str(last_calc):
                suggestions.append("Create my personalized action plan")
    
    return suggestions[:3]  # Limit to 3 suggestions


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

