'use client';

interface SavingsProgressProps {
  current: number;
  target: number;
  monthlyRate?: number;
}

export function SavingsProgress({ current, target, monthlyRate = 800 }: SavingsProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);
  const monthsToGoal = monthlyRate > 0 ? Math.ceil(remaining / monthlyRate) : 0;
  
  return (
    <div className="mt-4 space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress to Down Payment</span>
          <span className="font-semibold text-foreground">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${percentage}%` }}
          >
            {percentage > 10 && (
              <span className="text-xs text-white font-medium">
                ${(current / 1000).toFixed(0)}k
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>${current.toLocaleString()}</span>
          <span>${target.toLocaleString()}</span>
        </div>
      </div>
      
      {remaining > 0 && (
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm text-foreground mb-1">
            <span className="font-semibold">${remaining.toLocaleString()}</span> remaining
          </div>
          {monthlyRate > 0 && (
            <div className="text-xs text-muted-foreground">
              At ${monthlyRate.toLocaleString()}/month, you'll reach your goal in{' '}
              <span className="font-semibold text-foreground">{monthsToGoal} months</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

