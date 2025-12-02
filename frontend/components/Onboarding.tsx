'use client';

import { useState, useEffect, useRef } from 'react';
import { getPersonalizedQuestions } from '@/lib/api-client';

interface OnboardingProps {
  onSelectExample: (example: string) => void;
  onDismiss: () => void;
  userContext?: {
    name?: string;
    income?: { monthly_gross?: number; annual_gross?: number };
    savings?: { total?: number; monthly_savings_rate?: number };
    credit?: { score?: number };
    debts?: Array<{ type: string; balance?: number; monthly_payment?: number }>;
  };
  userId?: string;
  existingGoals?: Array<{ type: string; name: string; status: string }>;
}

export function Onboarding({ onSelectExample, onDismiss, userContext, userId = 'user_001', existingGoals }: OnboardingProps) {
  const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userName = userContext?.name || 'First-Time Home Buyer';
  const hasLoadedRef = useRef(false);
  const lastUserIdRef = useRef<string>(userId);
  const lastGoalsRef = useRef<string>('');

  useEffect(() => {
    // Create a stable string representation of goals for comparison
    const goalsKey = JSON.stringify(existingGoals || []);
    
    // Only reload if userId changed or goals actually changed (not just reference)
    const userIdChanged = lastUserIdRef.current !== userId;
    const goalsChanged = lastGoalsRef.current !== goalsKey;
    
    // If we've already loaded and nothing meaningful changed, don't reload
    if (hasLoadedRef.current && !userIdChanged && !goalsChanged) {
      return;
    }
    
    async function loadQuestions() {
      setIsLoading(true);
      try {
        const questions = await getPersonalizedQuestions(userId, existingGoals);
        setExampleQuestions(questions);
        hasLoadedRef.current = true;
        lastUserIdRef.current = userId;
        lastGoalsRef.current = goalsKey;
      } catch (error) {
        console.error('Error loading personalized questions:', error);
        // Fallback questions
        setExampleQuestions([
          "What is my readiness score?",
          "What's my debt-to-income ratio?",
          "Can I afford a $400k home?",
          "Analyze my spending patterns",
          "Should I create an emergency fund goal?"
        ]);
        hasLoadedRef.current = true;
        lastUserIdRef.current = userId;
        lastGoalsRef.current = goalsKey;
      } finally {
        setIsLoading(false);
      }
    }
    
    loadQuestions();
  }, [userId, existingGoals]);
  return (
    <div className="w-full p-8 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl shadow-2xl backdrop-blur-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Welcome to Financial Coach
          </h2>
          <p className="text-muted-foreground text-base">
            Your AI-powered financial advisor for homeownership readiness
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Welcome message */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border border-primary/20">
          <h3 className="font-semibold text-foreground text-xl mb-3">Welcome, {userName}! 👋</h3>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            I'm here to help you prepare for homeownership over the next 6-24 months. I'll:
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Assess your current financial readiness</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Create personalized action plans with clear steps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Track your progress toward mortgage readiness</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Provide proactive guidance and recommendations</span>
            </li>
          </ul>
        </div>
        
        {/* Right side - Example questions */}
        <div>
          <h3 className="font-semibold text-foreground text-lg mb-4">Try asking:</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-muted/30 border border-border rounded-xl animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {exampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onSelectExample(question)}
                  className="text-left p-4 bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 hover:from-secondary/90 hover:via-secondary/85 hover:to-secondary/80 border border-border rounded-xl transition-all duration-200 text-sm font-medium hover:scale-[1.02] hover:shadow-lg hover:border-primary/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-lg">💬</span>
                    <span>{question}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

