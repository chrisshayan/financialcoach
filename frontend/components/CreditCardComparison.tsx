'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface CreditCard {
  name: string;
  apr: number;
  annualFee: number;
  rewardsRate: string;
  signUpBonus: string;
  foreignTransactionFee: string;
  creditScoreRequired: string;
  approvalOdds: string;
  approvalOddsPercent?: number;
  bestFor?: string;
  url?: string;
}

interface CreditCardComparisonProps {
  cards: CreditCard[];
}

function getBestValue(cards: CreditCard[], field: keyof CreditCard, isLowerBetter: boolean = false): number {
  if (cards.length === 0) return -1;
  
  if (field === 'apr' || field === 'annualFee') {
    const values = cards.map(c => typeof c[field] === 'number' ? c[field] as number : 0);
    return isLowerBetter 
      ? values.indexOf(Math.min(...values))
      : values.indexOf(Math.max(...values));
  }
  
  if (field === 'approvalOddsPercent') {
    const values = cards.map(c => c.approvalOddsPercent || 0);
    return values.indexOf(Math.max(...values));
  }
  
  return -1;
}

function parseApprovalOdds(odds: string): number {
  const match = odds.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function CreditCardComparison({ cards }: CreditCardComparisonProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  if (cards.length < 2) {
    return (
      <div className="mt-4 p-4 bg-muted/20 border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">Please select at least 2 cards to compare.</p>
      </div>
    );
  }

  const toggleRow = (rowKey: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowKey)) {
        newSet.delete(rowKey);
      } else {
        newSet.add(rowKey);
      }
      return newSet;
    });
  };

  // Prepare chart data
  const chartData = [
    {
      metric: 'APR',
      ...cards.reduce((acc, card, idx) => {
        acc[`Card ${idx + 1}`] = card.apr;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      metric: 'Annual Fee',
      ...cards.reduce((acc, card, idx) => {
        acc[`Card ${idx + 1}`] = card.annualFee;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      metric: 'Rewards Rate',
      ...cards.reduce((acc, card, idx) => {
        const rateMatch = card.rewardsRate.match(/(\d+\.?\d*)/);
        acc[`Card ${idx + 1}`] = rateMatch ? parseFloat(rateMatch[1]) : 0;
        return acc;
      }, {} as Record<string, number>)
    }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const comparisonRows = [
    { key: 'apr', label: 'APR', isLowerBetter: true, format: (val: any) => `${val}%` },
    { key: 'annualFee', label: 'Annual Fee', isLowerBetter: true, format: (val: any) => val === 0 ? '$0' : `$${val}` },
    { key: 'rewardsRate', label: 'Rewards Rate', isLowerBetter: false, format: (val: any) => val },
    { key: 'signUpBonus', label: 'Sign-up Bonus', isLowerBetter: false, format: (val: any) => val },
    { key: 'foreignTransactionFee', label: 'Foreign Transaction Fee', isLowerBetter: true, format: (val: any) => val },
    { key: 'creditScoreRequired', label: 'Credit Score Required', isLowerBetter: true, format: (val: any) => val },
    { key: 'approvalOdds', label: 'Approval Odds', isLowerBetter: false, format: (val: any) => val },
  ];

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-purple-950/20 to-purple-900/10 border border-purple-800/50 rounded-xl space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-2">
          <span className="text-2xl">💳</span>
          Credit Card Comparison
        </h3>
        <p className="text-sm text-muted-foreground">Compare {cards.length} credit cards side-by-side</p>
      </div>

      {/* Visual Comparison Chart */}
      <div className="bg-muted/20 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">Visual Comparison</h4>
          <div className="flex gap-2">
            {['APR', 'Annual Fee', 'Rewards Rate'].map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(selectedMetric === metric ? null : metric)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  selectedMetric === metric
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground hover:bg-muted/70'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
            <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {cards.map((_, idx) => (
              <Bar
                key={idx}
                dataKey={`Card ${idx + 1}`}
                fill={colors[idx % colors.length]}
                name={cards[idx].name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      <div className="bg-muted/20 border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                {cards.map((card, idx) => (
                  <th key={idx} className="text-center p-4 font-semibold text-foreground min-w-[200px]">
                    {card.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => {
                const bestIdx = getBestValue(cards, row.key as keyof CreditCard, row.isLowerBetter);
                const isExpanded = expandedRows.has(row.key);

                return (
                  <tr key={row.key} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => toggleRow(row.key)}
                        className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        <span>{isExpanded ? '▼' : '▶'}</span>
                        <span>{row.label}</span>
                      </button>
                    </td>
                    {cards.map((card, idx) => {
                      const value = card[row.key as keyof CreditCard];
                      const isBest = bestIdx === idx;
                      const displayValue = row.format(value);

                      return (
                        <td
                          key={idx}
                          className={`p-4 text-center text-sm ${
                            isBest
                              ? 'bg-green-500/20 text-green-400 font-semibold'
                              : 'text-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {displayValue}
                            {isBest && <span className="text-green-400">✓</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-background border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">{card.name}</h4>
            {card.bestFor && (
              <div className="text-sm text-muted-foreground mb-3">
                <span className="font-medium">Best for:</span> {card.bestFor}
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">APR:</span>
                <span className="text-foreground font-medium">{card.apr}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual Fee:</span>
                <span className="text-foreground font-medium">
                  {card.annualFee === 0 ? '$0' : `$${card.annualFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rewards:</span>
                <span className="text-foreground font-medium">{card.rewardsRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sign-up Bonus:</span>
                <span className="text-foreground font-medium">{card.signUpBonus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approval Odds:</span>
                <span className="text-foreground font-medium">{card.approvalOdds}</span>
              </div>
            </div>
            {card.url && (
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full px-4 py-2 bg-primary text-primary-foreground text-center rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Apply Now
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

