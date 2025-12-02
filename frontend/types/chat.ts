export interface RichContent {
  type: 'link' | 'youtube' | 'embed' | 'overlay' | 'card' | 'image' | 'property_listing';
  title?: string;
  url?: string;
  description?: string;
  thumbnail?: string;
  image?: string; // Direct image URL
  price?: string;
  location?: string;
  features?: string[];
  data?: any; // Additional data for overlays/cards
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  calculationResult?: CalculationResult;
  coachId?: string; // 'financial_coach', 'zillow_coach', 'carmax_coach'
  coachName?: string; // Display name for the coach
  coachIcon?: string; // Emoji or icon for the coach
  richContent?: RichContent[]; // Advanced content like links, embeds, overlays
}

export interface CalculationResult {
  dti?: number;
  is_affordable?: boolean;
  home_price?: number;
  monthly_payment?: number;
  max_affordable_home_price?: number;
  readiness_score?: number;
  action_plan?: any;
  goal_recommendation?: {
    type: 'homeownership' | 'retirement' | 'education' | 'debt_payoff' | 'emergency_fund' | 'major_purchase';
    name: string;
    targetAmount: number;
    targetDate?: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    monthlyContribution?: number;
    supportingFactors?: string[];
    riskFactors?: string[];
    confidenceScore?: number;
    dataSources?: string[];
  };
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

