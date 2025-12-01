'use client';

interface Milestone {
  milestone: string;
  target: string;
  status: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  return (
    <div className="mt-4 relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const isCompleted = milestone.status === 'completed';
          const isInProgress = milestone.status === 'in_progress';
          
          return (
            <div key={index} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                isCompleted 
                  ? 'bg-green-500 border-green-500' 
                  : isInProgress
                  ? 'bg-blue-500 border-blue-500 animate-pulse'
                  : 'bg-background border-border'
              }`}>
                {isCompleted ? (
                  <span className="text-white text-sm">✓</span>
                ) : (
                  <span className={`text-xs ${isInProgress ? 'text-white' : 'text-muted-foreground'}`}>
                    {index + 1}
                  </span>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{milestone.milestone}</span>
                  {isCompleted && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  )}
                  {isInProgress && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                      In Progress
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{milestone.target}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

