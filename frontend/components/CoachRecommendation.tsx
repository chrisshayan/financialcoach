'use client';

import { Coach } from '@/types/coach';

interface CoachRecommendationProps {
  coach: Coach;
  reason: string;
  onConnect: (coach: Coach) => void;
  onDismiss: () => void;
}

export function CoachRecommendation({ coach, reason, onConnect, onDismiss }: CoachRecommendationProps) {
  return (
    <div className="mt-3 p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl">{coach.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground">Connect with {coach.name}</h4>
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
              Marketplace
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{reason}</p>
          <p className="text-xs text-muted-foreground mb-3">
            Powered by <strong>{coach.powered_by}</strong>
          </p>

          <div className="mb-4">
            <div className="text-xs font-medium text-foreground mb-2">Capabilities:</div>
            <div className="flex flex-wrap gap-2">
              {coach.capabilities.slice(0, 3).map((capability, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-muted/30 rounded border border-border/50"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onConnect(coach)}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              Connect
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-muted/50 hover:bg-muted/70 text-foreground rounded-lg font-medium transition-colors text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

