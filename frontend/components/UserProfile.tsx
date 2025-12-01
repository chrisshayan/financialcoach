'use client';

interface UserProfileProps {
  userContext?: {
    name?: string;
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
  
  // Simulate account connection status
  const accountsConnected = 3; // Checking, Savings, Credit Card
  const lastSync = 'Just now'; // In real app, this would be actual timestamp
  
  return (
    <div className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
          <span className="text-primary text-xl">👤</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-base">
            {userContext.name || 'First-Time Home Buyer'}
          </h3>
          <p className="text-xs text-muted-foreground">Pre-application phase (6-24 months)</p>
        </div>
      </div>

      {/* Account Connection Status */}
      <div className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🔗</span>
            <span className="text-xs font-medium text-foreground">
              {accountsConnected} Accounts Connected
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">{lastSync}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Real-time data from your linked accounts
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-muted-foreground text-xs mb-1">Monthly Income</div>
          <div className="font-bold text-foreground text-lg">${monthlyIncome.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-muted-foreground text-xs mb-1">Savings</div>
          <div className="font-bold text-foreground text-lg">${savings.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-muted-foreground text-xs mb-1">Credit Score</div>
          <div className="font-bold text-foreground text-lg">{creditScore}</div>
        </div>
      </div>
    </div>
  );
}

