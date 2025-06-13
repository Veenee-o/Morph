import * as React from 'react';

interface GameStatsProps {
  steps: number;
  parSteps?: number; // Made optional with ?
  startTime?: number | null;
  endTime?: number | null;
}

export const GameStats: React.FC<GameStatsProps> = ({
  steps,
  parSteps,
  startTime,
  endTime,
}) => {
  // Calculate time taken if we have both start and end times
  let timeTaken: string | null = null;
  if (startTime && endTime) {
    const seconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timeTaken = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Calculate if the solution is under, at, or over par
  let parText = '';
  let textColor = '';
  
  if (parSteps !== undefined) {
    const parComparison = steps - parSteps;
    if (parComparison < 0) {
      parText = `${Math.abs(parComparison)} under par`;
      textColor = 'text-green-600';
    } else if (parComparison === 0) {
      parText = `Par (${parSteps} steps)`;
      textColor = 'text-green-600';
    } else {
      parText = `${parComparison} over par`;
      textColor = 'text-red-600';
    }
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Game Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{steps}</div>
          <div className="text-sm text-gray-500">Steps</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{parSteps}</div>
          <div className="text-sm text-gray-500">Par</div>
        </div>
        {timeTaken && (
          <div className="text-center">
            <div className="text-2xl font-bold">{timeTaken}</div>
            <div className="text-sm text-gray-500">Time</div>
          </div>
        )}
        <div className="text-center">
          <div className={`text-2xl font-bold ${textColor}`}>
            {parText}
          </div>
          <div className="text-sm text-gray-500">Result</div>
        </div>
      </div>
    </div>
  );
};

// Export the component as a named export
export default GameStats;
