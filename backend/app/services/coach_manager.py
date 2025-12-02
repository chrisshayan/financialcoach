"""Coach Manager - Manages active coaches and their instances"""

from typing import Dict, Optional
from app.coaches.zillow_coach import ZillowCoach
from app.coaches.carmax_coach import CarMaxCoach
from app.coaches.base_coach import BaseCoach
import os
from pathlib import Path
from dotenv import load_dotenv

# Ensure environment is loaded - ensure we load from backend directory
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
# Also try loading from current directory as fallback
load_dotenv()


class CoachManager:
    """Manages coach instances and their lifecycle"""
    
    def __init__(self):
        self._coach_instances: Dict[str, BaseCoach] = {}
        # Lazy initialization - only create coaches when needed
        self._initialized = False
    
    def _initialize_coaches(self):
        """Initialize all available coaches (lazy loading)"""
        if self._initialized:
            return
        
        # Ensure environment is loaded
        load_dotenv()
        
        # Check API key before initializing
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not set in environment variables. Please create a .env file in the backend directory with OPENAI_API_KEY=your_key_here")
        
        self._coach_instances["zillow_coach"] = ZillowCoach()
        self._coach_instances["carmax_coach"] = CarMaxCoach()
        self._initialized = True
    
    def get_coach(self, coach_id: str) -> Optional[BaseCoach]:
        """Get a coach instance by ID"""
        if not self._initialized:
            self._initialize_coaches()
        return self._coach_instances.get(coach_id)
    
    def get_all_coaches(self) -> Dict[str, BaseCoach]:
        """Get all available coaches"""
        if not self._initialized:
            self._initialize_coaches()
        return self._coach_instances.copy()


# Global coach manager instance
coach_manager = CoachManager()

