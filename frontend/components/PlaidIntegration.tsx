'use client';

import { useState } from 'react';

interface ConnectedAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment';
  institution: string;
  lastSync: string;
  balance?: number;
  status: 'connected' | 'error' | 'syncing';
}

interface PlaidIntegrationProps {
  onAccountsUpdate?: (accounts: ConnectedAccount[]) => void;
}

export function PlaidIntegration({ onAccountsUpdate }: PlaidIntegrationProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPlaidLink, setShowPlaidLink] = useState(false);

  // Mock Plaid Link - In production, this would use the actual Plaid Link SDK
  const handleConnectAccount = async () => {
    setIsConnecting(true);
    setShowPlaidLink(true);

    // Simulate Plaid Link flow
    setTimeout(() => {
      // Mock successful connection
      const newAccount: ConnectedAccount = {
        id: `acc_${Date.now()}`,
        name: 'Primary Checking',
        type: 'checking',
        institution: 'Chase Bank',
        lastSync: 'Just now',
        balance: 8500,
        status: 'connected'
      };

      setConnectedAccounts(prev => [...prev, newAccount]);
      onAccountsUpdate?.([...connectedAccounts, newAccount]);
      setIsConnecting(false);
      setShowPlaidLink(false);
    }, 2000);
  };

  const handleDisconnect = (accountId: string) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    onAccountsUpdate?.(connectedAccounts.filter(acc => acc.id !== accountId));
  };

  const handleRefresh = async (accountId: string) => {
    setConnectedAccounts(prev =>
      prev.map(acc =>
        acc.id === accountId ? { ...acc, status: 'syncing' as const } : acc
      )
    );

    // Simulate sync
    setTimeout(() => {
      setConnectedAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId
            ? { ...acc, status: 'connected' as const, lastSync: 'Just now' }
            : acc
        )
      );
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Connected Accounts</h3>
          <p className="text-xs text-muted-foreground">
            Securely connect your financial accounts for real-time insights
          </p>
        </div>
        <div className="text-2xl">🔗</div>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
        <div className="flex items-start gap-2">
          <span className="text-xl">🔒</span>
          <div>
            <div className="font-semibold text-foreground text-sm mb-1">Bank-Level Security</div>
            <p className="text-xs text-muted-foreground">
              Your data is encrypted and secure. We use read-only access and never store your banking credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Connected Accounts List */}
      {connectedAccounts.length > 0 && (
        <div className="space-y-3">
          {connectedAccounts.map(account => (
            <div
              key={account.id}
              className="p-4 bg-muted/30 rounded-lg border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {account.type === 'checking' ? '🏦' :
                     account.type === 'savings' ? '💰' :
                     account.type === 'credit_card' ? '💳' : '📈'}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{account.name}</div>
                    <div className="text-xs text-muted-foreground">{account.institution}</div>
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
                    <span className="text-xs text-muted-foreground">Syncing...</span>
                  )}
                </div>
              </div>

              {account.balance !== undefined && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="font-bold text-foreground">
                    ${account.balance.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleRefresh(account.id)}
                  disabled={account.status === 'syncing'}
                  className="flex-1 px-3 py-1.5 bg-muted/50 hover:bg-muted/70 rounded-lg text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
                <button
                  onClick={() => handleDisconnect(account.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Account Button */}
      <button
        onClick={handleConnectAccount}
        disabled={isConnecting}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span>+</span>
            <span>Connect Account</span>
          </>
        )}
      </button>

      {/* Plaid Link Modal (Mock) */}
      {showPlaidLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Connect Your Bank</h3>
            <p className="text-sm text-muted-foreground mb-4">
              In production, this would open Plaid Link to securely connect your bank account.
            </p>
            <div className="p-4 bg-muted/30 rounded-lg mb-4">
              <div className="text-xs text-muted-foreground space-y-2">
                <div>✓ Search for your bank</div>
                <div>✓ Enter your credentials securely</div>
                <div>✓ Select accounts to connect</div>
                <div>✓ Verify connection</div>
              </div>
            </div>
            <button
              onClick={() => setShowPlaidLink(false)}
              className="w-full px-4 py-2 bg-muted/50 hover:bg-muted/70 rounded-lg text-foreground font-medium transition-colors"
            >
              Close (Demo Mode)
            </button>
          </div>
        </div>
      )}

      {/* Supported Institutions */}
      <div className="pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Supported by 12,000+ financial institutions including:</div>
        <div className="flex flex-wrap gap-2 text-xs">
          {['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One', 'US Bank'].map(bank => (
            <span key={bank} className="px-2 py-1 bg-muted/30 rounded text-muted-foreground">
              {bank}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

