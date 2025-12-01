'use client';

import { useState } from 'react';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  provider: string;
  balance?: number;
  lastSync: string;
  status: 'connected' | 'syncing' | 'error';
  transactions?: number;
}

interface DataMeshProps {
  userContext?: {
    name?: string;
  };
}

const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Primary Checking',
    type: 'checking',
    provider: 'Chase Bank',
    balance: 8500,
    lastSync: 'Just now',
    status: 'connected',
    transactions: 45
  },
  {
    id: '2',
    name: 'Savings Account',
    type: 'savings',
    provider: 'Chase Bank',
    balance: 12000,
    lastSync: 'Just now',
    status: 'connected',
    transactions: 12
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit_card',
    provider: 'Chase Sapphire',
    balance: 3000,
    lastSync: '2 min ago',
    status: 'connected',
    transactions: 23
  },
  {
    id: '4',
    name: 'Investment Account',
    type: 'investment',
    provider: 'Fidelity',
    balance: 15000,
    lastSync: '5 min ago',
    status: 'syncing',
    transactions: 8
  }
];

const accountIcons = {
  checking: '🏦',
  savings: '💰',
  credit_card: '💳',
  investment: '📈',
  loan: '🏠'
};

const accountColors = {
  checking: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  savings: 'from-green-500/20 to-green-600/10 border-green-500/30',
  credit_card: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  investment: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  loan: 'from-red-500/20 to-red-600/10 border-red-500/30'
};

export function DataMesh({ userContext }: DataMeshProps) {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAccounts(prev => prev.map(acc => ({
      ...acc,
      lastSync: 'Just now',
      status: 'connected' as const
    })));
    setIsRefreshing(false);
  };

  const totalBalance = accounts
    .filter(acc => acc.type !== 'credit_card' && acc.type !== 'loan')
    .reduce((sum, acc) => sum + (acc.balance || 0), 0);
  
  const totalDebt = accounts
    .filter(acc => acc.type === 'credit_card' || acc.type === 'loan')
    .reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const connectedCount = accounts.filter(acc => acc.status === 'connected').length;
  const totalTransactions = accounts.reduce((sum, acc) => sum + (acc.transactions || 0), 0);

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Connected Accounts</h3>
          <p className="text-xs text-muted-foreground">Real-time data from your financial accounts</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg border border-primary/30 transition-colors disabled:opacity-50"
        >
          {isRefreshing ? 'Syncing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Total Balance</div>
          <div className="text-lg font-bold text-green-400">
            ${totalBalance.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Total Debt</div>
          <div className="text-lg font-bold text-red-400">
            ${totalDebt.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Accounts</div>
          <div className="text-lg font-bold text-foreground">
            {connectedCount}/{accounts.length}
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`p-4 bg-gradient-to-br ${accountColors[account.type]} border rounded-xl transition-all duration-200 hover:scale-[1.01]`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{accountIcons[account.type]}</div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{account.name}</div>
                  <div className="text-xs text-muted-foreground">{account.provider}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {account.status === 'connected' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-muted-foreground">{account.lastSync}</span>
                  </div>
                )}
                {account.status === 'syncing' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Syncing...</span>
                  </div>
                )}
                {account.status === 'error' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-red-400">Error</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              {account.balance !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Balance</div>
                  <div className={`text-lg font-bold ${
                    account.type === 'credit_card' || account.type === 'loan' 
                      ? 'text-red-400' 
                      : 'text-foreground'
                  }`}>
                    {account.type === 'credit_card' || account.type === 'loan' ? '-' : ''}
                    ${account.balance.toLocaleString()}
                  </div>
                </div>
              )}
              {account.transactions !== undefined && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-0.5">Transactions</div>
                  <div className="text-sm font-semibold text-foreground">
                    {account.transactions} this month
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Data Insights */}
      <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20">
        <div className="text-xs text-muted-foreground mb-1">📊 Data Insights</div>
        <div className="text-sm text-foreground">
          Analyzing {totalTransactions} transactions across {connectedCount} accounts in real-time. 
          Your financial data is automatically synchronized and used to provide personalized recommendations.
        </div>
      </div>

      {/* Add Account Button */}
      <button className="w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 border border-border rounded-xl transition-colors text-sm font-medium text-foreground">
        + Connect Another Account
      </button>
    </div>
  );
}

