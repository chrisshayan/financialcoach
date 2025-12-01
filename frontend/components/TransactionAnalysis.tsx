'use client';

import { CalculationResult } from '@/types/chat';
import { ExportShare } from './ExportShare';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface TransactionAnalysisProps {
  analysis: CalculationResult;
}

const COLORS = {
  overspending: '#ef4444', // red-500
  onTrack: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
};

export function TransactionAnalysis({ analysis }: TransactionAnalysisProps) {
  if (!analysis.spending_by_category && !analysis.overspending_alerts) {
    return null;
  }

  const spendingByCategory = analysis.spending_by_category || {};
  const overspendingAlerts = analysis.overspending_alerts || [];
  const peerComparisons = analysis.peer_comparisons || {};
  const recommendations = analysis.recommendations || [];
  const summary = analysis.summary || '';

  // Prepare data for bar chart (spending vs peer average)
  const chartData = Object.entries(spendingByCategory)
    .filter(([category]) => peerComparisons[category])
    .map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      yourSpending: amount as number,
      peerAverage: peerComparisons[category]?.peer_average || 0,
      isOverBudget: peerComparisons[category]?.is_over_budget || false,
    }))
    .sort((a, b) => b.yourSpending - a.yourSpending);

  return (
    <div className="mt-3 p-6 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl shadow-lg backdrop-blur-sm space-y-6 transition-all duration-300 hover:shadow-xl relative">
      <div className="absolute top-4 right-4 z-10">
        <ExportShare
          data={{
            type: 'spending',
            title: 'Spending Analysis Report',
            content: analysis
          }}
        />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="font-semibold text-foreground text-xl">Spending Analysis</h3>
      </div>

      {/* Summary */}
      {summary && (
        <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20 backdrop-blur-sm">
          <p className="text-foreground text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-950/30 to-blue-950/10 border border-blue-800/30 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-900/20">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <span>💰</span>
            <span>Monthly Income</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            ${analysis.average_monthly_income?.toLocaleString() || 0}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-950/30 to-purple-950/10 border border-purple-800/30 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-900/20">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <span>💸</span>
            <span>Monthly Spending</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            ${analysis.total_monthly_spending?.toLocaleString() || 0}
          </div>
        </div>
        <div className={`p-4 bg-gradient-to-br rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg border ${
          (analysis.savings_rate_percentage || 0) >= 20 
            ? 'from-green-950/30 to-green-950/10 border-green-800/30 hover:shadow-green-900/20' 
            : 'from-yellow-950/30 to-yellow-950/10 border-yellow-800/30 hover:shadow-yellow-900/20'
        }`}>
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <span>📈</span>
            <span>Savings Rate</span>
          </div>
          <div className={`text-xl font-bold ${
            (analysis.savings_rate_percentage || 0) >= 20 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {analysis.savings_rate_percentage?.toFixed(1) || 0}%
          </div>
        </div>
      </div>

      {/* Overspending Alerts */}
      {overspendingAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-red-400">⚠️</span>
            Overspending Alerts
          </h4>
          {overspendingAlerts.map((alert: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-br from-red-950/40 to-red-950/20 border border-red-800/50 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/20 animate-pulse"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-red-400 capitalize">
                    {alert.category}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    You're spending {alert.over_by_percentage}% above peer average
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Your spending</div>
                  <div className="font-bold text-red-400">
                    ${alert.your_monthly?.toLocaleString()}/mo
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-red-800/30 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Peer average:</div>
                  <div className="text-foreground font-medium">
                    ${alert.peer_average?.toLocaleString()}/mo
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Potential annual savings:</div>
                  <div className="text-green-400 font-semibold">
                    ${alert.potential_savings?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spending Comparison Chart */}
      {chartData.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-4">Your Spending vs Peer Average</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="category"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="peerAverage" fill={COLORS.onTrack} name="Peer Average" />
              <Bar dataKey="yourSpending" fill={COLORS.overspending} name="Your Spending">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isOverBudget ? COLORS.overspending : COLORS.warning}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Spending Categories */}
      {analysis.top_spending_categories && analysis.top_spending_categories.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-3">Top Spending Categories</h4>
          <div className="space-y-2">
            {analysis.top_spending_categories.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
              >
                <span className="text-foreground capitalize">{item.category}</span>
                <span className="font-semibold text-foreground">
                  ${item.monthly_average?.toLocaleString()}/mo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span>💡</span>
            Recommendations
          </h4>
          <ul className="space-y-2">
            {recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

