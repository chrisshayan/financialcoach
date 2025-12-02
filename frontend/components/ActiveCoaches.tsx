'use client';

import { Coach, Consent } from '@/types/coach';

interface ActiveCoachesProps {
  activeCoaches: Array<{ coach: Coach; consent: Consent }>;
  onRemoveCoach: (coachId: string) => void;
  onSelectCoach: (coachId: string | undefined) => void;
  selectedCoachId?: string;
  onBackToFinancial?: () => void;
}

export function ActiveCoaches({
  activeCoaches,
  onRemoveCoach,
  onSelectCoach,
  selectedCoachId,
  onBackToFinancial,
}: ActiveCoachesProps) {
  if (activeCoaches.length === 0) {
    return null;
  }

  const getTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Expiring soon';
    }
  };

  return (
    <div className="mb-4 p-4 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground text-sm">Active Coaches</h3>
        <span className="text-xs text-muted-foreground">{activeCoaches.length} connected</span>
      </div>
      <div className="space-y-2">
        {/* Financial Coach button - always visible when coaches are active */}
        <button
          onClick={() => {
            onSelectCoach(undefined);
            onBackToFinancial?.();
          }}
          className={`w-full text-left p-3 rounded-lg border transition-all ${
            selectedCoachId === undefined
              ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
              : 'border-border hover:border-primary/50 bg-muted/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <span className="font-medium text-foreground">Financial Coach</span>
            </div>
            {selectedCoachId !== undefined && (
              <span className="text-xs text-primary font-medium">Click to switch back</span>
            )}
          </div>
        </button>
        
        {/* Active specialized coaches */}
        <div className="flex flex-wrap gap-2">
          {activeCoaches.map(({ coach, consent }) => (
            <div
              key={coach.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                selectedCoachId === coach.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 bg-muted/20'
              }`}
              onClick={() => onSelectCoach(coach.id)}
            >
              <span className="text-lg">{coach.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">{coach.name}</div>
                <div className="text-xs text-muted-foreground">{getTimeRemaining(consent.expires_at)}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCoach(coach.id);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                title="Remove coach"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

