'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface ScenarioPlannerProps {
  userContext?: {
    income?: { monthly_gross?: number };
    savings?: { total?: number; monthly_savings_rate?: number };
    credit?: { score?: number };
    debts?: Array<{ type: string; balance?: number; monthly_payment?: number }>;
  };
  currentReadiness?: number;
  currentDTI?: number;
}

interface Scenario {
  name: string;
  description: string;
  readinessScore: number;
  dti: number;
  monthsToGoal: number;
  savingsAtGoal: number;
  color: string;
}

export function ScenarioPlanner({ userContext, currentReadiness = 0, currentDTI = 0 }: ScenarioPlannerProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  
  const monthlyIncome = userContext?.income?.monthly_gross || 0;
  const currentSavings = userContext?.savings?.total || 0;
  const currentMonthlySavings = userContext?.savings?.monthly_savings_rate || 0;
  const creditScore = userContext?.credit?.score || 0;
  const debts = userContext?.debts || [];
  const currentMonthlyDebts = debts.reduce((sum, debt) => sum + (debt.monthly_payment || 0), 0);

  // Calculate scenarios
  const calculateScenarios = (): Scenario[] => {
    const scenarios: Scenario[] = [];

    // Scenario 1: Increase savings by $500/month
    const increasedSavings = currentMonthlySavings + 500;
    const newSavingsRate = increasedSavings / monthlyIncome;
    const targetSavings = 80000; // Down payment target
    const monthsToGoal1 = Math.ceil((targetSavings - currentSavings) / increasedSavings);
    const savingsAtGoal1 = currentSavings + (increasedSavings * monthsToGoal1);
    
    // Estimate readiness score improvement
    let readiness1 = currentReadiness;
    if (newSavingsRate >= 0.25) readiness1 += 10;
    else if (newSavingsRate >= 0.20) readiness1 += 7;
    else readiness1 += 5;
    readiness1 = Math.min(readiness1, 100);

    scenarios.push({
      name: 'Increase Savings $500/mo',
      description: 'Boost monthly savings by $500',
      readinessScore: readiness1,
      dti: currentDTI,
      monthsToGoal: monthsToGoal1,
      savingsAtGoal: savingsAtGoal1,
      color: '#10b981'
    });

    // Scenario 2: Pay off credit card debt
    const creditCardDebt = debts.find(d => d.type === 'credit_card');
    if (creditCardDebt) {
      const reducedDebtPayment = creditCardDebt.monthly_payment || 0;
      const newDTI = ((currentMonthlyDebts - reducedDebtPayment) / monthlyIncome) * 100;
      const monthsToPayoff = Math.ceil((creditCardDebt.balance || 0) / (reducedDebtPayment + 300));
      const monthsToGoal2 = Math.max(monthsToPayoff, Math.ceil((80000 - currentSavings) / currentMonthlySavings));
      
      let readiness2 = currentReadiness;
      if (newDTI <= 36) readiness2 += 8;
      else if (newDTI <= 40) readiness2 += 5;
      else readiness2 += 3;
      if (creditScore < 750) readiness2 += 5; // Credit score improvement
      readiness2 = Math.min(readiness2, 100);

      scenarios.push({
        name: 'Pay Off Credit Card',
        description: 'Eliminate credit card debt',
        readinessScore: readiness2,
        dti: newDTI,
        monthsToGoal: monthsToGoal2,
        savingsAtGoal: currentSavings + (currentMonthlySavings * monthsToGoal2),
        color: '#3b82f6'
      });
    }

    // Scenario 3: Increase income by 10%
    const increasedIncome = monthlyIncome * 1.1;
    const newDTI3 = (currentMonthlyDebts / increasedIncome) * 100;
    const newSavingsRate3 = currentMonthlySavings / increasedIncome;
    const increasedSavings3 = currentMonthlySavings + (monthlyIncome * 0.1 * 0.5); // Save 50% of increase
    const monthsToGoal3 = Math.ceil((80000 - currentSavings) / increasedSavings3);
      
    let readiness3 = currentReadiness;
    if (newDTI3 <= 36) readiness3 += 5;
    if (newSavingsRate3 >= 0.20) readiness3 += 5;
    readiness3 = Math.min(readiness3, 100);

    scenarios.push({
      name: 'Increase Income 10%',
      description: 'Get a 10% raise or side income',
      readinessScore: readiness3,
      dti: newDTI3,
      monthsToGoal: monthsToGoal3,
      savingsAtGoal: currentSavings + (increasedSavings3 * monthsToGoal3),
      color: '#f59e0b'
    });

    // Scenario 4: Aggressive savings (save 30% of income)
    const aggressiveSavings = monthlyIncome * 0.30;
    const monthsToGoal4 = Math.ceil((80000 - currentSavings) / aggressiveSavings);
      
    let readiness4 = currentReadiness;
    readiness4 += 15; // Significant savings boost
    readiness4 = Math.min(readiness4, 100);

    scenarios.push({
      name: 'Aggressive Savings',
      description: 'Save 30% of income',
      readinessScore: readiness4,
      dti: currentDTI,
      monthsToGoal: monthsToGoal4,
      savingsAtGoal: currentSavings + (aggressiveSavings * monthsToGoal4),
      color: '#8b5cf6'
    });

    return scenarios;
  };

  const scenarios = calculateScenarios();

  // Chart data for comparison
  const chartData = [
    {
      scenario: 'Current',
      readiness: currentReadiness,
      dti: currentDTI,
      months: Math.ceil((80000 - currentSavings) / currentMonthlySavings) || 24
    },
    ...scenarios.map(s => ({
      scenario: s.name.split(' ')[0], // Short name
      readiness: s.readinessScore,
      dti: s.dti,
      months: s.monthsToGoal
    }))
  ];

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Scenario Planning</h3>
        <p className="text-xs text-muted-foreground">Compare different strategies to reach your homeownership goal</p>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario, index) => (
          <div
            key={index}
            onClick={() => setSelectedScenario(selectedScenario === scenario.name ? null : scenario.name)}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
              selectedScenario === scenario.name
                ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg'
                : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground text-sm">{scenario.name}</h4>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: scenario.color }}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">{scenario.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Readiness Score</span>
                <span className="font-semibold text-foreground">
                  {scenario.readinessScore} 
                  <span className="text-green-400 ml-1">
                    (+{scenario.readinessScore - currentReadiness})
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">DTI</span>
                <span className="font-semibold text-foreground">
                  {scenario.dti.toFixed(1)}%
                  {scenario.dti < currentDTI && (
                    <span className="text-green-400 ml-1">
                      ({((scenario.dti - currentDTI) / currentDTI * 100).toFixed(0)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Time to Goal</span>
                <span className="font-semibold text-foreground">
                  {scenario.monthsToGoal} months
                  {scenario.monthsToGoal < 24 && (
                    <span className="text-green-400 ml-1">
                      ({24 - scenario.monthsToGoal} months faster)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Savings at Goal</span>
                <span className="font-semibold text-foreground">
                  ${Math.round(scenario.savingsAtGoal).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Scenario Comparison</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="scenario"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="readiness" fill="#3b82f6" name="Readiness Score" />
            <Bar yAxisId="right" dataKey="months" fill="#f59e0b" name="Months to Goal" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Scenario Details */}
      {selectedScenario && (
        <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20">
          <div className="text-sm font-semibold text-foreground mb-2">
            {scenarios.find(s => s.name === selectedScenario)?.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {scenarios.find(s => s.name === selectedScenario)?.description}
          </div>
          <div className="mt-3 text-xs text-foreground">
            This scenario could help you reach your homeownership goal{' '}
            {scenarios.find(s => s.name === selectedScenario)?.monthsToGoal && 
              scenarios.find(s => s.name === selectedScenario)!.monthsToGoal < 24
              ? `${24 - scenarios.find(s => s.name === selectedScenario)!.monthsToGoal} months faster`
              : 'on schedule'
            } and improve your readiness score by{' '}
            {scenarios.find(s => s.name === selectedScenario)?.readinessScore && 
              (scenarios.find(s => s.name === selectedScenario)!.readinessScore - currentReadiness)
            } points.
          </div>
        </div>
      )}
    </div>
  );
}

