'use client';

import { useState, useMemo } from 'react';
import { AITransparency } from './AITransparency';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CreditAction {
  name: string;
  impact: number;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  confidenceScore?: number;
  dataSources?: string[];
  targetDate?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  progress?: number;
  dueDate?: string;
}

interface CreditImprovementPlanProps {
  currentScore: number;
  actions: CreditAction[];
}

function parseTimelineToDays(timeline: string): number {
  // Parse "1-2 months" or "30 days" etc.
  const lower = timeline.toLowerCase();
  if (lower.includes('month')) {
    const match = lower.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) * 30;
    }
  }
  if (lower.includes('day')) {
    const match = lower.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  if (lower.includes('week')) {
    const match = lower.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) * 7;
    }
  }
  return 90; // Default to 3 months
}

function categorizeAction(action: CreditAction): 'immediate' | 'short_term' | 'long_term' {
  const days = parseTimelineToDays(action.timeline);
  if (days <= 30) return 'immediate';
  if (days <= 90) return 'short_term';
  return 'long_term';
}

function getStatusIcon(status?: string): string {
  switch (status) {
    case 'completed':
      return '✓';
    case 'in_progress':
      return '🔄';
    default:
      return '⏳';
  }
}

function getStatusColor(status?: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-400';
    case 'in_progress':
      return 'text-blue-400';
    default:
      return 'text-yellow-400';
  }
}

function getCategoryTheme(category: string): string {
  switch (category) {
    case 'immediate':
      return 'border-red-500/50 bg-red-950/20';
    case 'short_term':
      return 'border-yellow-500/50 bg-yellow-950/20';
    case 'long_term':
      return 'border-green-500/50 bg-green-950/20';
    default:
      return 'border-border bg-muted/20';
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'immediate':
      return 'Immediate Actions (0-30 days)';
    case 'short_term':
      return 'Short-term Goals (1-3 months)';
    case 'long_term':
      return 'Long-term Strategy (3-12 months)';
    default:
      return category;
  }
}

export function CreditImprovementPlan({ currentScore, actions }: CreditImprovementPlanProps) {
  const [selectedAction, setSelectedAction] = useState<CreditAction | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set());
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());

  // Calculate projected score
  const totalImpact = actions.reduce((sum, action, idx) => {
    if (completedActions.has(idx)) return sum; // Don't count completed actions
    return sum + action.impact;
  }, 0);
  const projectedScore = Math.min(850, currentScore + totalImpact);
  const pointsToGo = Math.max(0, projectedScore - currentScore);
  
  // Estimate timeline (use max timeline from actions)
  const maxTimelineDays = Math.max(...actions.map(a => parseTimelineToDays(a.timeline)));
  const estimatedMonths = Math.ceil(maxTimelineDays / 30);

  // Categorize actions
  const categorizedActions = useMemo(() => {
    const immediate: Array<{ action: CreditAction; index: number }> = [];
    const short_term: Array<{ action: CreditAction; index: number }> = [];
    const long_term: Array<{ action: CreditAction; index: number }> = [];

    actions.forEach((action, index) => {
      const category = categorizeAction(action);
      const item = { action, index };
      if (category === 'immediate') immediate.push(item);
      else if (category === 'short_term') short_term.push(item);
      else long_term.push(item);
    });

    return { immediate, short_term, long_term };
  }, [actions]);

  // Generate projection data
  const projectionData = useMemo(() => {
    const data = [];
    const months = 12;
    const monthlyImpact = totalImpact / estimatedMonths;
    
    for (let i = 0; i <= months; i++) {
      const monthName = new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' });
      const projected = Math.min(850, currentScore + (monthlyImpact * Math.min(i, estimatedMonths)));
      data.push({
        month: monthName,
        current: i === 0 ? currentScore : null,
        projected: projected,
        historical: i <= 3 ? currentScore + (i * 2) : null, // Mock historical data
      });
    }
    return data;
  }, [currentScore, totalImpact, estimatedMonths]);

  const toggleAction = (index: number) => {
    setCompletedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleExpand = (index: number) => {
    setExpandedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getActionStatus = (index: number): 'pending' | 'in_progress' | 'completed' => {
    if (completedActions.has(index)) return 'completed';
    const action = actions[index];
    return action.status || 'pending';
  };

  const getActionProgress = (index: number): number => {
    if (completedActions.has(index)) return 100;
    const action = actions[index];
    return action.progress || 0;
  };

  const totalActions = actions.length;
  const completedCount = completedActions.size;
  const progressPercentage = Math.round((completedCount / totalActions) * 100);

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-purple-950/20 to-purple-900/10 border border-purple-800/50 rounded-xl space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-2">
          <span className="text-2xl">📈</span>
          Credit Building Action Plan
        </h3>
      </div>

      {/* Progress Dashboard - 4 Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Current Score</div>
          <div className="text-3xl font-bold text-foreground">{currentScore}</div>
          <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
            <span>↗</span>
            <span>+{totalImpact} potential</span>
          </div>
        </div>
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Target Score</div>
          <div className="text-3xl font-bold text-green-400">{projectedScore}</div>
          <div className="w-full bg-muted/50 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentScore - 300) / (projectedScore - 300)) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Points to Go</div>
          <div className="text-3xl font-bold text-foreground">{pointsToGo}</div>
          <div className="text-xs text-muted-foreground mt-1">Remaining points needed</div>
        </div>
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Estimated Timeline</div>
          <div className="text-3xl font-bold text-foreground">{estimatedMonths}</div>
          <div className="text-xs text-muted-foreground mt-1">Months to reach target</div>
        </div>
      </div>

      {/* Credit Score Projection Chart */}
      <div className="bg-muted/20 border border-border rounded-lg p-4">
        <h4 className="text-lg font-semibold text-foreground mb-4">Credit Score Projection</h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[300, 850]} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="historical"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
              name="Historical"
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
              strokeDasharray="5 5"
              name="Projected"
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="#ffc658"
              fill="#ffc658"
              fillOpacity={0.6}
              name="Current"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Action Checklist Progress */}
      <div className="bg-muted/20 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">Action Checklist</h4>
          <div className="text-sm text-muted-foreground">
            {completedCount} of {totalActions} completed ({progressPercentage}%)
          </div>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Vertical Timeline by Category */}
      <div className="space-y-6">
        {(['immediate', 'short_term', 'long_term'] as const).map((category) => {
          const categoryActions = categorizedActions[category];
          if (categoryActions.length === 0) return null;

          return (
            <div key={category} className={`border rounded-lg p-4 ${getCategoryTheme(category)}`}>
              <h4 className="text-lg font-semibold text-foreground mb-4">
                {getCategoryLabel(category)}
              </h4>
              <div className="relative pl-8 space-y-6">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                
                {categoryActions.map(({ action, index }) => {
                  const status = getActionStatus(index);
                  const progress = getActionProgress(index);
                  const isExpanded = expandedActions.has(index);
                  const isCompleted = completedActions.has(index);

                  return (
                    <div key={index} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute left-[-1.5rem] top-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${getStatusColor(status)} bg-background`}>
                        <span className="text-sm">{getStatusIcon(status)}</span>
                      </div>

                      <div className="bg-background/50 border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={() => toggleAction(index)}
                                className="w-5 h-5 rounded border-border"
                              />
                              <h5 className="font-semibold text-foreground">{action.name}</h5>
                              <span className={`text-xs px-2 py-1 rounded-full border ${
                                action.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                'bg-blue-500/20 text-blue-400 border-blue-500/50'
                              }`}>
                                {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-muted/50 rounded-full h-2 mb-3">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isCompleted ? 'bg-green-500' : 'bg-primary'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            {isExpanded && (
                              <div className="mt-3 space-y-2 text-sm">
                                <p className="text-foreground/80">{action.reason}</p>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <span>📊</span>
                                    <span className="text-green-400 font-medium">+{action.impact} points</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span>⏱️</span>
                                    <span>{action.timeline}</span>
                                  </span>
                                  {action.targetDate && (
                                    <span className="flex items-center gap-1">
                                      <span>📅</span>
                                      <span>Target: {new Date(action.targetDate).toLocaleDateString()}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpand(index)}
                              className="px-3 py-1.5 bg-muted/50 hover:bg-muted/70 border border-border rounded-lg text-xs font-medium text-foreground transition-colors"
                            >
                              {isExpanded ? 'Less' : 'Details'}
                            </button>
                            <button
                              onClick={() => setSelectedAction(action)}
                              className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg text-xs font-medium text-primary transition-colors"
                            >
                              Why this?
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedAction && (
        <AITransparency
          explanation={{
            recommendation: selectedAction.name,
            primaryReason: selectedAction.reason,
            supportingFactors: [
              `Expected impact: +${selectedAction.impact} points`,
              `Timeline: ${selectedAction.timeline}`,
              `Priority: ${selectedAction.priority}`,
            ],
            riskFactors: [],
            timelineImpact: `This action is expected to take ${selectedAction.timeline} to show results.`,
            confidence: selectedAction.confidenceScore || 85,
            dataSources: selectedAction.dataSources || ['Credit Karma credit models'],
            alternatives: undefined,
          }}
          onClose={() => setSelectedAction(null)}
          isModal={true}
        />
      )}
    </div>
  );
}

