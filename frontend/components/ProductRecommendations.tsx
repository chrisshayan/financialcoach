'use client';

import { useState } from 'react';
import { AITransparency } from './AITransparency';

interface Product {
  id: string;
  name: string;
  category: 'mortgage' | 'savings' | 'credit' | 'insurance' | 'investment';
  description: string;
  benefit: string;
  eligibility?: string;
  cta: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProductRecommendationsProps {
  userContext?: {
    readinessScore?: number;
    dti?: number;
    savings?: { total?: number };
    credit?: { score?: number };
    income?: { monthly_gross?: number };
  };
  trigger?: 'readiness' | 'dti' | 'affordability' | 'spending';
}

const getRecommendations = (
  userContext?: ProductRecommendationsProps['userContext'],
  trigger?: ProductRecommendationsProps['trigger']
): Product[] => {
  const recommendations: Product[] = [];
  const readinessScore = userContext?.readinessScore || 0;
  const dti = userContext?.dti || 0;
  const savings = userContext?.savings?.total || 0;
  const creditScore = userContext?.credit?.score || 0;
  const monthlyIncome = userContext?.income?.monthly_gross || 0;

  // High-yield savings account (always relevant)
  if (savings < 50000) {
    recommendations.push({
      id: 'hysa',
      name: 'High-Yield Savings Account',
      category: 'savings',
      description: 'Earn 4.5% APY on your down payment savings',
      benefit: `Could earn $${Math.round(savings * 0.045)}/year on your current savings`,
      eligibility: 'No minimum balance required',
      cta: 'Open Account',
      icon: '💰',
      priority: savings < 20000 ? 'high' : 'medium'
    });
  }

  // Mortgage pre-approval (if readiness is good)
  if (readinessScore >= 70 && dti <= 43 && creditScore >= 700) {
    recommendations.push({
      id: 'preapproval',
      name: 'Mortgage Pre-Approval',
      category: 'mortgage',
      description: 'Get pre-approved and lock in your rate',
      benefit: 'Know your buying power and show sellers you\'re serious',
      eligibility: 'DTI ≤ 43%, Credit ≥ 700',
      cta: 'Get Pre-Approved',
      icon: '🏠',
      priority: 'high'
    });
  }

  // Credit card for building credit (if credit is low)
  if (creditScore < 720 && trigger === 'readiness') {
    recommendations.push({
      id: 'credit-card',
      name: 'Credit Builder Card',
      category: 'credit',
      description: 'Build credit with responsible use',
      benefit: 'Improve your credit score with on-time payments',
      eligibility: 'Credit score 650+',
      cta: 'Apply Now',
      icon: '💳',
      priority: creditScore < 700 ? 'high' : 'medium'
    });
  }

  // Debt consolidation (if DTI is high)
  if (dti > 40 && trigger === 'dti') {
    recommendations.push({
      id: 'debt-consolidation',
      name: 'Debt Consolidation Loan',
      category: 'credit',
      description: 'Lower your monthly payments and simplify debt',
      benefit: `Could reduce monthly payments by up to $${Math.round(monthlyIncome * 0.05)}`,
      eligibility: 'DTI ≤ 50%, Credit ≥ 650',
      cta: 'Learn More',
      icon: '🔄',
      priority: dti > 45 ? 'high' : 'medium'
    });
  }

  // Homeowners insurance quote (if close to buying)
  if (readinessScore >= 75) {
    recommendations.push({
      id: 'insurance',
      name: 'Homeowners Insurance Quote',
      category: 'insurance',
      description: 'Get a free quote for your future home',
      benefit: 'Lock in competitive rates early',
      eligibility: 'Available to all customers',
      cta: 'Get Quote',
      icon: '🛡️',
      priority: 'medium'
    });
  }

  // Investment account (if savings are high)
  if (savings > 30000 && readinessScore >= 65) {
    recommendations.push({
      id: 'investment',
      name: 'Investment Account',
      category: 'investment',
      description: 'Grow your savings beyond your down payment',
      benefit: 'Potential for higher returns on excess savings',
      eligibility: 'Savings ≥ $30k',
      cta: 'Start Investing',
      icon: '📈',
      priority: 'low'
    });
  }

  // Sort by priority (high first) and limit to 3
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
};

const categoryColors = {
  mortgage: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  savings: 'from-green-500/20 to-green-600/10 border-green-500/30',
  credit: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  insurance: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  investment: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30'
};

export function ProductRecommendations({ userContext, trigger }: ProductRecommendationsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const recommendations = getRecommendations(userContext, trigger);

  if (recommendations.length === 0) {
    return null;
  }

  // Generate explanation for a product recommendation
  const generateExplanation = (product: Product) => {
    const readinessScore = userContext?.readinessScore || 0;
    const dti = userContext?.dti || 0;
    const savings = userContext?.savings?.total || 0;
    const creditScore = userContext?.credit?.score || 0;

    let primaryReason = '';
    const supportingFactors: string[] = [];
    const riskFactors: string[] = [];
    let confidence = 75;
    const dataSources: string[] = [];

    switch (product.id) {
      case 'hysa':
        primaryReason = `Based on your current savings of $${savings.toLocaleString()}, a high-yield savings account could help you earn more on your down payment fund.`;
        supportingFactors.push(`You're saving for a home, and maximizing returns on your savings is crucial`);
        supportingFactors.push(`Current savings rate of 4.5% APY is significantly higher than traditional savings accounts`);
        if (savings < 20000) {
          supportingFactors.push(`You're in the early stages of saving, so every dollar of interest helps`);
        }
        confidence = savings > 0 ? 85 : 60;
        dataSources.push('Current savings balance', 'Homeownership goal');
        break;
      case 'mortgage_preapproval':
        primaryReason = `Your readiness score of ${readinessScore} and DTI of ${dti.toFixed(1)}% indicate you're ready for mortgage pre-approval.`;
        supportingFactors.push(`Readiness score of ${readinessScore} meets the threshold for pre-approval`);
        supportingFactors.push(`DTI of ${dti.toFixed(1)}% is within acceptable limits`);
        if (creditScore >= 720) {
          supportingFactors.push(`Credit score of ${creditScore} qualifies you for competitive rates`);
        }
        if (savings >= 30000) {
          supportingFactors.push(`You have sufficient savings for a down payment`);
        }
        confidence = readinessScore >= 75 && dti <= 43 ? 90 : 70;
        dataSources.push('Readiness score', 'DTI calculation', 'Credit score', 'Savings balance');
        break;
      case 'debt_consolidation':
        primaryReason = `Your DTI of ${dti.toFixed(1)}% suggests that consolidating debt could improve your financial position.`;
        supportingFactors.push(`Reducing DTI will improve your mortgage eligibility`);
        supportingFactors.push(`Consolidation could lower your monthly payments`);
        if (dti > 43) {
          riskFactors.push(`Your DTI is above the recommended 43% threshold`);
        }
        confidence = dti > 40 ? 80 : 65;
        dataSources.push('DTI calculation', 'Debt breakdown');
        break;
      default:
        primaryReason = `This product aligns with your financial goals and current situation.`;
        confidence = 70;
    }

    return {
      recommendation: product.name,
      primaryReason,
      supportingFactors,
      riskFactors: riskFactors.length > 0 ? riskFactors : undefined,
      timelineImpact: product.category === 'mortgage' 
        ? 'Could accelerate your home buying timeline by 2-3 months'
        : 'Expected to show results within 1-3 months',
      confidence,
      dataSources,
      alternatives: product.category === 'savings' ? [
        {
          option: 'Traditional Savings Account',
          pros: ['Lower risk', 'FDIC insured', 'Easy access'],
          cons: ['Lower interest rate (0.5% vs 4.5%)', 'Slower growth'],
          timeline: 'Same timeline, but less growth'
        },
        {
          option: 'Investment Account',
          pros: ['Higher potential returns', 'Tax advantages'],
          cons: ['Higher risk', 'Less liquidity', 'Market volatility'],
          timeline: 'Longer timeline, higher risk'
        }
      ] : undefined
    };
  };

  return (
    <>
      <div className="mt-4 p-5 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">✨</span>
        <h3 className="font-semibold text-foreground text-lg">Recommended for You</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Based on your financial profile, these products can help accelerate your homeownership journey
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className={`p-4 bg-gradient-to-br ${categoryColors[product.category]} border rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{product.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-foreground text-sm">{product.name}</h4>
                  {product.priority === 'high' && (
                    <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-foreground mb-0.5">
                      💡 {product.benefit}
                    </div>
                    {product.eligibility && (
                      <div className="text-xs text-muted-foreground">
                        ✓ {product.eligibility}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowExplanation(true);
                      }}
                      className="px-3 py-2 bg-muted/50 hover:bg-muted/70 text-foreground rounded-lg text-xs font-medium transition-colors"
                    >
                      Why this?
                    </button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
                      {product.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* AI Transparency Modal */}
    {showExplanation && selectedProduct && (
      <AITransparency
        explanation={generateExplanation(selectedProduct)}
        onClose={() => {
          setShowExplanation(false);
          setSelectedProduct(null);
        }}
        isModal={true}
      />
    )}
  </>
  );
}

