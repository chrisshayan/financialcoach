"""Base Coach Interface"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables - ensure we load from backend directory
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
# Also try loading from current directory as fallback
load_dotenv()


class BaseCoach(ABC):
    """Base class for all coaches in the marketplace"""
    
    def __init__(self, coach_id: str, name: str, system_prompt: str):
        self.coach_id = coach_id
        self.name = name
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not set in environment variables")
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.7,
            api_key=api_key
        )
        self.system_prompt = system_prompt
    
    @abstractmethod
    async def process_message(
        self,
        message: str,
        shared_data: Dict[str, Any],
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """
        Process a user message with access to shared data.
        
        Args:
            message: User's message
            shared_data: Data shared based on user consent
            conversation_history: Previous conversation messages
        
        Returns:
            Coach's response
        """
        pass
    
    def get_capabilities(self) -> List[str]:
        """Return list of what this coach can help with"""
        return []

