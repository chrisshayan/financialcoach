'use client';

import { useState, useEffect } from 'react';

interface RateAlert {
  id: string;
  type: 'drop' | 'low' | 'lock_recommendation';
  title: string;
  message: string;
  currentRate: number;
  previousRate?: number;
  potentialSavings?: number;
  timestamp: Date;
  actionUrl?: string;
}

interface RateDropAlertsProps {
  userContext?: any;
  onDismiss?: (id: string) => void;
}

export function RateDropAlerts({ userContext, onDismiss }: RateDropAlertsProps) {
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [currentRate, setCurrentRate] = useState(6.75);

  useEffect(() => {
    // Simulate rate monitoring - in production, this would come from an API
    const mockAlerts: RateAlert[] = [
      {
        id: '1',
        type: 'drop',
        title: 'Mortgage Rates Dropped!',
        message: 'Rates decreased by 0.25% - You could save $50/month on your mortgage',
        currentRate: 6.50,
        previousRate: 6.75,
        potentialSavings: 50,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'low',
        title: 'Rates at 6-Month Low',
        message: 'Current rates are at their lowest in 6 months. Good time to consider pre-approval.',
        currentRate: 6.50,
        timestamp: new Date(Date.now() - 86400000),
      }
    ];

    setAlerts(mockAlerts);
    setCurrentRate(6.50);
  }, []);

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    onDismiss?.(id);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className="p-4 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 rounded-xl"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📉</div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{alert.title}</h4>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3">
            {alert.previousRate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Previous:</span>
                <span className="text-sm font-semibold text-muted-foreground">{alert.previousRate}%</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-sm font-bold text-green-400">{alert.currentRate}%</span>
              </div>
            )}
            {alert.potentialSavings && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Potential savings:</span>
                <span className="text-sm font-bold text-green-400">${alert.potentialSavings}/month</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Check Pre-Approval
            </button>
            <button className="px-4 py-2 bg-muted/50 text-foreground rounded-lg text-sm font-medium hover:bg-muted/70 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

