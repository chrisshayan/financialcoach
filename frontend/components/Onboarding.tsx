'use client';

interface OnboardingProps {
  onSelectExample: (example: string) => void;
  onDismiss: () => void;
}

const exampleQuestions = [
  "What is my readiness score?",
  "Create my personalized action plan",
  "Can I afford a $400k home?",
  "What should I focus on to become mortgage-ready?",
  "What's my debt-to-income ratio?",
];

export function Onboarding({ onSelectExample, onDismiss }: OnboardingProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-card border border-border rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome to Financial Coach
          </h2>
          <p className="text-muted-foreground">
            Your AI-powered financial advisor for homeownership readiness
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Welcome, First-Time Home Buyer! 👋</h3>
          <p className="text-muted-foreground text-sm mb-2">
            I'm here to help you prepare for homeownership over the next 6-24 months. I'll:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>Assess your current financial readiness</li>
            <li>Create personalized action plans with clear steps</li>
            <li>Track your progress toward mortgage readiness</li>
            <li>Provide proactive guidance and recommendations</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-foreground mb-3">Try asking:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => onSelectExample(question)}
                className="text-left p-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

