'use client';

interface ProgressStreaksProps {
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  onFreezeStreak?: () => void;
  freezeDaysRemaining?: number;
}

export function ProgressStreaks({ dailyStreak, weeklyStreak, monthlyStreak, onFreezeStreak, freezeDaysRemaining = 2 }: ProgressStreaksProps) {
  const getStreakEmoji = (days: number) => {
    if (days >= 365) return '🏆';
    if (days >= 100) return '💎';
    if (days >= 60) return '🔥';
    if (days >= 30) return '⭐';
    if (days >= 7) return '✨';
    return '🔥';
  };

  const getStreakColor = (days: number) => {
    if (days >= 100) return 'from-purple-500 to-purple-700';
    if (days >= 60) return 'from-blue-500 to-blue-700';
    if (days >= 30) return 'from-green-500 to-green-700';
    if (days >= 7) return 'from-yellow-500 to-yellow-700';
    return 'from-orange-500 to-orange-700';
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Progress Streaks</h3>
          <p className="text-xs text-muted-foreground">Keep your momentum going!</p>
        </div>
        <div className="text-2xl">{getStreakEmoji(dailyStreak)}</div>
      </div>

      {/* Daily Streak */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="font-semibold text-foreground">Daily Engagement</div>
              <div className="text-xs text-muted-foreground">Consecutive days using the app</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold bg-gradient-to-r ${getStreakColor(dailyStreak)} bg-clip-text text-transparent`}>
              {dailyStreak}
            </div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">
            {dailyStreak >= 7 ? '🔥 On fire!' : `Keep going! ${7 - dailyStreak} more days for Week Warrior badge`}
          </div>
          {freezeDaysRemaining > 0 && onFreezeStreak && (
            <button
              onClick={onFreezeStreak}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              Freeze streak ({freezeDaysRemaining} left)
            </button>
          )}
        </div>
      </div>

      {/* Weekly Streak */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <div className="font-semibold text-foreground">Weekly Consistency</div>
              <div className="text-xs text-muted-foreground">Weeks completing action plan items</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{weeklyStreak}</div>
            <div className="text-xs text-muted-foreground">weeks</div>
          </div>
        </div>
      </div>

      {/* Monthly Streak */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-semibold text-foreground">Monthly Progress</div>
              <div className="text-xs text-muted-foreground">Months of consistent engagement</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{monthlyStreak}</div>
            <div className="text-xs text-muted-foreground">months</div>
          </div>
        </div>
      </div>

      {/* Streak Rewards */}
      <div className="p-3 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/20">
        <div className="text-xs font-semibold text-foreground mb-1">Streak Rewards</div>
        <div className="text-xs text-muted-foreground space-y-1">
          {dailyStreak >= 7 && <div>✓ 7 days: Unlock advanced features</div>}
          {dailyStreak >= 30 && <div>✓ 30 days: Priority customer support</div>}
          {dailyStreak >= 100 && <div>✓ 100 days: Exclusive financial coaching session</div>}
          {dailyStreak < 7 && <div>→ 7 days: Unlock advanced features</div>}
        </div>
      </div>
    </div>
  );
}

