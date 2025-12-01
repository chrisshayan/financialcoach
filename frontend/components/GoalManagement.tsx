'use client';

import { useState } from 'react';

export type GoalType = 'homeownership' | 'retirement' | 'education' | 'debt_payoff' | 'emergency_fund' | 'major_purchase';

export interface Goal {
  id: string;
  type: GoalType;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'paused' | 'completed';
  monthlyContribution?: number;
  progress: number;
  icon: string;
  color: string;
}

interface GoalManagementProps {
  goals: Goal[];
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const goalTypeConfig = {
  homeownership: { name: 'Homeownership', icon: '🏠', color: 'blue' },
  retirement: { name: 'Retirement', icon: '👴', color: 'purple' },
  education: { name: 'Education', icon: '🎓', color: 'green' },
  debt_payoff: { name: 'Debt Payoff', icon: '💳', color: 'red' },
  emergency_fund: { name: 'Emergency Fund', icon: '🆘', color: 'yellow' },
  major_purchase: { name: 'Major Purchase', icon: '🛒', color: 'orange' }
};

export function GoalManagement({ goals, onAddGoal, onEditGoal, onDeleteGoal, onToggleStatus }: GoalManagementProps) {
  const [selectedType, setSelectedType] = useState<GoalType | 'all'>('all');

  const filteredGoals = selectedType === 'all'
    ? goals
    : goals.filter(g => g.type === selectedType);

  const activeGoals = goals.filter(g => g.status === 'active');
  const totalProgress = activeGoals.reduce((sum, g) => sum + g.progress, 0) / (activeGoals.length || 1);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-950/20';
      case 'medium': return 'border-yellow-500/50 bg-yellow-950/20';
      default: return 'border-blue-500/50 bg-blue-950/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      default: return 'text-primary';
    }
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Financial Goals</h3>
          <p className="text-xs text-muted-foreground">
            {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onAddGoal}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {/* Overall Progress */}
      {activeGoals.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-lg font-bold text-primary">{totalProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted/50 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Goal Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedType === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
          }`}
        >
          All
        </button>
        {Object.entries(goalTypeConfig).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setSelectedType(type as GoalType)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedType === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <span>{config.icon}</span>
            <span>{config.name}</span>
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-sm">No goals yet. Add your first goal to get started!</p>
          </div>
        ) : (
          filteredGoals.map(goal => (
            <div
              key={goal.id}
              className={`p-4 rounded-lg border ${getPriorityColor(goal.priority)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{goal.icon}</div>
                  <div>
                    <h4 className="font-semibold text-foreground">{goal.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Target: ${goal.targetAmount.toLocaleString()} by {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(goal.status)} bg-muted/30`}>
                    {goal.status}
                  </span>
                  <button
                    onClick={() => onToggleStatus(goal.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-sm font-bold text-foreground">
                    ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      goal.progress >= 100 ? 'bg-green-500' :
                      goal.progress >= 75 ? 'bg-blue-500' :
                      goal.progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {goal.progress.toFixed(1)}% complete
                </div>
              </div>

              {/* Monthly Contribution */}
              {goal.monthlyContribution && (
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Monthly contribution:</span>
                  <span className="font-medium text-foreground">${goal.monthlyContribution.toLocaleString()}/mo</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEditGoal(goal)}
                  className="flex-1 px-3 py-1.5 bg-muted/50 hover:bg-muted/70 rounded-lg text-xs font-medium text-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

