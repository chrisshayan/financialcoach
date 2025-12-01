'use client';

import { useState } from 'react';

interface SuccessStory {
  id: string;
  title: string;
  name: string; // Anonymized
  journey: string;
  timeline: string;
  startingPoint: {
    dti: number;
    savings: number;
    creditScore: number;
  };
  endingPoint: {
    dti: number;
    savings: number;
    creditScore: number;
  };
  keyStrategies: string[];
  quote: string;
  category: 'debt_reduction' | 'savings' | 'credit_improvement' | 'timeline';
}

const successStories: SuccessStory[] = [
  {
    id: '1',
    title: 'From 45% DTI to Mortgage-Ready in 12 Months',
    name: 'Sarah M.',
    journey: 'First-time homebuyer with high debt-to-income ratio',
    timeline: '12 months',
    startingPoint: {
      dti: 45,
      savings: 5000,
      creditScore: 680
    },
    endingPoint: {
      dti: 32,
      savings: 35000,
      creditScore: 745
    },
    keyStrategies: [
      'Consolidated credit card debt',
      'Increased monthly savings by $800',
      'Improved credit utilization',
      'Stuck to action plan milestones'
    ],
    quote: 'The action plan made it so clear what I needed to do. Breaking it down into monthly goals was the key.',
    category: 'debt_reduction'
  },
  {
    id: '2',
    title: 'Saved $30k While Paying Off Student Loans',
    name: 'Jordan T.',
    journey: 'Recent graduate balancing debt payoff and savings',
    timeline: '18 months',
    startingPoint: {
      dti: 38,
      savings: 2000,
      creditScore: 695
    },
    endingPoint: {
      dti: 28,
      savings: 30000,
      creditScore: 720
    },
    keyStrategies: [
      'Used debt avalanche method',
      'Automated savings transfers',
      'Reduced dining expenses by 40%',
      'Took on freelance work'
    ],
    quote: 'I thought I had to choose between paying debt and saving. The coach showed me I could do both!',
    category: 'savings'
  },
  {
    id: '3',
    title: 'Credit Score Boost: 680 to 750 in 8 Months',
    name: 'Alex R.',
    journey: 'Rebuilding credit after financial hardship',
    timeline: '8 months',
    startingPoint: {
      dti: 42,
      savings: 8000,
      creditScore: 680
    },
    endingPoint: {
      dti: 35,
      savings: 22000,
      creditScore: 750
    },
    keyStrategies: [
      'Paid down credit card balances',
      'Set up automatic payments',
      'Disputed credit report errors',
      'Kept credit utilization below 30%'
    ],
    quote: 'The credit improvement strategies were game-changing. I saw results faster than I expected.',
    category: 'credit_improvement'
  },
  {
    id: '4',
    title: 'Accelerated Timeline: Ready in 10 Months',
    name: 'Sam K.',
    journey: 'Aggressive savings and debt reduction',
    timeline: '10 months',
    startingPoint: {
      dti: 40,
      savings: 10000,
      creditScore: 710
    },
    endingPoint: {
      dti: 30,
      savings: 40000,
      creditScore: 740
    },
    keyStrategies: [
      'Increased income by 15%',
      'Cut non-essential expenses',
      'Maximized employer 401k match',
      'Used scenario planning to optimize'
    ],
    quote: 'The scenario planner helped me see that I could reach my goal faster by making a few key changes.',
    category: 'timeline'
  }
];

export function SuccessStories() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);

  const categories = ['all', 'debt_reduction', 'savings', 'credit_improvement', 'timeline'];

  const filteredStories = selectedCategory === 'all'
    ? successStories
    : successStories.filter(s => s.category === selectedCategory);

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Success Stories</h3>
          <p className="text-xs text-muted-foreground">Real journeys from users like you</p>
        </div>
        <div className="text-2xl">🌟</div>
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
            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStories.map(story => (
          <div
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="p-4 bg-muted/30 rounded-lg border border-border/50 cursor-pointer hover:border-primary/50 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">{story.title}</h4>
                <p className="text-xs text-muted-foreground">{story.name} • {story.timeline}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{story.quote}</p>
            <div className="flex gap-2 text-xs">
              <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                DTI: {story.startingPoint.dti}% → {story.endingPoint.dti}%
              </div>
              <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                Credit: {story.startingPoint.creditScore} → {story.endingPoint.creditScore}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStory(null)}
              className="float-right text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{selectedStory.title}</h3>
                <p className="text-muted-foreground">{selectedStory.name} • {selectedStory.timeline}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Starting DTI</div>
                  <div className="text-lg font-bold text-red-400">{selectedStory.startingPoint.dti}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Starting Savings</div>
                  <div className="text-lg font-bold text-foreground">${selectedStory.startingPoint.savings.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Starting Credit</div>
                  <div className="text-lg font-bold text-foreground">{selectedStory.startingPoint.creditScore}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Final DTI</div>
                  <div className="text-lg font-bold text-green-400">{selectedStory.endingPoint.dti}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Final Savings</div>
                  <div className="text-lg font-bold text-green-400">${selectedStory.endingPoint.savings.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Final Credit</div>
                  <div className="text-lg font-bold text-green-400">{selectedStory.endingPoint.creditScore}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Key Strategies</h4>
                <ul className="space-y-2">
                  {selectedStory.keyStrategies.map((strategy, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-foreground italic">"{selectedStory.quote}"</p>
                <p className="text-sm text-muted-foreground mt-2">— {selectedStory.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

