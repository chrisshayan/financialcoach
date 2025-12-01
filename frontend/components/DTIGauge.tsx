'use client';

import { useEffect, useState } from 'react';

interface DTIGaugeProps {
  dti: number;
  maxDTI?: number;
}

export function DTIGauge({ dti, maxDTI = 50 }: DTIGaugeProps) {
  const [animatedDTI, setAnimatedDTI] = useState(0);
  
  // Cap the percentage at 100% for visualization, but allow DTI values above maxDTI
  const percentage = Math.min((dti / maxDTI) * 100, 100);
  const isGood = dti <= 36;
  const isWarning = dti > 36 && dti <= 43;
  const isDanger = dti > 43;
  
  // Animate the DTI value on mount/update
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = dti / steps;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, dti);
      setAnimatedDTI(current);
      
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedDTI(dti);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [dti]);
  
  const getGradient = () => {
    if (isGood) return 'url(#greenGradient)';
    if (isWarning) return 'url(#amberGradient)';
    return 'url(#redGradient)';
  };

  const getColor = () => {
    if (isGood) return '#10b981'; // Green
    if (isWarning) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getGlowColor = () => {
    if (isGood) return 'rgba(16, 185, 129, 0.3)';
    if (isWarning) return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(239, 68, 68, 0.3)';
  };

  const getStatus = () => {
    if (isGood) return 'Excellent';
    if (isWarning) return 'Acceptable';
    return 'Too High';
  };

  const animatedPercentage = Math.min((animatedDTI / maxDTI) * 100, 100);

  return (
    <div className="mt-4">
      <div className="relative w-full h-40 flex items-center justify-center">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 blur-xl opacity-50"
          style={{
            background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
            transform: 'scale(1.2)',
          }}
        />
        
        {/* Gauge background */}
        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 200 100">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Background arc with subtle gradient */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Progress arc with gradient and glow */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={getGradient()}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${animatedPercentage * 2.51} 251`}
            className="transition-all duration-300 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${getColor()})`,
            }}
          />
        </svg>
        
        {/* Center text with animation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div 
            className="text-4xl font-bold transition-all duration-300"
            style={{ 
              color: getColor(),
              textShadow: `0 0 20px ${getGlowColor()}`,
            }}
          >
            {animatedDTI.toFixed(1)}%
          </div>
          <div className="text-sm font-medium mt-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
            {getStatus()}
          </div>
        </div>
      </div>
      
      {/* Scale markers with better styling */}
      <div className="flex justify-between text-xs mt-4 px-4">
        <div className="flex flex-col items-center">
          <div className="w-1 h-1 rounded-full bg-muted-foreground/50 mb-1" />
          <span className="text-muted-foreground">0%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-1 h-1 rounded-full bg-green-400/50 mb-1" />
          <span className="text-muted-foreground">36%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-1 h-1 rounded-full bg-amber-400/50 mb-1" />
          <span className="text-muted-foreground">43%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-1 h-1 rounded-full bg-red-400/50 mb-1" />
          <span className="text-muted-foreground">50%</span>
        </div>
      </div>
    </div>
  );
}

