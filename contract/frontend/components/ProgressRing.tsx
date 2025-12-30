"use client";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  raised: number;
  goal: number;
  currency?: string;
}

export default function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 12,
  raised,
  goal,
  currency = 'STX',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F97316"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">
            {Math.min(progress, 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">funded</div>
        </div>
      </div>

      {/* Funding details */}
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-gray-900">
          {raised.toLocaleString()} {currency}
        </div>
        <div className="text-sm text-gray-500">
          of {goal.toLocaleString()} {currency} goal
        </div>
      </div>
    </div>
  );
}
