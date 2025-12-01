'use client';

import { useState } from 'react';

interface RecommendationExplanation {
  recommendation: string;
  primaryReason: string;
  supportingFactors: string[];
  riskFactors?: string[];
  timelineImpact?: string;
  confidence: number;
  dataSources: string[];
  alternatives?: Array<{
    option: string;
    pros: string[];
    cons: string[];
    timeline: string;
  }>;
}

interface AITransparencyProps {
  explanation: RecommendationExplanation;
  onClose?: () => void;
  isModal?: boolean;
}

export function AITransparency({ explanation, onClose, isModal = false }: AITransparencyProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Highly Recommended';
    if (confidence >= 60) return 'Recommended';
    return 'Consider with Caution';
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Why This Recommendation?</h3>
          <p className="text-sm text-muted-foreground">Understanding the AI's reasoning</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Confidence Score */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Confidence Level</span>
          <span className={`text-lg font-bold ${getConfidenceColor(explanation.confidence)}`}>
            {explanation.confidence}%
          </span>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${
              explanation.confidence >= 80 ? 'bg-green-500' :
              explanation.confidence >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
            }`}
            style={{ width: `${explanation.confidence}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{getConfidenceLabel(explanation.confidence)}</p>
      </div>

      {/* Primary Reason */}
      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Primary Reason</h4>
            <p className="text-sm text-foreground">{explanation.primaryReason}</p>
          </div>
        </div>
      </div>

      {/* Supporting Factors */}
      {explanation.supportingFactors.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span>✅</span> Supporting Factors
          </h4>
          <ul className="space-y-2">
            {explanation.supportingFactors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Factors */}
      {explanation.riskFactors && explanation.riskFactors.length > 0 && (
        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span>⚠️</span> Considerations
          </h4>
          <ul className="space-y-2">
            {explanation.riskFactors.map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline Impact */}
      {explanation.timelineImpact && (
        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <span>⏱️</span> Expected Impact
          </h4>
          <p className="text-sm text-foreground">{explanation.timelineImpact}</p>
        </div>
      )}

      {/* Data Sources */}
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>📊</span> Data Sources
        </h4>
        <div className="flex flex-wrap gap-2">
          {explanation.dataSources.map((source, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-background border border-border rounded text-xs text-muted-foreground"
            >
              {source}
            </span>
          ))}
        </div>
      </div>

      {/* Alternatives */}
      {explanation.alternatives && explanation.alternatives.length > 0 && (
        <div>
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="w-full p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 transition-colors flex items-center justify-between"
          >
            <span className="font-semibold text-foreground">
              {showAlternatives ? 'Hide' : 'Show'} Alternative Options
            </span>
            <span className="text-muted-foreground">{showAlternatives ? '▲' : '▼'}</span>
          </button>

          {showAlternatives && (
            <div className="mt-3 space-y-3">
              {explanation.alternatives.map((alt, index) => (
                <div key={index} className="p-4 bg-muted/20 rounded-lg border border-border/50">
                  <h5 className="font-semibold text-foreground mb-3">{alt.option}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-green-400 mb-2">Pros</div>
                      <ul className="space-y-1">
                        {alt.pros.map((pro, i) => (
                          <li key={i} className="text-xs text-foreground flex items-start gap-1">
                            <span className="text-green-400">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-red-400 mb-2">Cons</div>
                      <ul className="space-y-1">
                        {alt.cons.map((con, i) => (
                          <li key={i} className="text-xs text-foreground flex items-start gap-1">
                            <span className="text-red-400">✗</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Timeline: </span>
                    <span className="text-xs font-medium text-foreground">{alt.timeline}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Low Confidence Warning */}
      {explanation.confidence < 60 && (
        <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="flex items-start gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Consider Speaking with an Advisor</h4>
              <p className="text-sm text-muted-foreground">
                This recommendation has lower confidence. Consider consulting with a financial advisor for personalized guidance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      {content}
    </div>
  );
}

