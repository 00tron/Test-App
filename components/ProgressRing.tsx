
import React from 'react';

interface ProgressRingProps {
  current: number;
  target: number;
  size?: number;
  stroke?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ current, target, size = 200, stroke = 12 }) => {
  const radius = (size / 2) - (stroke * 2);
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((current / target) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          className="text-orange-100"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-orange-500 transition-all duration-700 ease-out"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold text-gray-800">{Math.round(percentage)}%</span>
        <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Complete</div>
      </div>
    </div>
  );
};

export default ProgressRing;
