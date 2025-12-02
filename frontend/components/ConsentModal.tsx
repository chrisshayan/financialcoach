'use client';

import { useState } from 'react';
import { Coach, ConsentRequest } from '@/types/coach';

interface ConsentModalProps {
  coach: Coach;
  userId: string;
  onConsent: (consent: ConsentRequest) => void;
  onCancel: () => void;
}

const durationOptions = [
  { hours: 24, label: '24 hours', description: 'Short-term access' },
  { hours: 72, label: '3 days', description: 'Standard access' },
  { hours: 168, label: '7 days', description: 'Extended access' },
];

const dataFieldLabels: Record<string, string> = {
  income: 'Income Information',
  savings: 'Savings & Assets',
  credit_score: 'Credit Score',
  affordability_range: 'Affordability Range',
  monthly_budget: 'Monthly Budget',
};

export function ConsentModal({ coach, userId, onConsent, onCancel }: ConsentModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(72);
  const [selectedFields, setSelectedFields] = useState<string[]>(coach.required_data);

  const handleToggleField = (field: string) => {
    if (coach.required_data.includes(field)) {
      // Required fields cannot be deselected
      return;
    }
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleSubmit = () => {
    const consentRequest: ConsentRequest = {
      coach_id: coach.id,
      data_fields: selectedFields,
      duration_hours: selectedDuration,
      user_id: userId,
    };
    onConsent(consentRequest);
  };

  return (
    <div className="relative bg-background rounded-2xl">
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-xl z-10"
      >
        ✕
      </button>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{coach.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-foreground">{coach.name}</h3>
                <p className="text-sm text-muted-foreground">Powered by {coach.powered_by}</p>
              </div>
            </div>
            <p className="text-sm text-foreground mt-3">{coach.description}</p>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-foreground mb-2">Data Sharing Consent</h4>
            <p className="text-sm text-muted-foreground mb-4">
              To connect with {coach.name}, we need your consent to share the following financial data:
            </p>

            <div className="space-y-2">
              {coach.required_data.map((field) => (
                <div key={field} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    disabled
                    className="rounded border-border"
                  />
                  <label className="text-sm text-foreground flex-1">
                    {dataFieldLabels[field] || field}
                    <span className="text-xs text-muted-foreground ml-2">(Required)</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Data Sharing Duration</h4>
            <div className="space-y-2">
              {durationOptions.map((option) => (
                <button
                  key={option.hours}
                  onClick={() => setSelectedDuration(option.hours)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedDuration === option.hours
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                    {selectedDuration === option.hours && (
                      <span className="text-primary text-xl">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-sm text-foreground">
              <strong>Privacy Note:</strong> Your data will only be shared with {coach.powered_by} for the selected duration. 
              You can revoke access at any time. Data is encrypted and securely transmitted.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-muted/50 hover:bg-muted/70 text-foreground rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Grant Consent & Connect
            </button>
          </div>
        </div>
    </div>
  );
}

