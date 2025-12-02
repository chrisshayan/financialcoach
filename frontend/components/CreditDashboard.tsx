'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, Cell, Legend } from 'recharts';

interface CreditDashboardProps {
  data: {
    credit_score: number;
    credit_utilization: number;
    credit_history: number;
    payment_history: number;
    credit_mix: number;
    new_credit: number;
  };
}

function getScoreColor(score: number): string {
  if (score >= 800) return 'text-green-500';
  if (score >= 740) return 'text-green-400';
  if (score >= 670) return 'text-yellow-500';
  if (score >= 580) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreColorHex(score: number): string {
  if (score >= 800) return '#22c55e'; // green-500
  if (score >= 740) return '#4ade80'; // green-400
  if (score >= 670) return '#eab308'; // yellow-500
  if (score >= 580) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

function getScoreLabel(score: number): string {
  if (score >= 800) return 'Excellent';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
}

function getScoreRange(score: number): string {
  if (score >= 800) return '800-850';
  if (score >= 740) return '740-799';
  if (score >= 670) return '670-739';
  if (score >= 580) return '580-669';
  return '300-579';
}

function getFactorColor(value: number): string {
  if (value >= 80) return '#22c55e'; // green-500
  if (value >= 60) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}

export function CreditDashboard({ data }: CreditDashboardProps) {
  const { credit_score, credit_utilization, credit_history, payment_history, credit_mix, new_credit } = data;

  // Calculate credit factors - show actual percentages, not normalized scores
  // Payment History (35%), Utilization (30%), History (15%), Mix (10%), New Credit (10%)
  const paymentHistoryScore = payment_history; // Already a percentage
  // For utilization, lower is better, so we show the actual utilization % but score it inversely
  const utilizationScore = Math.max(0, 100 - (credit_utilization / 50) * 100); // Normalized score for display
  const historyScore = Math.min(100, (credit_history / 10) * 100); // 10+ years = 100%
  const mixScore = credit_mix >= 3 ? 100 : (credit_mix / 3) * 100; // 3+ types = 100%
  const newCreditScore = new_credit === 0 ? 100 : Math.max(0, 100 - (new_credit * 20)); // 0 inquiries = 100%

  const creditFactors = [
    {
      name: 'Payment History',
      value: paymentHistoryScore,
      displayValue: payment_history, // Show actual percentage
      target: 100,
      color: getFactorColor(paymentHistoryScore),
      weight: 35,
    },
    {
      name: 'Credit Utilization',
      value: utilizationScore,
      displayValue: credit_utilization, // Show actual utilization percentage
      target: 100,
      color: getFactorColor(utilizationScore),
      weight: 30,
      isInverse: true, // Lower is better
    },
    {
      name: 'Length of History',
      value: historyScore,
      displayValue: credit_history, // Show actual years
      target: 100,
      color: getFactorColor(historyScore),
      weight: 15,
      unit: 'yrs',
    },
    {
      name: 'Credit Mix',
      value: mixScore,
      displayValue: credit_mix, // Show actual number of types
      target: 100,
      color: getFactorColor(mixScore),
      weight: 10,
      unit: 'types',
    },
    {
      name: 'New Credit',
      value: newCreditScore,
      displayValue: new_credit, // Show actual inquiries
      target: 100,
      color: getFactorColor(newCreditScore),
      weight: 10,
      unit: 'inquiries',
    },
  ];

  // Calculate overall score percentage for radial gauge (300-850 scale)
  const scorePercentage = ((credit_score - 300) / (850 - 300)) * 100;

  return (
    <div className="mt-4 space-y-4">
      <div className="bg-gradient-to-br from-purple-950/20 to-purple-900/10 border border-purple-800/50 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-2">
            <span className="text-2xl">💳</span>
            Credit Score Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">Your credit health overview</p>
        </div>
        <div className="space-y-6">
          {/* Credit Score Radial Gauge - Simple single gauge (shadcn/ui style) */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative h-[280px] w-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="90%"
                  data={[
                    {
                      name: 'score',
                      value: scorePercentage,
                      fill: getScoreColorHex(credit_score),
                    },
                    {
                      name: 'remaining',
                      value: 100 - scorePercentage,
                      fill: 'hsl(var(--muted))',
                    },
                  ]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              {/* Center label with credit score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className={`text-6xl font-bold ${getScoreColor(credit_score)}`}>
                  {credit_score}
                </div>
                <div className="text-xl font-semibold text-foreground mt-2">
                  {getScoreLabel(credit_score)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Range: {getScoreRange(credit_score)}
                </div>
              </div>
            </div>
          </div>

          {/* Credit Factors Legend with Labels */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Credit Factors</h3>
            <div className="space-y-3">
              {creditFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: factor.color }}
                    />
                    <span className="text-sm text-foreground font-medium">
                      {factor.name}
                      <span className="text-muted-foreground ml-2">({factor.weight}%)</span>
                    </span>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: factor.color }}
                  >
                    {factor.unit 
                      ? `${factor.displayValue.toFixed(1)} ${factor.unit}`
                      : factor.isInverse
                      ? `${factor.displayValue.toFixed(1)}%`
                      : `${factor.displayValue.toFixed(0)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Credit Utilization</div>
              <div className={`text-2xl font-bold mt-1 ${credit_utilization <= 30 ? 'text-green-500' : credit_utilization <= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {credit_utilization.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {credit_utilization <= 30 ? 'Excellent' : credit_utilization <= 50 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Credit History</div>
              <div className="text-2xl font-bold mt-1 text-foreground">
                {credit_history.toFixed(1)} yrs
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {credit_history >= 7 ? 'Excellent' : credit_history >= 3 ? 'Good' : 'Building'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

