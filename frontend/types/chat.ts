export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  calculationResult?: CalculationResult;
}

export interface CalculationResult {
  dti?: number;
  is_affordable?: boolean;
  home_price?: number;
  monthly_payment?: number;
  max_affordable_home_price?: number;
  readiness_score?: number;
  action_plan?: any;
  [key: string]: any;
}

export interface ConversationState {
  messages: Message[];
  lastCalculation?: CalculationResult;
  calculations?: {
    readiness_score?: number;
    dti?: number;
    affordability?: any;
    spending?: any;
  };
  suggestedFollowUps: string[];
}

