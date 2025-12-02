export interface Coach {
  id: string;
  name: string;
  description: string;
  category: 'real_estate' | 'auto' | 'credit' | 'mortgage' | 'home_services' | 'insurance';
  powered_by: string;
  icon: string;
  required_data: string[];
  capabilities: string[];
  api_endpoint?: string;
  is_active: boolean;
}

export interface Consent {
  id: string;
  coach_id: string;
  user_id: string;
  data_fields: string[];
  granted_at: string;
  expires_at: string;
  status: 'active' | 'revoked' | 'expired';
  audit_log: Array<{
    action: string;
    timestamp: string;
    [key: string]: any;
  }>;
}

export interface ConsentRequest {
  coach_id: string;
  data_fields: string[];
  duration_hours: number;
  user_id: string;
}

