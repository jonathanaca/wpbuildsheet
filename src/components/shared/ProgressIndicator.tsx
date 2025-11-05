import React from 'react';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  label,
  showPercentage = true,
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  const getColor = () => {
    if (normalizedProgress === 0) return 'bg-gray-200';
    if (normalizedProgress < 50) return 'bg-warning';
    if (normalizedProgress < 100) return 'bg-primary';
    return 'bg-success';
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">
              {normalizedProgress.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300 ease-in-out`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};
