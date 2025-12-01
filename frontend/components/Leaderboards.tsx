'use client';

import { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  percentile: number;
  value: number;
  unit: string;
  isYou: boolean;
}

interface LeaderboardsProps {
  userContext?: any;
  dti?: number;
  savings?: number;
  creditScore?: number;
  monthlySavings?: number;
}

export function Leaderboards({ userContext, dti, savings, creditScore, monthlySavings }: LeaderboardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('savings');

  // Mock leaderboard data - in production, this would come from aggregated user data
  const generateLeaderboard = (category: string): LeaderboardEntry[] => {
    const entries: LeaderboardEntry[] = [];
    const yourValue = category === 'savings' ? (savings || 0) :
                     category === 'dti' ? (dti || 0) :
                     category === 'credit' ? (creditScore || 0) :
                     (monthlySavings || 0);

    // Generate mock entries around user's value
    for (let i = 0; i < 10; i++) {
      const isYou = i === 5; // User is in the middle
      const value = isYou ? yourValue : yourValue * (0.7 + Math.random() * 0.6);
      const percentile = 100 - (i * 10);

      entries.push({
        rank: i + 1,
        percentile,
        value: Math.round(value),
        unit: category === 'savings' ? '$' : category === 'dti' ? '%' : category === 'credit' ? '' : '$/mo',
        isYou
      });
    }

    return entries.sort((a, b) => {
      if (category === 'dti') return a.value - b.value; // Lower is better for DTI
      return b.value - a.value; // Higher is better for others
    });
  };

  const leaderboard = generateLeaderboard(selectedCategory);
  const yourRank = leaderboard.findIndex(e => e.isYou) + 1;
  const yourPercentile = leaderboard.find(e => e.isYou)?.percentile || 50;

  const categories = [
    { id: 'savings', name: 'Savings', icon: '💰' },
    { id: 'dti', name: 'DTI Improvement', icon: '📉' },
    { id: 'credit', name: 'Credit Score', icon: '📈' },
    { id: 'monthly', name: 'Monthly Savings', icon: '💵' }
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank <= 3) return 'text-blue-400';
    return 'text-foreground';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 90) return 'Top 10%';
    if (percentile >= 75) return 'Top 25%';
    if (percentile >= 50) return 'Top 50%';
    return 'Below 50%';
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Leaderboards</h3>
          <p className="text-xs text-muted-foreground">See how you rank (anonymized)</p>
        </div>
        <div className="text-2xl">🏆</div>
      </div>

      {/* Category Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`p-3 rounded-lg border transition-all ${
              selectedCategory === cat.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/30 hover:border-primary/50'
            }`}
          >
            <div className="text-xl mb-1">{cat.icon}</div>
            <div className="text-xs font-medium text-foreground">{cat.name}</div>
          </button>
        ))}
      </div>

      {/* Your Rank Highlight */}
      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Your Rank</div>
            <div className="text-2xl font-bold text-primary">#{yourRank}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Percentile</div>
            <div className="text-lg font-bold text-foreground">{getPercentileLabel(yourPercentile)}</div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-all ${
              entry.isYou
                ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
                : 'border-border bg-muted/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  entry.rank <= 3 ? 'bg-blue-500/20 text-blue-400' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {entry.rank === 1 ? '👑' : entry.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {entry.isYou ? 'You' : `User ${entry.rank}`}
                    </span>
                    {entry.isYou && <span className="text-xs text-primary">(You)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getPercentileLabel(entry.percentile)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getRankColor(entry.rank)}`}>
                  {entry.unit === '$' ? '$' : ''}
                  {entry.value.toLocaleString()}
                  {entry.unit === '%' ? '%' : ''}
                  {entry.unit === '/mo' ? '/mo' : ''}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground">
          🔒 <span className="text-foreground font-medium">Privacy Protected:</span> All data is anonymized. Your identity is never revealed.
        </p>
      </div>
    </div>
  );
}

