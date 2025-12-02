'use client';

import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, RadialBarChart, RadialBar, Tooltip, XAxis, YAxis } from 'recharts';

interface CreditAlert {
  id: string;
  type: 'score_change' | 'inquiry' | 'utilization' | 'payment_due' | 'limit_increase';
  title: string;
  description: string;
  timestamp: string;
  impact?: number;
  severity: 'high' | 'medium' | 'low';
  dismissed?: boolean;
}

interface CreditMonitoringDashboardProps {
  currentScore: number;
  creditUtilization: number;
  scoreHistory?: Array<{ date: string; score: number }>;
  alerts?: CreditAlert[];
  perCardUtilization?: Array<{ cardName: string; utilization: number; limit: number }>;
}

function getAlertColor(type: CreditAlert['type']): string {
  switch (type) {
    case 'score_change':
      return 'bg-blue-950/20 border-blue-500/50';
    case 'inquiry':
      return 'bg-yellow-950/20 border-yellow-500/50';
    case 'utilization':
      return 'bg-red-950/20 border-red-500/50';
    case 'payment_due':
      return 'bg-orange-950/20 border-orange-500/50';
    case 'limit_increase':
      return 'bg-green-950/20 border-green-500/50';
    default:
      return 'bg-muted/20 border-border';
  }
}

function getAlertIcon(type: CreditAlert['type']): string {
  switch (type) {
    case 'score_change':
      return '📊';
    case 'inquiry':
      return '🔍';
    case 'utilization':
      return '⚠️';
    case 'payment_due':
      return '📅';
    case 'limit_increase':
      return '🎉';
    default:
      return '📢';
  }
}

function getUtilizationColor(utilization: number): string {
  if (utilization < 30) return '#22c55e'; // green
  if (utilization < 50) return '#eab308'; // yellow
  return '#ef4444'; // red
}

export function CreditMonitoringDashboard({
  currentScore,
  creditUtilization,
  scoreHistory = [],
  alerts = [],
  perCardUtilization = []
}: CreditMonitoringDashboardProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Generate mock score history if not provided (last 30 days)
  const mockScoreHistory = scoreHistory.length > 0 
    ? scoreHistory 
    : Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const variation = Math.random() * 10 - 5; // ±5 points variation
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: Math.max(300, Math.min(850, currentScore + variation))
        };
      });

  // Generate mock alerts if not provided
  const mockAlerts: CreditAlert[] = alerts.length > 0 ? alerts : [
    {
      id: '1',
      type: 'score_change',
      title: 'Credit Score Increased',
      description: `Your score increased by 5 points to ${currentScore}`,
      timestamp: '2 days ago',
      impact: 5,
      severity: 'low'
    },
    {
      id: '2',
      type: 'utilization',
      title: 'High Utilization Alert',
      description: `Your credit utilization is ${creditUtilization.toFixed(1)}%, above the recommended 30%`,
      timestamp: '5 days ago',
      severity: creditUtilization > 50 ? 'high' : 'medium'
    },
    {
      id: '3',
      type: 'payment_due',
      title: 'Payment Due Reminder',
      description: 'Your credit card payment is due in 3 days',
      timestamp: '1 week ago',
      severity: 'medium'
    }
  ];

  const activeAlerts = mockAlerts.filter(alert => !dismissedAlerts.has(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  // Calculate trend
  const trend = mockScoreHistory.length > 1
    ? mockScoreHistory[mockScoreHistory.length - 1].score - mockScoreHistory[0].score
    : 0;

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-purple-950/20 to-purple-900/10 border border-purple-800/50 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-2">
          <span className="text-2xl">🔔</span>
          Credit Monitoring Dashboard
        </h3>
        <p className="text-sm text-muted-foreground">Real-time alerts and credit health tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Alert Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-semibold text-foreground">Recent Alerts</h4>
          
          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-foreground">{alert.title}</h5>
                          {alert.impact && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              alert.impact >= 0
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {alert.impact >= 0 ? '+' : ''}{alert.impact} pts
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{alert.timestamp}</span>
                          <span className={`px-2 py-0.5 rounded ${
                            alert.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                            alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">✅</div>
              <p>No active alerts</p>
              <p className="text-xs mt-1">Your credit is in good shape!</p>
            </div>
          )}
        </div>

        {/* Right: Score Change Sparkline & Utilization Gauges */}
        <div className="space-y-6">
          {/* Score Change Sparkline */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Score Trend (30 Days)</h4>
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={mockScoreHistory}>
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={trend >= 0 ? '#22c55e' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`Score: ${value}`, '']}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-muted-foreground">
                  {mockScoreHistory[0]?.date} - {mockScoreHistory[mockScoreHistory.length - 1]?.date}
                </span>
                <span className={`font-semibold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(0)} pts
                </span>
              </div>
            </div>
          </div>

          {/* Utilization Alerts */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Utilization Alerts</h4>
            
            {/* Overall Utilization Gauge */}
            <div className="bg-muted/30 border border-border rounded-lg p-4 mb-3">
              <div className="text-sm text-muted-foreground mb-2">Overall Utilization</div>
              <div className="relative h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="50%"
                    outerRadius="80%"
                    data={[
                      {
                        name: 'utilization',
                        value: Math.min(creditUtilization, 100),
                        fill: getUtilizationColor(creditUtilization)
                      },
                      {
                        name: 'remaining',
                        value: Math.max(0, 100 - creditUtilization),
                        fill: 'hsl(var(--muted))'
                      }
                    ]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={5} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: getUtilizationColor(creditUtilization) }}
                    >
                      {creditUtilization.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {creditUtilization < 30 ? 'Excellent' : creditUtilization < 50 ? 'Good' : 'High'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Card Utilization (if any >50%) */}
            {perCardUtilization.length > 0 && perCardUtilization.some(card => card.utilization > 50) && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground mb-2">High Utilization Cards</div>
                {perCardUtilization
                  .filter(card => card.utilization > 50)
                  .map((card, index) => (
                    <div key={index} className="bg-red-950/20 border border-red-500/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{card.cardName}</span>
                        <span className="text-sm font-bold text-red-400">
                          {card.utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Limit: ${card.limit.toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

