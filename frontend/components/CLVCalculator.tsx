'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CLVCalculatorProps {
  userContext?: {
    income?: { monthly_gross?: number; annual_gross?: number };
    savings?: { total?: number; monthly_savings_rate?: number };
    credit?: { score?: number };
    debts?: Array<{ type: string; balance?: number; monthly_payment?: number }>;
  };
  readinessScore?: number;
  dti?: number;
}

interface CLVProjection {
  year: number;
  totalValue: number;
  deposits: number;
  interest: number;
  products: number;
  services: number;
}

export function CLVCalculator({ userContext, readinessScore = 0, dti = 0 }: CLVCalculatorProps) {
  const monthlyIncome = userContext?.income?.monthly_gross || 0;
  const annualIncome = userContext?.income?.annual_gross || 0;
  const savings = userContext?.savings?.total || 0;
  const monthlySavings = userContext?.savings?.monthly_savings_rate || 0;
  const creditScore = userContext?.credit?.score || 0;

  // Calculate CLV over 5 years
  const calculateCLV = (): CLVProjection[] => {
    const projections: CLVProjection[] = [];
    let cumulativeValue = 0;
    let cumulativeDeposits = savings;
    let cumulativeInterest = 0;
    let cumulativeProducts = 0;
    let cumulativeServices = 0;

    // Base assumptions
    const annualIncomeGrowth = 0.03; // 3% annual growth
    const savingsRate = monthlySavings / monthlyIncome || 0.15; // Default 15%
    const interestRate = 0.045; // 4.5% APY on savings
    const mortgageAmount = annualIncome * 3.5; // Typical mortgage multiplier
    const mortgageRate = 0.065; // 6.5% mortgage rate
    const mortgageTerm = 30; // 30 years

    for (let year = 1; year <= 5; year++) {
      const currentAnnualIncome = annualIncome * Math.pow(1 + annualIncomeGrowth, year - 1);
      const currentMonthlyIncome = currentAnnualIncome / 12;
      const currentMonthlySavings = currentMonthlyIncome * savingsRate;

      // Deposits (savings accumulation)
      const yearDeposits = currentMonthlySavings * 12;
      cumulativeDeposits += yearDeposits;

      // Interest earned on savings
      const yearInterest = cumulativeDeposits * interestRate;
      cumulativeInterest += yearInterest;

      // Product revenue (mortgage, credit cards, etc.)
      let yearProducts = 0;
      if (year === 1 && readinessScore >= 70) {
        // Mortgage origination (estimated 1% of loan amount)
        yearProducts = mortgageAmount * 0.01;
      }
      if (year <= 2 && creditScore < 750) {
        // Credit card annual fees and interest
        yearProducts += 500;
      }
      cumulativeProducts += yearProducts;

      // Service revenue (insurance, investment management, etc.)
      let yearServices = 0;
      if (year >= 2 && readinessScore >= 75) {
        // Homeowners insurance
        yearServices += 1200;
      }
      if (year >= 3 && cumulativeDeposits > 50000) {
        // Investment management fees (0.5% AUM)
        yearServices += cumulativeDeposits * 0.005;
      }
      cumulativeServices += yearServices;

      cumulativeValue = cumulativeDeposits + cumulativeInterest + cumulativeProducts + cumulativeServices;

      projections.push({
        year,
        totalValue: cumulativeValue,
        deposits: cumulativeDeposits,
        interest: cumulativeInterest,
        products: cumulativeProducts,
        services: cumulativeServices
      });
    }

    return projections;
  };

  const projections = calculateCLV();
  const fiveYearCLV = projections[projections.length - 1].totalValue;
  const currentValue = savings;

  // Calculate CLV score (0-100)
  const calculateCLVScore = (): number => {
    let score = 0;
    
    // Income stability (30 points)
    if (annualIncome >= 100000) score += 30;
    else if (annualIncome >= 75000) score += 25;
    else if (annualIncome >= 50000) score += 20;
    else score += 10;

    // Savings rate (25 points)
    const savingsRate = monthlySavings / monthlyIncome || 0;
    if (savingsRate >= 0.25) score += 25;
    else if (savingsRate >= 0.20) score += 20;
    else if (savingsRate >= 0.15) score += 15;
    else if (savingsRate >= 0.10) score += 10;
    else score += 5;

    // Credit score (25 points)
    if (creditScore >= 750) score += 25;
    else if (creditScore >= 700) score += 20;
    else if (creditScore >= 650) score += 15;
    else score += 10;

    // Readiness (20 points)
    if (readinessScore >= 80) score += 20;
    else if (readinessScore >= 70) score += 15;
    else if (readinessScore >= 60) score += 10;
    else score += 5;

    return Math.min(score, 100);
  };

  const clvScore = calculateCLVScore();
  const clvTier = clvScore >= 80 ? 'Premium' : clvScore >= 65 ? 'High' : clvScore >= 50 ? 'Medium' : 'Standard';

  // Prepare chart data
  const chartData = projections.map(p => ({
    year: `Year ${p.year}`,
    'Total CLV': Math.round(p.totalValue),
    'Deposits': Math.round(p.deposits),
    'Interest': Math.round(p.interest),
    'Products': Math.round(p.products),
    'Services': Math.round(p.services)
  }));

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Customer Lifetime Value</h3>
          <p className="text-xs text-muted-foreground">5-year projected value based on your financial profile</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            clvScore >= 80 ? 'text-green-400' :
            clvScore >= 65 ? 'text-blue-400' :
            clvScore >= 50 ? 'text-yellow-400' : 'text-orange-400'
          }`}>
            {clvTier}
          </div>
          <div className="text-xs text-muted-foreground">CLV Tier</div>
        </div>
      </div>

      {/* CLV Score */}
      <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">CLV Score</span>
          <span className="text-lg font-bold text-primary">{clvScore}/100</span>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              clvScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
              clvScore >= 65 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
              clvScore >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'
            }`}
            style={{ width: `${clvScore}%` }}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Current Value</div>
          <div className="text-xl font-bold text-foreground">
            ${currentValue.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/30">
          <div className="text-xs text-muted-foreground mb-1">5-Year Projected CLV</div>
          <div className="text-xl font-bold text-primary">
            ${Math.round(fiveYearCLV).toLocaleString()}
          </div>
        </div>
      </div>

      {/* CLV Projection Chart */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Value Projection Over Time</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="year"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Total CLV"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Deposits"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="Interest"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Value Breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Value Breakdown (5 Years)</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
            <span className="text-sm text-muted-foreground">Deposits & Savings</span>
            <span className="text-sm font-semibold text-foreground">
              ${Math.round(projections[4].deposits).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
            <span className="text-sm text-muted-foreground">Interest Earned</span>
            <span className="text-sm font-semibold text-foreground">
              ${Math.round(projections[4].interest).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
            <span className="text-sm text-muted-foreground">Product Revenue</span>
            <span className="text-sm font-semibold text-foreground">
              ${Math.round(projections[4].products).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
            <span className="text-sm text-muted-foreground">Service Revenue</span>
            <span className="text-sm font-semibold text-foreground">
              ${Math.round(projections[4].services).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20">
        <div className="text-xs text-muted-foreground mb-1">💡 Insight</div>
        <div className="text-sm text-foreground">
          {clvScore >= 80 
            ? "You're a premium customer with strong financial health. Focus on maintaining your savings rate and credit score to maximize long-term value."
            : clvScore >= 65
            ? "You're on track to become a high-value customer. Increasing your savings rate by 5% could boost your 5-year CLV by 15-20%."
            : "Improving your credit score and increasing savings rate could significantly increase your customer lifetime value. Consider our credit builder products."
          }
        </div>
      </div>
    </div>
  );
}

