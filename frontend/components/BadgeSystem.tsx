'use client';

import { useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'foundation' | 'financial' | 'engagement' | 'social';
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface BadgeSystemProps {
  userContext?: any;
  readinessScore?: number;
  dti?: number;
  savings?: number;
  engagementDays?: number;
}

const allBadges: Badge[] = [
  // Foundation Badges
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Completed initial financial assessment',
    icon: '👣',
    category: 'foundation',
    earned: false,
    rarity: 'common'
  },
  {
    id: 'profile_complete',
    name: 'Profile Complete',
    description: 'Connected all financial accounts',
    icon: '✅',
    category: 'foundation',
    earned: false,
    rarity: 'common'
  },
  {
    id: 'first_plan',
    name: 'First Plan',
    description: 'Created your first action plan',
    icon: '📋',
    category: 'foundation',
    earned: false,
    rarity: 'common'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Used the app 7 days in a row',
    icon: '🔥',
    category: 'foundation',
    earned: false,
    progress: 0,
    maxProgress: 7,
    rarity: 'common'
  },
  // Financial Health Badges
  {
    id: 'dti_champion',
    name: 'DTI Champion',
    description: 'Reduced DTI below 36%',
    icon: '🏆',
    category: 'financial',
    earned: false,
    rarity: 'rare'
  },
  {
    id: 'savings_star_10k',
    name: 'Savings Star',
    description: 'Saved $10,000',
    icon: '⭐',
    category: 'financial',
    earned: false,
    progress: 0,
    maxProgress: 10000,
    rarity: 'rare'
  },
  {
    id: 'savings_star_25k',
    name: 'Savings Superstar',
    description: 'Saved $25,000',
    icon: '🌟',
    category: 'financial',
    earned: false,
    progress: 0,
    maxProgress: 25000,
    rarity: 'epic'
  },
  {
    id: 'credit_climber',
    name: 'Credit Climber',
    description: 'Improved credit score by 20+ points',
    icon: '📈',
    category: 'financial',
    earned: false,
    rarity: 'rare'
  },
  {
    id: 'debt_destroyer',
    name: 'Debt Destroyer',
    description: 'Paid off all credit card debt',
    icon: '💪',
    category: 'financial',
    earned: false,
    rarity: 'epic'
  },
  // Engagement Badges
  {
    id: 'daily_checkin_30',
    name: 'Consistency King',
    description: '30-day engagement streak',
    icon: '👑',
    category: 'engagement',
    earned: false,
    progress: 0,
    maxProgress: 30,
    rarity: 'rare'
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Read 10 educational articles',
    icon: '📚',
    category: 'engagement',
    earned: false,
    progress: 0,
    maxProgress: 10,
    rarity: 'common'
  },
  {
    id: 'scenario_explorer',
    name: 'Scenario Explorer',
    description: 'Ran 5+ scenario analyses',
    icon: '🔮',
    category: 'engagement',
    earned: false,
    progress: 0,
    maxProgress: 5,
    rarity: 'common'
  },
  {
    id: 'goal_getter',
    name: 'Goal Getter',
    description: 'Completed 3 action plan milestones',
    icon: '🎯',
    category: 'engagement',
    earned: false,
    progress: 0,
    maxProgress: 3,
    rarity: 'rare'
  }
];

const rarityColors = {
  common: 'border-gray-500 bg-gray-900/30',
  rare: 'border-blue-500 bg-blue-900/30',
  epic: 'border-purple-500 bg-purple-900/30',
  legendary: 'border-yellow-500 bg-yellow-900/30'
};

const rarityGlow = {
  common: '',
  rare: 'shadow-blue-500/50',
  epic: 'shadow-purple-500/50',
  legendary: 'shadow-yellow-500/50'
};

export function BadgeSystem({ userContext, readinessScore, dti, savings, engagementDays }: BadgeSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  // Calculate earned badges based on user data
  const calculateBadges = (): Badge[] => {
    return allBadges.map(badge => {
      let earned = badge.earned;
      let progress = badge.progress || 0;

      switch (badge.id) {
        case 'first_steps':
          earned = readinessScore !== undefined;
          break;
        case 'profile_complete':
          earned = userContext?.accountsConnected >= 3;
          break;
        case 'first_plan':
          earned = userContext?.hasActionPlan || false;
          break;
        case 'week_warrior':
          progress = Math.min(engagementDays || 0, 7);
          earned = progress >= 7;
          break;
        case 'dti_champion':
          earned = dti !== undefined && dti <= 36;
          break;
        case 'savings_star_10k':
          progress = Math.min(savings || 0, 10000);
          earned = progress >= 10000;
          break;
        case 'savings_star_25k':
          progress = Math.min(savings || 0, 25000);
          earned = progress >= 25000;
          break;
        case 'daily_checkin_30':
          progress = Math.min(engagementDays || 0, 30);
          earned = progress >= 30;
          break;
      }

      return { ...badge, earned, progress, earnedDate: earned ? new Date().toISOString() : undefined };
    });
  };

  const badges = calculateBadges();
  const earnedBadges = badges.filter(b => b.earned);
  const categories = ['all', 'foundation', 'financial', 'engagement', 'social'];

  const filteredBadges = badges.filter(badge => {
    if (showEarnedOnly && !badge.earned) return false;
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Achievement Badges</h3>
          <p className="text-xs text-muted-foreground">
            {earnedBadges.length} of {badges.length} badges earned
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{earnedBadges.length}</div>
          <div className="text-xs text-muted-foreground">Badges</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setShowEarnedOnly(!showEarnedOnly)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            showEarnedOnly
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
          }`}
        >
          {showEarnedOnly ? '✓ Earned Only' : 'Show All'}
        </button>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredBadges.map(badge => (
          <div
            key={badge.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              badge.earned
                ? `${rarityColors[badge.rarity]} ${rarityGlow[badge.rarity]} shadow-lg`
                : 'border-border bg-muted/20 opacity-60'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="font-semibold text-sm text-foreground">{badge.name}</div>
              <div className="text-xs text-muted-foreground">{badge.description}</div>
              
              {badge.progress !== undefined && badge.maxProgress && (
                <div className="mt-2">
                  <div className="w-full bg-muted/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        badge.earned ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((badge.progress / badge.maxProgress) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {badge.progress}/{badge.maxProgress}
                  </div>
                </div>
              )}

              {badge.earned && (
                <div className="text-xs text-green-400 font-medium mt-1">✓ Earned</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No badges found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

