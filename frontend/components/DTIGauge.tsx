'use client';

interface DTIGaugeProps {
  dti: number;
  maxDTI?: number;
}

export function DTIGauge({ dti, maxDTI = 43 }: DTIGaugeProps) {
  const percentage = Math.min((dti / maxDTI) * 100, 100);
  const isGood = dti <= 36;
  const isWarning = dti > 36 && dti <= 43;
  const isDanger = dti > 43;
  
  const getColor = () => {
    if (isGood) return '#10b981'; // Green
    if (isWarning) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getStatus = () => {
    if (isGood) return 'Excellent';
    if (isWarning) return 'Acceptable';
    return 'Too High';
  };

  return (
    <div className="mt-4">
      <div className="relative w-full h-32 flex items-center justify-center">
        {/* Gauge background */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            className="transition-all duration-500"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color: getColor() }}>
            {dti.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">{getStatus()}</div>
        </div>
      </div>
      
      {/* Scale markers */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2 px-4">
        <span>0%</span>
        <span>36%</span>
        <span>43%</span>
        <span>50%+</span>
      </div>
    </div>
  );
}

