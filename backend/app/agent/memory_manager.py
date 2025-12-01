"""Memory Manager for Conversation Context"""

import json
from typing import List, Dict, Any
from pathlib import Path


class FinancialMemoryManager:
    """
    Manages conversation memory and user context for contextual conversations.
    """
    
    def __init__(self, user_id: str, window_size: int = 10):
        self.user_id = user_id
        self.window_size = window_size
        self.messages: List[Dict[str, str]] = []
        self.user_context = self._load_user_context()
        self.last_calculations: Dict[str, Any] = {}
    
    def get_chat_history(self) -> List[Dict[str, str]]:
        """Get conversation history for LangChain (last N messages)."""
        return self.messages[-self.window_size:] if len(self.messages) > self.window_size else self.messages
    
    def add_message(self, role: str, content: str):
        """Add message to memory."""
        self.messages.append({"role": role, "content": content})
        # Keep only last N messages
        if len(self.messages) > self.window_size * 2:
            self.messages = self.messages[-self.window_size:]
    
    def get_user_context(self) -> Dict[str, Any]:
        """Get user's financial context."""
        return self.user_context
    
    def get_last_dti(self) -> float:
        """Get last calculated DTI for context."""
        dti_calc = self.last_calculations.get("dti")
        if dti_calc and isinstance(dti_calc, dict):
            return dti_calc.get("dti", 0)
        return 0
    
    def store_calculation(self, calculation_type: str, result: Dict):
        """Store calculation result for future reference."""
        self.last_calculations[calculation_type] = result
        self.last_calculations["last"] = result
    
    def _load_user_context(self) -> Dict[str, Any]:
        """Load from JSON file."""
        try:
            data_path = Path(__file__).parent.parent / "data" / "mock_user_context.json"
            with open(data_path, "r") as f:
                data = json.load(f)
                return data.get(self.user_id, data.get("user_001", {}))
        except FileNotFoundError:
            return {
                "income": {"monthly_gross": 0},
                "debts": [],
                "savings": {"total": 0}
            }

