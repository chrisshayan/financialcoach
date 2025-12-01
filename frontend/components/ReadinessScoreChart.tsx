'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ReadinessScoreChartProps {
  breakdown: {
    dti_score?: { points: number; max_points: number };
    credit_score?: { points: number; max_points: number };
    savings_score?: { points: number; max_points: number };
    employment_score?: { points: number; max_points: number };
  };
  totalScore: number;
}

const COLORS = {
  dti: '#3b82f6',      // Blue
  credit: '#10b981',   // Green
  savings: '#f59e0b',  // Amber
  employment: '#8b5cf6' // Purple
};

export function ReadinessScoreChart({ breakdown, totalScore }: ReadinessScoreChartProps) {
  // Ensure we have valid breakdown data
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return null;
  }
  
  const data = [
    {
      name: 'DTI Score',
      value: breakdown.dti_score?.points || 0,
      max: breakdown.dti_score?.max_points || 40,
      color: COLORS.dti
    },
    {
      name: 'Credit Score',
      value: breakdown.credit_score?.points || 0,
      max: breakdown.credit_score?.max_points || 30,
      color: COLORS.credit
    },
    {
      name: 'Savings Score',
      value: breakdown.savings_score?.points || 0,
      max: breakdown.savings_score?.max_points || 20,
      color: COLORS.savings
    },
    {
      name: 'Employment Score',
      value: breakdown.employment_score?.points || 0,
      max: breakdown.employment_score?.max_points || 10,
      color: COLORS.employment
    }
  ].filter(item => item.value > 0); // Only show segments with values

  const chartData = data.map(item => ({
    name: item.name,
    value: item.value,
    fill: item.color
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const item = data.payload;
      const maxValue = data.find((d: any) => d.name === item.name)?.max || 0;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value} / {maxValue} points
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalScore}</div>
              <div className="text-xs text-muted-foreground">/100</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className="text-foreground font-medium">{item.name}</div>
              <div className="text-muted-foreground">
                {item.value}/{item.max}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

