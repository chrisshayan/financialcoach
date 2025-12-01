'use client';

interface Persona {
  id: string;
  name: string;
  description: string;
  income: number;
  savings: number;
  creditScore: number;
}

const personas: Persona[] = [
  {
    id: 'user_001',
    name: 'Alex',
    description: 'Moderate income, good credit, needs to save more',
    income: 7500,
    savings: 20500,
    creditScore: 720
  },
  {
    id: 'user_002',
    name: 'Jordan',
    description: 'Higher income, excellent credit, well-positioned',
    income: 10000,
    savings: 50000,
    creditScore: 780
  },
  {
    id: 'user_003',
    name: 'Sam',
    description: 'Lower income, needs debt reduction, early stage',
    income: 5000,
    savings: 8000,
    creditScore: 650
  }
];

interface PersonaSelectorProps {
  selectedPersona: string;
  onPersonaChange: (personaId: string) => void;
}

export function PersonaSelector({ selectedPersona, onPersonaChange }: PersonaSelectorProps) {
  return (
    <div className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-foreground">Demo Persona</label>
        <span className="text-xs text-muted-foreground">Switch for demo</span>
      </div>
      <div className="space-y-2">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onPersonaChange(persona.id)}
            className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
              selectedPersona === persona.id
                ? 'border-primary bg-primary/20 shadow-lg shadow-primary/10 scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-sm text-foreground">{persona.name}</div>
              {selectedPersona === persona.id && (
                <span className="text-xs text-primary">✓</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mb-2">{persona.description}</div>
            <div className="text-xs font-medium text-foreground">
              ${(persona.income / 1000).toFixed(0)}k/mo • ${(persona.savings / 1000).toFixed(0)}k saved
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

