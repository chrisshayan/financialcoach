'use client';

import { useState } from 'react';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'calculator' | 'infographic' | 'quiz';
  category: 'discovery' | 'planning' | 'action' | 'optimization' | 'maintenance';
  duration?: string;
  readTime?: string;
  icon: string;
  completed?: boolean;
  recommended?: boolean;
}

const contentItems: ContentItem[] = [
  // Discovery Stage
  {
    id: '1',
    title: 'First-Time Homebuyer Guide',
    description: 'Everything you need to know about buying your first home',
    type: 'article',
    category: 'discovery',
    readTime: '10 min',
    icon: '📖',
    recommended: true
  },
  {
    id: '2',
    title: 'Understanding DTI and Why It Matters',
    description: 'Learn how debt-to-income ratio affects your mortgage eligibility',
    type: 'article',
    category: 'discovery',
    readTime: '8 min',
    icon: '📊'
  },
  {
    id: '3',
    title: 'How Much Home Can You Afford?',
    description: 'Interactive calculator to determine your home buying budget',
    type: 'calculator',
    category: 'discovery',
    duration: '5 min',
    icon: '🏠',
    recommended: true
  },
  // Planning Stage
  {
    id: '4',
    title: 'Creating Your Homeownership Action Plan',
    description: 'Step-by-step guide to building a personalized roadmap',
    type: 'article',
    category: 'planning',
    readTime: '12 min',
    icon: '📋',
    recommended: true
  },
  {
    id: '5',
    title: 'Strategies to Reduce Debt-to-Income Ratio',
    description: 'Proven methods to lower your DTI and improve mortgage readiness',
    type: 'article',
    category: 'planning',
    readTime: '10 min',
    icon: '💳'
  },
  {
    id: '6',
    title: 'Building Your Down Payment Fund',
    description: 'Tips and strategies to save for your down payment faster',
    type: 'article',
    category: 'planning',
    readTime: '8 min',
    icon: '💰'
  },
  // Action Stage
  {
    id: '7',
    title: 'Monthly Savings Strategies',
    description: 'Practical ways to increase your monthly savings rate',
    type: 'article',
    category: 'action',
    readTime: '7 min',
    icon: '💵'
  },
  {
    id: '8',
    title: 'Debt Payoff Methods Explained',
    description: 'Snowball vs. Avalanche: Which method is right for you?',
    type: 'video',
    category: 'action',
    duration: '5 min',
    icon: '🎥'
  },
  {
    id: '9',
    title: 'Credit Score Optimization Tips',
    description: 'Actionable steps to improve your credit score',
    type: 'article',
    category: 'action',
    readTime: '9 min',
    icon: '📈'
  },
  // Optimization Stage
  {
    id: '10',
    title: 'Mortgage Pre-Approval Process',
    description: 'Complete guide to getting pre-approved for a mortgage',
    type: 'article',
    category: 'optimization',
    readTime: '11 min',
    icon: '✅'
  },
  {
    id: '11',
    title: 'Understanding Mortgage Types',
    description: 'Fixed vs. Adjustable: Which mortgage is right for you?',
    type: 'infographic',
    category: 'optimization',
    readTime: '5 min',
    icon: '📑'
  }
];

export function ContentLibrary({ userContext, currentStage = 'discovery' }: { userContext?: any; currentStage?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const categories = ['all', 'discovery', 'planning', 'action', 'optimization', 'maintenance'];
  const types = ['all', 'article', 'video', 'calculator', 'infographic', 'quiz'];

  const filteredContent = contentItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    return true;
  });

  const recommendedContent = contentItems.filter(item => item.recommended);

  const typeIcons = {
    article: '📖',
    video: '🎥',
    calculator: '🧮',
    infographic: '📊',
    quiz: '❓'
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Financial Education</h3>
          <p className="text-xs text-muted-foreground">Learn at your own pace</p>
        </div>
        <div className="text-2xl">📚</div>
      </div>

      {/* Recommended Content */}
      {recommendedContent.length > 0 && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-xs font-semibold text-primary mb-2">Recommended for You</div>
          <div className="space-y-2">
            {recommendedContent.slice(0, 2).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span>{item.icon}</span>
                <span className="text-foreground">{item.title}</span>
                {item.readTime && <span className="text-xs text-muted-foreground">({item.readTime})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2">
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
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredContent.map(item => (
          <div
            key={item.id}
            className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{typeIcons[item.type] || item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                  {item.completed && <span className="text-green-400 text-xs">✓</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {item.readTime && <span>📖 {item.readTime}</span>}
                  {item.duration && <span>⏱️ {item.duration}</span>}
                  <span className="capitalize">{item.category}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No content found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

