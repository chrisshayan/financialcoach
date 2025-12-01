'use client';

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
}

function generatePersonalizedQuestions(userContext?: OnboardingProps['userContext']): string[] {
  if (!userContext) {
    // Default questions if no context
    return [
      "What is my readiness score?",
      "Analyze my spending patterns",
      "Can I afford a $400k home?",
      "Where am I overspending?",
      "Create my personalized action plan",
    ];
  }

  const monthlyIncome = userContext.income?.monthly_gross || 0;
  const savings = userContext.savings?.total || 0;
  const creditScore = userContext.credit?.score || 0;
  const debts = userContext.debts || [];
  const totalDebtPayments = debts.reduce((sum, debt) => sum + (debt.monthly_payment || 0), 0);
  const hasHighDebt = totalDebtPayments > monthlyIncome * 0.2; // More than 20% of income
  const hasLowCredit = creditScore < 700;
  const hasLowSavings = savings < 30000;
  const hasHighIncome = monthlyIncome >= 9000;
  const hasMultipleDebts = debts.length > 1;

  const questions: string[] = [];

  // Always include readiness score as a baseline
  questions.push("What is my readiness score?");

  // Priority 1: Credit issues (most critical blocker)
  if (hasLowCredit) {
    questions.push("How can I improve my credit score?");
  }

  // Priority 2: Debt management (high impact)
  if (hasHighDebt || hasMultipleDebts) {
    questions.push("What's my debt-to-income ratio?");
    if (hasMultipleDebts) {
      questions.push("Which debt should I pay off first?");
    }
  }

  // Priority 3: Spending analysis (always relevant)
  questions.push("Analyze my spending patterns");

  // Priority 4: Affordability - personalized by income level
  if (hasHighIncome) {
    questions.push("Can I afford a $500k home?");
  } else if (monthlyIncome >= 6000) {
    questions.push("Can I afford a $400k home?");
  } else {
    questions.push("Can I afford a $300k home?");
  }

  // Priority 5: Savings (if low savings)
  if (hasLowSavings && !hasLowCredit && !hasHighDebt) {
    questions.push("How much should I save for a down payment?");
  }

  // Priority 6: Action plan (always include if we have space)
  if (questions.length < 5) {
    questions.push("Create my personalized action plan");
  }

  // Ensure we have exactly 5 questions, prioritizing the most relevant
  // If we have more than 5, keep the first 5 (most prioritized)
  // If we have less than 5, add generic helpful questions
  while (questions.length < 5) {
    if (!questions.includes("Where am I overspending?")) {
      questions.push("Where am I overspending?");
    } else if (!questions.includes("Create my personalized action plan")) {
      questions.push("Create my personalized action plan");
    } else {
      break; // Prevent infinite loop
    }
  }

  return questions.slice(0, 5);
}

export function Onboarding({ onSelectExample, onDismiss, userContext }: OnboardingProps) {
  const exampleQuestions = generatePersonalizedQuestions(userContext);
  const userName = userContext?.name || 'First-Time Home Buyer';
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
        </div>
      </div>
    </div>
  );
}

