'use client';

import { useState, useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface CreditScoreSimulatorProps {
  currentScore: number;
  creditUtilization: number;
  creditHistory: number;
  paymentHistory: number;
  creditMix: number;
  newCredit: number;
  totalDebt?: number;
  creditLimit?: number;
  isModal?: boolean;
  onClose?: () => void;
}

interface CreditScoreSimulatorProps {
  currentScore: number;
  creditUtilization: number;
  creditHistory: number;
  paymentHistory: number;
  creditMix: number;
  newCredit: number;
  totalDebt?: number;
  creditLimit?: number;
}

interface SimulatorState {
  payOffDebt: number;
  openNewCard: boolean;
  newCardLimit: number;
  closeAccount: string;
  increaseLimit: number;
  onTimePayments: boolean;
  paymentMonths: number;
}

interface ImpactFactor {
  name: string;
  impact: number;
  description: string;
}

function getScoreColorHex(score: number): string {
  if (score >= 800) return '#22c55e';
  if (score >= 740) return '#4ade80';
  if (score >= 670) return '#eab308';
  if (score >= 580) return '#f97316';
  return '#ef4444';
}

function calculateScoreImpact(
  currentScore: number,
  state: SimulatorState,
  props: CreditScoreSimulatorProps
): { projectedScore: number; impacts: ImpactFactor[] } {
  const impacts: ImpactFactor[] = [];
  let scoreChange = 0;

  // Pay off debt impact (reduces utilization)
  if (state.payOffDebt > 0) {
    const utilizationReduction = (state.payOffDebt / (props.creditLimit || 10000)) * 100;
    const utilizationImpact = Math.min(utilizationReduction * 0.3, 15); // Max 15 points
    scoreChange += utilizationImpact;
    impacts.push({
      name: 'Pay Off Debt',
      impact: Math.round(utilizationImpact),
      description: `Paying off $${state.payOffDebt.toLocaleString()} reduces utilization`
    });
  }

  // Open new card impact (increases available credit, but adds inquiry)
  if (state.openNewCard) {
    const limitIncrease = (state.newCardLimit / (props.creditLimit || 10000)) * 100;
    const utilizationBenefit = Math.min(limitIncrease * 0.2, 10); // Max 10 points
    const inquiryPenalty = -5; // New inquiry penalty
    const netImpact = utilizationBenefit + inquiryPenalty;
    scoreChange += netImpact;
                    impacts.push({
                      name: 'Open New Card',
                      impact: Math.round(netImpact * 10) / 10, // Round to 1 decimal
                      description: `New $${state.newCardLimit.toLocaleString()} limit helps, but inquiry hurts`
                    });
  }

  // Close account impact (reduces available credit, may hurt history)
  if (state.closeAccount) {
    const historyPenalty = props.creditHistory < 3 ? -10 : -5;
    const limitReduction = -3; // Reduces available credit
    const netImpact = historyPenalty + limitReduction;
    scoreChange += netImpact;
                    impacts.push({
                      name: 'Close Account',
                      impact: Math.round(netImpact * 10) / 10, // Round to 1 decimal
                      description: 'Reduces available credit and may shorten history'
                    });
  }

  // Increase credit limit impact
  if (state.increaseLimit > 0) {
    const limitIncreaseImpact = Math.min(state.increaseLimit * 0.15, 8); // Max 8 points
    scoreChange += limitIncreaseImpact;
                    impacts.push({
                      name: 'Increase Credit Limit',
                      impact: Math.round(limitIncreaseImpact * 10) / 10, // Round to 1 decimal
                      description: `${state.increaseLimit}% limit increase improves utilization`
                    });
  }

  // On-time payments impact
  if (state.onTimePayments && state.paymentMonths > 0) {
    const paymentImpact = Math.min(state.paymentMonths * 2, 20); // Max 20 points
    scoreChange += paymentImpact;
                    impacts.push({
                      name: 'On-Time Payments',
                      impact: Math.round(paymentImpact * 10) / 10, // Round to 1 decimal
                      description: `${state.paymentMonths} months of perfect payments`
                    });
  }

  const projectedScore = Math.max(300, Math.min(850, currentScore + scoreChange));
  return { projectedScore, impacts };
}

function generateTimelineData(
  currentScore: number,
  projectedScore: number,
  months: number = 12
): Array<{ month: string; current: number; simulated: number }> {
  const data = [];
  const scoreChange = projectedScore - currentScore;
  const monthlyChange = scoreChange / months;

  for (let i = 0; i <= months; i++) {
    const month = i === 0 ? 'Now' : `Month ${i}`;
    const currentTrajectory = currentScore + (i * 2); // Baseline improvement
    const simulatedTrajectory = currentScore + (i * monthlyChange);
    
    data.push({
      month,
      current: Math.round(currentTrajectory),
      simulated: Math.round(simulatedTrajectory)
    });
  }

  return data;
}

export function CreditScoreSimulator(props: CreditScoreSimulatorProps) {
  const [state, setState] = useState<SimulatorState>({
    payOffDebt: 0,
    openNewCard: false,
    newCardLimit: 5000,
    closeAccount: '',
    increaseLimit: 0,
    onTimePayments: false,
    paymentMonths: 6
  });

  const { projectedScore, impacts } = useMemo(
    () => calculateScoreImpact(props.currentScore, state, props),
    [props.currentScore, state, props]
  );

  const scoreChange = Math.round((projectedScore - props.currentScore) * 10) / 10; // Round to 1 decimal
  const timelineData = generateTimelineData(props.currentScore, projectedScore);

  const handleReset = () => {
    setState({
      payOffDebt: 0,
      openNewCard: false,
      newCardLimit: 5000,
      closeAccount: '',
      increaseLimit: 0,
      onTimePayments: false,
      paymentMonths: 6
    });
  };

  const currentScorePercentage = ((props.currentScore - 300) / (850 - 300)) * 100;
  const projectedScorePercentage = ((projectedScore - 300) / (850 - 300)) * 100;

  const content = (
    <div className={`${props.isModal ? '' : 'p-6'} ${props.isModal ? '' : 'bg-gradient-to-br from-purple-950/20 to-purple-900/10 border border-purple-800/50 rounded-xl'}`}>
      {!props.isModal && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            Credit Score Simulator
          </h3>
          <p className="text-sm text-muted-foreground">See how different actions affect your credit score</p>
        </div>
      )}

      <div className={`grid grid-cols-1 ${props.isModal ? 'xl:grid-cols-12' : 'lg:grid-cols-3'} gap-8`}>
        {/* Left Panel: Simulator Controls */}
        <div className={`space-y-6 ${props.isModal ? 'xl:col-span-3' : ''}`}>
          <h4 className={`${props.isModal ? 'text-xl' : 'text-lg'} font-semibold text-foreground mb-6`}>Simulator Controls</h4>
          
          {/* Pay off debt slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Pay Off Debt: ${state.payOffDebt.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={state.payOffDebt}
              onChange={(e) => setState({ ...state, payOffDebt: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>$10,000</span>
            </div>
          </div>

          {/* Open new card */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={state.openNewCard}
                onChange={(e) => setState({ ...state, openNewCard: e.target.checked })}
                className="rounded"
              />
              Open New Card
            </label>
            {state.openNewCard && (
              <div className="ml-6 space-y-2">
                <label className="text-xs text-muted-foreground">Credit Limit</label>
                <input
                  type="number"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={state.newCardLimit}
                  onChange={(e) => setState({ ...state, newCardLimit: parseInt(e.target.value) || 5000 })}
                  className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
                />
              </div>
            )}
          </div>

          {/* Close account */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Close Account</label>
            <select
              value={state.closeAccount}
              onChange={(e) => setState({ ...state, closeAccount: e.target.value })}
              className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="">None</option>
              <option value="oldest">Oldest Account</option>
              <option value="newest">Newest Account</option>
              <option value="low_limit">Low Limit Card</option>
            </select>
          </div>

          {/* Increase credit limit */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Increase Credit Limit: {state.increaseLimit}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={state.increaseLimit}
              onChange={(e) => setState({ ...state, increaseLimit: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* On-time payments */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={state.onTimePayments}
                onChange={(e) => setState({ ...state, onTimePayments: e.target.checked })}
                className="rounded"
              />
              Make On-Time Payments
            </label>
            {state.onTimePayments && (
              <div className="ml-6 space-y-2">
                <label className="text-xs text-muted-foreground">For {state.paymentMonths} months</label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={state.paymentMonths}
                  onChange={(e) => setState({ ...state, paymentMonths: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-muted/50 hover:bg-muted/70 text-foreground rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => alert('Scenario saved!')}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Save Scenario
            </button>
          </div>
        </div>

        {/* Center: Before/After Comparison */}
        <div className={`space-y-6 ${props.isModal ? 'xl:col-span-6' : ''}`}>
          <h4 className={`${props.isModal ? 'text-xl' : 'text-lg'} font-semibold text-foreground mb-6`}>Score Impact</h4>
          
          
          <div className={`grid ${props.isModal ? 'grid-cols-2' : 'grid-cols-2'} gap-6`}>
            {/* Before Card */}
            <div className="bg-muted/30 border border-border rounded-lg p-6">
              <div className={`${props.isModal ? 'text-base' : 'text-sm'} text-muted-foreground mb-3`}>Current Score</div>
              <div className={`relative ${props.isModal ? 'h-40' : 'h-32'} w-full`}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="80%"
                    data={[
                      { name: 'score', value: currentScorePercentage, fill: getScoreColorHex(props.currentScore) },
                      { name: 'remaining', value: 100 - currentScorePercentage, fill: 'hsl(var(--muted))' }
                    ]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`${props.isModal ? 'text-4xl' : 'text-3xl'} font-bold`} style={{ color: getScoreColorHex(props.currentScore) }}>
                    {props.currentScore}
                  </div>
                </div>
              </div>
            </div>

            {/* After Card */}
            <div className="bg-muted/30 border border-border rounded-lg p-6">
              <div className={`${props.isModal ? 'text-base' : 'text-sm'} text-muted-foreground mb-3`}>Projected Score</div>
              <div className={`relative ${props.isModal ? 'h-40' : 'h-32'} w-full`}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="80%"
                    data={[
                      { name: 'score', value: projectedScorePercentage, fill: getScoreColorHex(projectedScore) },
                      { name: 'remaining', value: 100 - projectedScorePercentage, fill: 'hsl(var(--muted))' }
                    ]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`${props.isModal ? 'text-4xl' : 'text-3xl'} font-bold`} style={{ color: getScoreColorHex(projectedScore) }}>
                    {projectedScore.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Indicator */}
          <div className={`text-center ${props.isModal ? 'p-8' : 'p-6'} rounded-lg border-2 ${
            scoreChange >= 0 
              ? 'bg-green-950/20 border-green-500/50' 
              : 'bg-red-950/20 border-red-500/50'
          }`}>
            <div className={`${props.isModal ? 'text-6xl' : 'text-5xl'} font-bold ${scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {scoreChange >= 0 ? '+' : ''}{scoreChange.toFixed(1)} points
            </div>
            <div className={`${props.isModal ? 'text-lg' : 'text-base'} text-muted-foreground mt-3`}>
              {scoreChange >= 0 ? 'Improvement' : 'Decline'}
            </div>
          </div>

          {/* Timeline Projection */}
          <div className="mt-10">
            <h5 className={`${props.isModal ? 'text-lg' : 'text-base'} font-semibold text-foreground mb-6`}>12-Month Projection</h5>
            <ResponsiveContainer width="100%" height={props.isModal ? 400 : 200}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis 
                  domain={[300, 850]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Current Trajectory"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="simulated" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Simulated Trajectory"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Panel: Impact Breakdown */}
        <div className={`space-y-6 ${props.isModal ? 'xl:col-span-3' : ''}`}>
          <h4 className={`${props.isModal ? 'text-xl' : 'text-lg'} font-semibold text-foreground mb-6`}>Impact Breakdown</h4>
          
          <div className="space-y-2">
            {impacts.length > 0 ? (
              impacts.map((impact, index) => (
                <div
                  key={index}
                  className={`${props.isModal ? 'p-4' : 'p-3'} rounded-lg border ${
                    impact.impact >= 0
                      ? 'bg-green-950/20 border-green-500/50'
                      : 'bg-red-950/20 border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${props.isModal ? 'text-base' : 'text-sm'} font-medium text-foreground`}>{impact.name}</span>
                    <span className={`${props.isModal ? 'text-base' : 'text-sm'} font-bold ${
                      impact.impact >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {impact.impact >= 0 ? '+' : ''}{impact.impact.toFixed(1)} pts
                    </span>
                  </div>
                  <p className={`${props.isModal ? 'text-sm' : 'text-xs'} text-muted-foreground`}>{impact.description}</p>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Adjust controls to see impact
              </div>
            )}
          </div>

          {/* Net Change Summary */}
          {impacts.length > 0 && (
            <div className={`mt-6 ${props.isModal ? 'p-6' : 'p-4'} bg-muted/30 border border-border rounded-lg`}>
              <div className={`${props.isModal ? 'text-base' : 'text-sm'} text-muted-foreground mb-2`}>Net Change</div>
              <div className={`${props.isModal ? 'text-4xl' : 'text-3xl'} font-bold ${
                scoreChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {scoreChange >= 0 ? '+' : ''}{scoreChange.toFixed(1)} points
              </div>
              <div className={`${props.isModal ? 'text-base' : 'text-sm'} text-muted-foreground mt-3`}>
                {props.currentScore} → {projectedScore.toFixed(0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If modal, wrap in overlay (similar to ConsentModal)
  if (props.isModal) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" 
          onClick={props.onClose}
        />
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div 
            className="bg-background border-2 border-primary/30 rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b border-border px-10 py-6 flex items-center justify-between z-10 shadow-sm rounded-t-2xl">
              <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                Credit Score Simulator
              </h2>
              <button
                onClick={props.onClose}
                className="text-muted-foreground hover:text-foreground transition-colors text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted/50"
              >
                ✕
              </button>
            </div>
            <div className="px-10 py-10">
              {content}
            </div>
          </div>
        </div>
      </>
    );
  }

  return content;
}

