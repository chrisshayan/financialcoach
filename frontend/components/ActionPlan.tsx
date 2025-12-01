'use client';

import { MilestoneTimeline } from './MilestoneTimeline';

interface ActionPlanProps {
  plan: {
    goal?: string;
    current_status?: {
      readiness_score?: number;
      level?: string;
      dti?: number;
    };
    timeline_months?: number;
    priority_actions?: Array<{
      action: string;
      priority: string;
      description: string;
      target: string;
      timeline: string;
    }>;
    monthly_goals?: Array<{
      month: string;
      goal: string;
      actions: string[];
    }>;
    milestones?: Array<{
      milestone: string;
      target: string;
      status: string;
    }>;
  };
}

export function ActionPlan({ plan }: ActionPlanProps) {
  // Check if plan has any data
  if (!plan || (!plan.priority_actions && !plan.milestones && !plan.goal)) {
    return null;
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-950/20';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-950/20';
      default:
        return 'border-blue-500/50 bg-blue-950/20';
    }
  };
  
  return (
    <div className="mt-4 p-5 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="text-lg font-semibold text-foreground">Your Action Plan</h3>
      </div>
      
      {plan.current_status && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Current Status</div>
          <div className="flex gap-4 text-sm">
            {plan.current_status.readiness_score !== undefined && (
              <div>
                <span className="text-muted-foreground">Readiness: </span>
                <span className="font-semibold text-foreground">{plan.current_status.readiness_score}/100</span>
              </div>
            )}
            {plan.current_status.dti !== undefined && (
              <div>
                <span className="text-muted-foreground">DTI: </span>
                <span className="font-semibold text-foreground">{plan.current_status.dti.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {plan.priority_actions && plan.priority_actions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-foreground mb-3">Priority Actions</h4>
          <div className="space-y-3">
            {plan.priority_actions.map((action, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(action.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-foreground">{action.action}</h5>
                  <span className={`text-xs px-2 py-1 rounded ${
                    action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {action.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Target: </span>
                    <span className="text-foreground font-medium">{action.target}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeline: </span>
                    <span className="text-foreground font-medium">{action.timeline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {plan.milestones && plan.milestones.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-4">Milestones Timeline</h4>
          <MilestoneTimeline milestones={plan.milestones} />
        </div>
      )}
    </div>
  );
}

