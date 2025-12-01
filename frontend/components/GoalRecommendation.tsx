'use client';

import { useState } from 'react';
import { Goal, GoalType } from './GoalManagement';
import { AITransparency } from './AITransparency';

interface GoalRecommendationProps {
  recommendation: {
    type: GoalType;
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
  onCreate: (goal: Omit<Goal, 'id' | 'progress' | 'status' | 'icon' | 'color'>) => void;
  onDismiss: () => void;
}

const goalIcons: Record<GoalType, string> = {
  homeownership: '🏠',
  retirement: '👴',
  education: '🎓',
  debt_payoff: '💳',
  emergency_fund: '🆘',
  major_purchase: '🛒'
};

const goalColors: Record<GoalType, string> = {
  homeownership: 'blue',
  retirement: 'purple',
  education: 'green',
  debt_payoff: 'red',
  emergency_fund: 'yellow',
  major_purchase: 'orange'
};

export function GoalRecommendation({ recommendation, onCreate, onDismiss }: GoalRecommendationProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCreate = () => {
    const goal: Omit<Goal, 'id' | 'progress' | 'status' | 'icon' | 'color'> = {
      type: recommendation.type,
      name: recommendation.name,
      targetAmount: recommendation.targetAmount,
      currentAmount: 0,
      targetDate: recommendation.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: recommendation.priority,
      monthlyContribution: recommendation.monthlyContribution
    };
    onCreate(goal);
  };

  const generateExplanation = () => {
    const months = recommendation.targetDate 
      ? Math.ceil((new Date(recommendation.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
      : 12;
    
    return {
      recommendation: recommendation.name,
      primaryReason: recommendation.reason,
      supportingFactors: recommendation.supportingFactors || [
        `Target amount: $${recommendation.targetAmount.toLocaleString()}`,
        `Timeline: ${months} months`,
        `Priority: ${recommendation.priority}`
      ],
      riskFactors: recommendation.riskFactors,
      timelineImpact: recommendation.monthlyContribution 
        ? `By saving $${recommendation.monthlyContribution.toLocaleString()}/month, you'll reach your goal in ${months} months.`
        : undefined,
      confidence: recommendation.confidenceScore || 85,
      dataSources: recommendation.dataSources || [
        "User financial profile",
        "Income and savings data",
        "Goal analysis"
      ],
      alternatives: recommendation.type === 'emergency_fund' ? [
        {
          option: "Build emergency fund gradually over 12 months",
          pros: ["More manageable monthly savings", "Less impact on current lifestyle"],
          cons: ["Longer timeline", "Less protection in early months"],
          timeline: "12 months"
        }
      ] : undefined
    };
  };

  return (
    <div className="mt-3 p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl">{goalIcons[recommendation.type]}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">Recommended Goal: {recommendation.name}</h4>
          <p className="text-sm text-muted-foreground mb-3">{recommendation.reason}</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-2 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Target Amount</div>
              <div className="font-bold text-foreground">${recommendation.targetAmount.toLocaleString()}</div>
            </div>
            {recommendation.monthlyContribution && (
              <div className="p-2 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Monthly Savings</div>
                <div className="font-bold text-foreground">${recommendation.monthlyContribution.toLocaleString()}/mo</div>
              </div>
            )}
            {recommendation.targetDate && (
              <div className="p-2 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Target Date</div>
                <div className="font-bold text-foreground">
                  {new Date(recommendation.targetDate).toLocaleDateString()}
                </div>
              </div>
            )}
            <div className="p-2 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Priority</div>
              <div className="font-bold text-foreground capitalize">{recommendation.priority}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Create Goal
            </button>
            <button
              onClick={() => setShowExplanation(true)}
              className="px-3 py-2 bg-muted/50 hover:bg-muted/70 text-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Why this?
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-muted/50 hover:bg-muted/70 text-foreground rounded-lg font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* AI Transparency Modal */}
      {showExplanation && (
        <AITransparency
          explanation={generateExplanation()}
          onClose={() => setShowExplanation(false)}
          isModal={true}
        />
      )}
    </div>
  );
}

