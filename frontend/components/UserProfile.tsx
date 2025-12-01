'use client';

interface UserProfileProps {
  userContext?: {
    income?: { monthly_gross?: number; annual_gross?: number };
    savings?: { total?: number };
    credit?: { score?: number };
  };
}

export function UserProfile({ userContext }: UserProfileProps) {
  if (!userContext) return null;
  
  const monthlyIncome = userContext.income?.monthly_gross || 0;
  const savings = userContext.savings?.total || 0;
  const creditScore = userContext.credit?.score || 0;
  
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary text-lg">👤</span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">First-Time Home Buyer</h3>
          <p className="text-xs text-muted-foreground">Pre-application phase (6-24 months)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground text-xs">Monthly Income</div>
          <div className="font-semibold text-foreground">${monthlyIncome.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Savings</div>
          <div className="font-semibold text-foreground">${savings.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Credit Score</div>
          <div className="font-semibold text-foreground">{creditScore}</div>
        </div>
      </div>
    </div>
  );
}

