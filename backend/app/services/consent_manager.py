"""Consent Management Service"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.models.coach import Consent, ConsentRequest, get_coach_by_id


class ConsentManager:
    """Manages user consent for data sharing with coaches"""
    
    def __init__(self):
        # In production, this would be a database
        # For POC, using in-memory storage
        self._consents: Dict[str, List[Consent]] = {}  # user_id -> list of consents
    
    def create_consent(self, request: ConsentRequest) -> Consent:
        """Create a new consent record"""
        coach = get_coach_by_id(request.coach_id)
        if not coach:
            raise ValueError(f"Coach {request.coach_id} not found")
        
        # Validate required data fields
        missing_fields = set(coach.required_data) - set(request.data_fields)
        if missing_fields:
            raise ValueError(f"Missing required data fields: {missing_fields}")
        
        now = datetime.now()
        expires_at = now + timedelta(hours=request.duration_hours)
        
        consent = Consent(
            id=f"consent_{request.user_id}_{request.coach_id}_{int(now.timestamp())}",
            coach_id=request.coach_id,
            user_id=request.user_id,
            data_fields=request.data_fields,
            granted_at=now,
            expires_at=expires_at,
            status="active",
            audit_log=[{
                "action": "granted",
                "timestamp": now.isoformat(),
                "duration_hours": request.duration_hours
            }]
        )
        
        if request.user_id not in self._consents:
            self._consents[request.user_id] = []
        
        # Revoke any existing active consent for this coach
        self._revoke_existing_consents(request.user_id, request.coach_id)
        
        self._consents[request.user_id].append(consent)
        return consent
    
    def revoke_consent(self, user_id: str, coach_id: str) -> bool:
        """Revoke an active consent"""
        if user_id not in self._consents:
            return False
        
        revoked = False
        for consent in self._consents[user_id]:
            if consent.coach_id == coach_id and consent.status == "active":
                consent.status = "revoked"
                consent.audit_log.append({
                    "action": "revoked",
                    "timestamp": datetime.now().isoformat()
                })
                revoked = True
        
        return revoked
    
    def get_active_consents(self, user_id: str) -> List[Consent]:
        """Get all active consents for a user"""
        if user_id not in self._consents:
            return []
        
        now = datetime.now()
        active_consents = []
        
        for consent in self._consents[user_id]:
            # Check if expired
            if consent.expires_at < now and consent.status == "active":
                consent.status = "expired"
                consent.audit_log.append({
                    "action": "expired",
                    "timestamp": now.isoformat()
                })
            
            if consent.status == "active":
                active_consents.append(consent)
        
        return active_consents
    
    def has_consent(self, user_id: str, coach_id: str) -> bool:
        """Check if user has active consent for a coach"""
        active_consents = self.get_active_consents(user_id)
        return any(c.coach_id == coach_id for c in active_consents)
    
    def get_shared_data(self, user_id: str, coach_id: str, user_context: Dict) -> Optional[Dict]:
        """Get the data that can be shared with a coach based on consent"""
        if not self.has_consent(user_id, coach_id):
            return None
        
        active_consents = self.get_active_consents(user_id)
        consent = next((c for c in active_consents if c.coach_id == coach_id), None)
        if not consent:
            return None
        
        # Extract only consented data fields
        shared_data = {}
        for field in consent.data_fields:
            if field == "income":
                shared_data["income"] = user_context.get("income", {})
            elif field == "savings":
                shared_data["savings"] = user_context.get("savings", {})
            elif field == "credit_score":
                shared_data["credit_score"] = user_context.get("credit", {}).get("score")
            elif field == "affordability_range":
                # Calculate from user context
                monthly_income = user_context.get("income", {}).get("monthly_gross", 0)
                if monthly_income > 0:
                    max_affordable = monthly_income * 4.5  # Rough estimate
                    shared_data["affordability_range"] = {
                        "min": 0,
                        "max": max_affordable
                    }
            elif field == "monthly_budget":
                monthly_income = user_context.get("income", {}).get("monthly_gross", 0)
                shared_data["monthly_budget"] = monthly_income * 0.15  # 15% of income for car
        
        return shared_data
    
    def _revoke_existing_consents(self, user_id: str, coach_id: str):
        """Revoke existing active consents for a coach"""
        if user_id not in self._consents:
            return
        
        for consent in self._consents[user_id]:
            if consent.coach_id == coach_id and consent.status == "active":
                consent.status = "revoked"
                consent.audit_log.append({
                    "action": "revoked",
                    "timestamp": datetime.now().isoformat(),
                    "reason": "replaced_by_new_consent"
                })


# Global consent manager instance
consent_manager = ConsentManager()

