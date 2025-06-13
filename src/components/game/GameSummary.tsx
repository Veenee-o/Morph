import * as React from 'react';
// Using text instead of icon to avoid dependency issues

interface GameSummaryProps {
  score: number;
  time: number;
  morphs: number;
  wordPath: string[];
  isComplete: boolean;
  onShare?: () => void;
  onPlayAgain?: () => void;
}

const GameSummary: React.FC<GameSummaryProps> = ({
  score,
  time,
  morphs,
  wordPath,
  isComplete,
  onShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my Morph game result!',
        text: `I scored ${score} points in Morph! Can you beat my score?`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  },
  onPlayAgain = () => {
    window.location.reload();
  },
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
      {/* Game Stats Row */}
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>Score: <strong className="text-black">{score}</strong></span>
        <span>Time: <strong className="text-black">{time}s</strong></span>
        <span>Morphs: <strong className="text-black">{morphs}</strong></span>
      </div>

      {/* Word Path */}
      <div className="flex flex-wrap items-center gap-2 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 mb-4">
        {wordPath.map((word, index) => (
          <React.Fragment key={index}>
            <span 
              className={`px-4 py-1 rounded-full text-sm ${
                index === 0 
                  ? 'bg-indigo-600 text-white' 
                  : 'border border-indigo-600 text-indigo-600'
              }`}
            >
              {word}
            </span>
            {index < wordPath.length - 1 && (
              <span>→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Success Message */}
      {isComplete && (
        <div className="bg-green-500 text-white text-sm rounded-lg p-4 mb-4">
          <p>Success! You completed the puzzle in {morphs} moves with {time} seconds left!</p>
          <p className="font-bold mt-1">Final Score: {score}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={onShare}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm transition-colors"
        >
          Share Result
        </button>
        <button 
          onClick={onPlayAgain}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameSummary;
