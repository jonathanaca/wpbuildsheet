import React from 'react';
import { Sparkles } from 'lucide-react';

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

  const getGradient = () => {
    if (normalizedProgress === 0) return 'from-gray-300 to-gray-300';
    if (normalizedProgress < 50) return 'from-electric-amber via-electric-orange to-electric-rose';
    if (normalizedProgress < 100) return 'from-primary via-electric-cyan to-electric-purple';
    return 'from-electric-emerald via-electric-lime to-electric-emerald';
  };

  return (
    <div className="w-full glass-strong rounded-2xl p-6 border border-primary/20 dark:border-electric-cyan/20">
      {label && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary dark:text-electric-cyan" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">{label}</span>
          </div>
          {showPercentage && (
            <span className="text-3xl font-black gradient-text">
              {normalizedProgress.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="relative w-full h-4 glass rounded-full overflow-hidden border border-primary/10 dark:border-electric-cyan/10">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Progress bar */}
        <div
          className={`relative h-full bg-gradient-to-r ${getGradient()} transition-all duration-500 ease-out shadow-neon`}
          style={{ width: `${normalizedProgress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-gradient" />
        </div>
      </div>
    </div>
  );
};
