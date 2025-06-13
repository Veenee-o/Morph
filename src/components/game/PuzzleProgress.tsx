import * as React from 'react';

interface PuzzleProgressProps {
  currentStep: number;
  totalSteps: number;
  avgMorphs: number;
  className?: string;
}

export const PuzzleProgress: React.FC<PuzzleProgressProps> = ({
  currentStep,
  totalSteps,
  avgMorphs,
  className = '',
}) => {
  const progressPercentage = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center gap-6 text-gray-700 dark:text-gray-300">
        <div className="flex flex-col items-center group relative">
          <span 
            className="text-xs text-gray-500 dark:text-gray-400"
            title={`You're on move ${currentStep} of ${totalSteps}`}
          >
            Move
          </span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-lg">
            {currentStep} / {totalSteps}
          </span>
        </div>

        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

        <div className="flex flex-col items-center group relative">
          <span 
            className="text-xs text-gray-500 dark:text-gray-400"
            title={`Most players solve this puzzle in ${avgMorphs} morphs`}
          >
            Avg. Morphs
          </span>
          <span className="font-medium text-gray-600 dark:text-gray-300">{avgMorphs}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default PuzzleProgress;
