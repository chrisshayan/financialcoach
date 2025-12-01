'use client';

import { CalculationResult } from '@/types/chat';
import { DTIGauge } from './DTIGauge';
import { ReadinessScoreChart } from './ReadinessScoreChart';
import { SavingsProgress } from './SavingsProgress';
import { TransactionAnalysis } from './TransactionAnalysis';

interface CalculationCardProps {
  result: CalculationResult;
}

export function CalculationCard({ result }: CalculationCardProps) {
  // DTI calculation card
  if (result.dti !== undefined && result.is_affordable === undefined) {
    const dti = result.dti || 0;
    const isGood = dti <= 43;
    
    return (
      <div className={`mt-3 p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
        isGood 
          ? 'bg-gradient-to-br from-green-950/40 via-green-950/20 to-transparent border-green-800/50 shadow-green-900/20' 
          : 'bg-gradient-to-br from-red-950/40 via-red-950/20 to-transparent border-red-800/50 shadow-red-900/20'
      }`}>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isGood ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <span className={`text-2xl ${isGood ? 'text-green-400' : 'text-red-400'}`}>
              {isGood ? '✓' : '⚠'}
            </span>
          </div>
          <span className="text-lg">Debt-to-Income Ratio</span>
        </h3>
        
        {/* DTI Gauge Visualization */}
        <DTIGauge dti={dti} />
        
        <div className="mt-4 space-y-2">
          {!isGood && (
            <div className="text-sm text-red-400 p-3 bg-red-950/30 border border-red-800/30 rounded-lg backdrop-blur-sm flex items-center gap-2 animate-pulse">
              <span className="text-lg">⚠️</span>
              <span>Exceeds recommended 43% limit</span>
            </div>
          )}
          {isGood && (
            <div className="text-sm text-green-400 p-3 bg-green-950/30 border border-green-800/30 rounded-lg backdrop-blur-sm flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>Within acceptable limits for most lenders</span>
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
          
          {/* Savings Progress if applicable */}
          {result.required_down_payment && result.current_savings !== undefined && (
            <SavingsProgress
              current={result.current_savings}
              target={result.required_down_payment}
              monthlyRate={800} // This could come from user context
            />
          )}
        </div>
      </div>
    );
  }
  
  // Transaction analysis card
  if (result.spending_by_category || result.overspending_alerts || result.peer_comparisons) {
    return <TransactionAnalysis analysis={result} />;
  }
  
  // Action plan card
  if (result.action_plan || result.goal || result.priority_actions) {
    // Action plan is handled by ActionPlan component
    return null;
  }
  
  // Readiness score card
  if (result.readiness_score !== undefined) {
    const score = result.readiness_score || 0;
    const breakdown = result.breakdown || {};
    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-400';
      if (score >= 65) return 'text-blue-400';
      if (score >= 50) return 'text-yellow-400';
      return 'text-red-400';
    };
    
    return (
      <div className="mt-3 p-6 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="font-semibold text-foreground text-lg">Readiness Score</h3>
        </div>
        
        {/* Pie Chart Visualization - only show if we have breakdown data */}
        {breakdown && Object.keys(breakdown).length > 0 && 
         (breakdown.dti_score || breakdown.credit_score || breakdown.savings_score || breakdown.employment_score) && (
          <ReadinessScoreChart breakdown={breakdown} totalScore={score} />
        )}
        
        {/* Overall Score Bar with enhanced styling */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Overall Score:</span>
            <div className={`text-3xl font-bold ${getScoreColor(score)} drop-shadow-lg`}>
              {score}/100
            </div>
          </div>
          <div className="relative w-full bg-muted/50 rounded-full h-4 overflow-hidden border border-border/50">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                score >= 65 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                score >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ width: `${score}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
