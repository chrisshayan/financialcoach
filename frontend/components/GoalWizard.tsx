'use client';

import { useState } from 'react';
import { Goal, GoalType } from './GoalManagement';

interface GoalWizardProps {
  onSave: (goal: Omit<Goal, 'id' | 'progress'>) => void;
  onCancel: () => void;
  existingGoal?: Goal;
}

const goalTypeOptions: Array<{ type: GoalType; name: string; icon: string; description: string }> = [
  { type: 'homeownership', name: 'Homeownership', icon: '🏠', description: 'Save for down payment and prepare for mortgage' },
  { type: 'retirement', name: 'Retirement', icon: '👴', description: 'Build retirement savings and plan for the future' },
  { type: 'education', name: 'Education', icon: '🎓', description: 'Save for college or education expenses' },
  { type: 'debt_payoff', name: 'Debt Payoff', icon: '💳', description: 'Pay off credit cards, loans, or other debt' },
  { type: 'emergency_fund', name: 'Emergency Fund', icon: '🆘', description: 'Build 3-6 months of expenses in savings' },
  { type: 'major_purchase', name: 'Major Purchase', icon: '🛒', description: 'Save for car, vacation, or other large purchase' }
];

export function GoalWizard({ onSave, onCancel, existingGoal }: GoalWizardProps) {
  const [step, setStep] = useState(existingGoal ? 2 : 1); // Skip to step 2 if editing existing goal
  const [goalType, setGoalType] = useState<GoalType>(existingGoal?.type || 'homeownership');
  const [name, setName] = useState(existingGoal?.name || '');
  const [targetAmount, setTargetAmount] = useState(existingGoal?.targetAmount || 0);
  const [currentAmount, setCurrentAmount] = useState(existingGoal?.currentAmount || 0);
  const [targetDate, setTargetDate] = useState(existingGoal?.targetDate || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(existingGoal?.priority || 'medium');
  const [monthlyContribution, setMonthlyContribution] = useState(existingGoal?.monthlyContribution || 0);

  const selectedGoalConfig = goalTypeOptions.find(o => o.type === goalType);

  const handleSave = () => {
    const goal: Omit<Goal, 'id' | 'progress'> = {
      type: goalType,
      name: name || selectedGoalConfig?.name || 'New Goal',
      targetAmount,
      currentAmount,
      targetDate: targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority,
      status: 'active',
      monthlyContribution,
      icon: selectedGoalConfig?.icon || '🎯',
      color: 'blue'
    };
    onSave(goal);
  };

  const calculateMonths = () => {
    if (!targetDate) return 0;
    const target = new Date(targetDate);
    const now = new Date();
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(months, 1);
  };

  const calculateRequiredMonthly = () => {
    const months = calculateMonths();
    if (months === 0) return 0;
    const remaining = targetAmount - currentAmount;
    return remaining / months;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {existingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        {/* Step 1: Goal Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground mb-4">Choose Goal Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {goalTypeOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => {
                    setGoalType(option.type);
                    setStep(2);
                  }}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    goalType === option.type
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/20 hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-semibold text-foreground mb-1">{option.name}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Goal Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(1)} className="text-primary">← Back</button>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">Goal Details</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Goal Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedGoalConfig?.name}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Current Amount ($)
                </label>
                <input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            {targetAmount > currentAmount && targetDate && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-sm text-foreground mb-2">
                  <strong>Required monthly savings:</strong> ${calculateRequiredMonthly().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-muted-foreground">
                  Based on {calculateMonths()} months until target date
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      priority === p
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Monthly Contribution (Optional)
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                placeholder="Auto-calculated if left empty"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-muted/50 hover:bg-muted/70 rounded-lg text-foreground font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Save Goal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

