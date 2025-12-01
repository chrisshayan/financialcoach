'use client';

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  if (suggestions.length === 0) return null;
  
  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="text-sm text-muted-foreground mb-3 font-medium">💡 Suggested follow-ups:</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 border border-border rounded-full transition-colors text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
