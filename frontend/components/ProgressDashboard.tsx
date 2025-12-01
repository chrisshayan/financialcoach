'use client';

interface ProgressDashboardProps {
  userContext?: {
    name?: string;
    readinessScore?: number;
    dti?: number;
    savings?: { total?: number };
    credit?: { score?: number };
  };
  milestones?: Array<{
    id: string;
    title: string;
    status: 'completed' | 'in-progress' | 'pending';
    date?: string;
    description?: string;
  }>;
}

const defaultMilestones = [
  {
    id: '1',
    title: 'Initial Assessment',
    status: 'completed' as const,
    description: 'Completed financial readiness evaluation'
  },
  {
    id: '2',
    title: 'DTI Below 40%',
    status: 'in-progress' as const,
    description: 'Target: Reduce debt-to-income ratio'
  },
  {
    id: '3',
    title: 'Credit Score 740+',
    status: 'pending' as const,
    description: 'Improve credit score for better rates'
  },
  {
    id: '4',
    title: '$30k in Savings',
    status: 'pending' as const,
    description: 'Build down payment fund'
  },
  {
    id: '5',
    title: 'Mortgage Pre-Approval',
    status: 'pending' as const,
    description: 'Ready to apply for pre-approval'
  }
];

export function ProgressDashboard({ userContext, milestones = defaultMilestones }: ProgressDashboardProps) {
  const readinessScore = userContext?.readinessScore ?? undefined;
  const dti = userContext?.dti ?? undefined;
  const savings = userContext?.savings?.total || 0;
  const creditScore = userContext?.credit?.score || 0;

  // Update milestones based on actual data
  const updatedMilestones = [...milestones];
  
  // Update milestone statuses based on current data
  if (readinessScore !== undefined && readinessScore > 0) {
    updatedMilestones[0].status = 'completed'; // Initial Assessment
  }
  
  if (dti !== undefined && dti <= 40) {
    updatedMilestones[1].status = 'completed'; // DTI Below 40%
  } else if (dti !== undefined && dti > 40) {
    updatedMilestones[1].status = 'in-progress';
  }
  
  if (creditScore >= 740) {
    updatedMilestones[2].status = 'completed'; // Credit Score 740+
  } else if (creditScore >= 700) {
    updatedMilestones[2].status = 'in-progress';
  }
  
  if (savings >= 30000) {
    updatedMilestones[3].status = 'completed'; // $30k in Savings
  } else if (savings >= 15000) {
    updatedMilestones[3].status = 'in-progress';
  }
  
  if (readinessScore !== undefined && readinessScore >= 75 && dti !== undefined && dti <= 43 && creditScore >= 700) {
    updatedMilestones[4].status = 'in-progress'; // Mortgage Pre-Approval
  }

  // Calculate overall progress (average of completed milestones)
  const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
  const totalMilestones = updatedMilestones.length;
  const progressPercentage = (completedCount / totalMilestones) * 100;

  // Find next milestone
  const nextMilestone = updatedMilestones.find(m => m.status === 'in-progress' || m.status === 'pending');


  return (
    <div className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Your Journey</h3>
          <p className="text-xs text-muted-foreground">Track your progress to homeownership</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full bg-muted/50 rounded-full h-3 overflow-hidden border border-border/50">
        <div
          className="h-full bg-gradient-to-r from-primary via-blue-500 to-primary rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Readiness Score</div>
          <div className={`text-xl font-bold ${
            readinessScore === undefined ? 'text-muted-foreground' :
            readinessScore >= 80 ? 'text-green-400' :
            readinessScore >= 65 ? 'text-blue-400' :
            readinessScore >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {readinessScore !== undefined ? `${readinessScore}/100` : '—'}
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Current DTI</div>
          <div className={`text-xl font-bold ${
            dti === undefined ? 'text-muted-foreground' :
            dti <= 36 ? 'text-green-400' :
            dti <= 43 ? 'text-blue-400' : 'text-yellow-400'
          }`}>
            {dti !== undefined ? `${dti.toFixed(1)}%` : '—'}
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Savings</div>
          <div className="text-xl font-bold text-foreground">
            ${(savings / 1000).toFixed(0)}k
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Credit Score</div>
          <div className={`text-xl font-bold ${
            creditScore >= 740 ? 'text-green-400' :
            creditScore >= 700 ? 'text-blue-400' : 'text-yellow-400'
          }`}>
            {creditScore}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Milestones</h4>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {updatedMilestones.map((milestone, index) => (
              <div key={milestone.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  milestone.status === 'completed'
                    ? 'bg-green-500 border-green-500'
                    : milestone.status === 'in-progress'
                    ? 'bg-primary border-primary animate-pulse'
                    : 'bg-muted border-border'
                }`}>
                  {milestone.status === 'completed' && (
                    <span className="text-white text-xs">✓</span>
                  )}
                  {milestone.status === 'in-progress' && (
                    <span className="text-white text-xs">●</span>
                  )}
                  {milestone.status === 'pending' && (
                    <span className="text-muted-foreground text-xs">{index + 1}</span>
                  )}
                </div>
                
                {/* Milestone content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className={`text-sm font-semibold ${
                      milestone.status === 'completed' ? 'text-green-400' :
                      milestone.status === 'in-progress' ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {milestone.title}
                    </h5>
                    {milestone.date && (
                      <span className="text-xs text-muted-foreground">{milestone.date}</span>
                    )}
                  </div>
                  {milestone.description && (
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {nextMilestone && (
        <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20">
          <div className="text-xs text-muted-foreground mb-1">Next Step</div>
          <div className="text-sm font-semibold text-foreground">{nextMilestone.title}</div>
          {nextMilestone.description && (
            <div className="text-xs text-muted-foreground mt-1">{nextMilestone.description}</div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
        <div className="space-y-2">
          <button className="w-full px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg border border-primary/30 transition-colors text-left">
            📊 View CLV Analysis
          </button>
          <button className="w-full px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg border border-primary/30 transition-colors text-left">
            🔮 Plan Scenarios
          </button>
        </div>
      </div>
    </div>
  );
}

