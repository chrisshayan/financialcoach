'use client';

interface Benchmark {
  category: string;
  yourValue: number;
  peerAverage: number;
  percentile: number;
  unit: string;
  better: boolean;
}

interface PeerBenchmarksProps {
  userContext?: {
    income?: { monthly_gross?: number };
    savings?: { total?: number };
    credit?: { score?: number };
  };
  dti?: number;
  savings?: number;
  creditScore?: number;
  monthlySpending?: number;
}

export function PeerBenchmarks({ userContext, dti, savings, creditScore, monthlySpending }: PeerBenchmarksProps) {
  // Mock peer data - in production, this would come from aggregated user data
  const benchmarks: Benchmark[] = [
    {
      category: 'Debt-to-Income Ratio',
      yourValue: dti || 0,
      peerAverage: 38.5,
      percentile: dti ? (dti <= 36 ? 75 : dti <= 43 ? 50 : 25) : 0,
      unit: '%',
      better: dti ? dti <= 38.5 : false
    },
    {
      category: 'Total Savings',
      yourValue: savings || userContext?.savings?.total || 0,
      peerAverage: 18500,
      percentile: savings ? (savings >= 25000 ? 80 : savings >= 15000 ? 60 : 40) : 0,
      unit: '$',
      better: (savings || userContext?.savings?.total || 0) >= 18500
    },
    {
      category: 'Credit Score',
      yourValue: creditScore || userContext?.credit?.score || 0,
      peerAverage: 695,
      percentile: creditScore ? (creditScore >= 740 ? 85 : creditScore >= 700 ? 60 : 35) : 0,
      unit: '',
      better: (creditScore || userContext?.credit?.score || 0) >= 695
    },
    {
      category: 'Monthly Savings Rate',
      yourValue: userContext?.savings?.monthly_savings_rate || 0,
      peerAverage: 1200,
      percentile: (userContext?.savings?.monthly_savings_rate || 0) >= 1500 ? 70 : 50,
      unit: '$/mo',
      better: (userContext?.savings?.monthly_savings_rate || 0) >= 1200
    }
  ];

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 80) return 'Top 20%';
    if (percentile >= 60) return 'Top 40%';
    if (percentile >= 40) return 'Average';
    return 'Below Average';
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'text-green-400';
    if (percentile >= 60) return 'text-blue-400';
    if (percentile >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">How You Compare</h3>
          <p className="text-xs text-muted-foreground">Benchmarked against similar first-time homebuyers</p>
        </div>
        <div className="text-2xl">📊</div>
      </div>

      <div className="space-y-4">
        {benchmarks.map((benchmark, index) => (
          <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-foreground text-sm">{benchmark.category}</div>
              <div className={`text-xs font-semibold ${getPercentileColor(benchmark.percentile)}`}>
                {getPercentileLabel(benchmark.percentile)}
              </div>
            </div>

            <div className="space-y-2">
              {/* Your Value vs Peer Average */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${benchmark.better ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-muted-foreground">You</span>
                </div>
                <span className="font-bold text-foreground">
                  {benchmark.unit === '$' ? '$' : ''}
                  {benchmark.yourValue.toLocaleString()}
                  {benchmark.unit === '%' ? '%' : ''}
                  {benchmark.unit === '/mo' ? '/mo' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Peer Average</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {benchmark.unit === '$' ? '$' : ''}
                  {benchmark.peerAverage.toLocaleString()}
                  {benchmark.unit === '%' ? '%' : ''}
                  {benchmark.unit === '/mo' ? '/mo' : ''}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full bg-muted/50 rounded-full h-2 mt-3">
                <div
                  className={`absolute h-2 rounded-full transition-all ${
                    benchmark.better ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min((benchmark.yourValue / (benchmark.peerAverage * 1.5)) * 100, 100)}%`
                  }}
                />
                <div
                  className="absolute h-2 w-0.5 bg-foreground/50"
                  style={{ left: `${(benchmark.peerAverage / (benchmark.peerAverage * 1.5)) * 100}%` }}
                />
              </div>

              {/* Difference */}
              <div className="text-xs text-muted-foreground mt-2">
                {benchmark.better ? (
                  <span className="text-green-400">
                    ✓ You're {((benchmark.yourValue / benchmark.peerAverage - 1) * 100).toFixed(1)}% above average
                  </span>
                ) : (
                  <span className="text-red-400">
                    You're {((1 - benchmark.yourValue / benchmark.peerAverage) * 100).toFixed(1)}% below average
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-xs text-muted-foreground">
          💡 <span className="text-foreground font-medium">Tip:</span> These benchmarks are based on anonymized data from users with similar profiles. Use them as motivation to improve your financial health!
        </p>
      </div>
    </div>
  );
}

