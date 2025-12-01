'use client';

import { CalculationResult } from '@/types/chat';

interface CalculationCardProps {
  result: CalculationResult;
}

export function CalculationCard({ result }: CalculationCardProps) {
  // DTI calculation card
  if (result.dti !== undefined && result.is_affordable === undefined) {
    const dti = result.dti || 0;
    const isGood = dti <= 43;
    
    return (
      <div className={`mt-3 p-4 rounded-lg border ${
        isGood 
          ? 'bg-green-950/30 border-green-800/50' 
          : 'bg-red-950/30 border-red-800/50'
      }`}>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className={`text-2xl ${isGood ? 'text-green-400' : 'text-red-400'}`}>
            {isGood ? '✓' : '⚠'}
          </span>
          DTI Analysis
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Debt-to-Income Ratio:</span>
            <span className={`text-xl font-bold ${isGood ? 'text-green-400' : 'text-red-400'}`}>
              {dti.toFixed(2)}%
            </span>
          </div>
          {!isGood && (
            <div className="text-sm text-red-400 mt-2">
              ⚠️ Exceeds recommended 43% limit
            </div>
          )}
          {isGood && (
            <div className="text-sm text-green-400 mt-2">
              ✓ Within acceptable limits for most lenders
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Affordability calculation card
  if (result.home_price !== undefined) {
    const isAffordable = result.is_affordable || false;
    
    return (
      <div className={`mt-3 p-4 rounded-lg border ${
        isAffordable 
          ? 'bg-green-950/30 border-green-800/50' 
          : 'bg-red-950/30 border-red-800/50'
      }`}>
        <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
          isAffordable ? 'text-green-400' : 'text-red-400'
        }`}>
          <span className="text-2xl">{isAffordable ? '✓' : '✗'}</span>
          Affordability Analysis
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Home Price:</span>
            <span className="font-semibold text-foreground">
              ${result.home_price?.toLocaleString()}
            </span>
          </div>
          {result.monthly_payment && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Payment:</span>
              <span className="font-semibold text-foreground">
                ${result.monthly_payment.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-bold text-lg ${isAffordable ? 'text-green-400' : 'text-red-400'}`}>
              {isAffordable ? '✅ Affordable' : '❌ Not Affordable'}
            </span>
          </div>
          {!isAffordable && result.max_affordable_home_price && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">💡 Recommendation:</div>
              <div className="text-foreground font-medium">
                You could afford up to <span className="text-primary">${result.max_affordable_home_price.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Action plan card
  if (result.action_plan || result.goal || result.priority_actions) {
    // Action plan is handled by ActionPlan component
    return null;
  }
  
  // Readiness score card
  if (result.readiness_score !== undefined) {
    const score = result.readiness_score || 0;
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-400';
      if (score >= 65) return 'text-blue-400';
      if (score >= 50) return 'text-yellow-400';
      return 'text-red-400';
    };
    
    return (
      <div className="mt-3 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold text-foreground mb-3">Readiness Score</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Overall Score:</span>
            <div className="flex items-center gap-3">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-muted-foreground">/100</div>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                score >= 80 ? 'bg-green-400' :
                score >= 65 ? 'bg-blue-400' :
                score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
