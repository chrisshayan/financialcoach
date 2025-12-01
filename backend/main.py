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
            if agent.memory_manager.last_calculations:
                # Send action_plan if it exists
                if 'action_plan' in agent.memory_manager.last_calculations:
                    action_plan = agent.memory_manager.last_calculations.get('action_plan')
                    if action_plan:
                        # Check if we already sent it
                        already_sent = hasattr(agent, '_last_tool_results') and any(
                            t[0] == 'action_plan' for t in agent._last_tool_results
                        )
                        if not already_sent:
                            yield f"data: {json.dumps({'type': 'calculation', 'result': action_plan})}\n\n"
            
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
    
    last_calc = calculations.get('last', {})
    
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
                suggestions.append("What should I focus on first?")
        
        # Always suggest creating a plan if user hasn't asked for one yet
        if 'action_plan' not in last_calc and 'goal' not in last_calc:
            suggestions.append("Create my personalized action plan")
    
    return suggestions[:3]  # Limit to 3 suggestions


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

