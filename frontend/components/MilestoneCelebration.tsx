'use client';

import { useEffect, useState } from 'react';

interface MilestoneCelebrationProps {
  milestone: {
    id: string;
    title: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    icon: string;
  };
  onClose: () => void;
}

const tierColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600'
};

const tierGlow = {
  bronze: 'shadow-amber-500/50',
  silver: 'shadow-gray-400/50',
  gold: 'shadow-yellow-400/50',
  platinum: 'shadow-purple-400/50'
};

export function MilestoneCelebration({ milestone, onClose }: MilestoneCelebrationProps) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setConfetti(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Confetti Animation */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative bg-card border-2 border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-xl"
        >
          ✕
        </button>

        <div className="text-center space-y-6">
          {/* Icon with animation */}
          <div className="relative">
            <div
              className={`text-8xl mb-4 animate-bounce ${tierGlow[milestone.tier]}`}
              style={{ animationDuration: '1s' }}
            >
              {milestone.icon}
            </div>
            <div
              className={`absolute inset-0 bg-gradient-to-r ${tierColors[milestone.tier]} opacity-20 blur-3xl rounded-full`}
            />
          </div>

          {/* Title */}
          <div>
            <div className={`text-sm font-semibold uppercase tracking-wider mb-2 bg-gradient-to-r ${tierColors[milestone.tier]} bg-clip-text text-transparent`}>
              {milestone.tier} Milestone
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{milestone.title}</h2>
            <p className="text-muted-foreground">{milestone.description}</p>
          </div>

          {/* Celebration Message */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/20">
            <p className="text-foreground font-medium">
              🎉 Congratulations! You've reached a major milestone in your homeownership journey!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Continue Journey
            </button>
            <button
              onClick={() => {
                // Share functionality
                if (navigator.share) {
                  navigator.share({
                    title: `I just achieved: ${milestone.title}!`,
                    text: milestone.description,
                  });
                }
              }}
              className="px-4 py-2 bg-muted/50 text-foreground rounded-lg font-medium hover:bg-muted/70 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

