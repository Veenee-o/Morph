import * as React from 'react';
import { Share2, RotateCcw, Trophy, Move, Clock } from 'lucide-react';

interface PuzzleSummaryProps {
  puzzle: {
    startWord: string;
    endWord: string;
    parSteps?: number; // dynamic par value if provided
  };
  moves: number;
  time: number; // in seconds
  path: string[];
  onPlayAgain: () => void;
  className?: string;
}

// Helper function to get par for word length
const getParForWordLength = (wordLength: number): number => {
  const parMap: Record<number, number> = {
    3: 4,  // 3-letter words: par 4
    4: 5,  // 4-letter words: par 5
    5: 6,  // 5-letter words: par 6
    6: 7,  // 6-letter words: par 7
    7: 8,  // 7-letter words: par 8
  };
  return parMap[wordLength] || wordLength + 1;
};

// Helper function to get par label
const getParLabel = (score: number, forTrophy: boolean = false, par: number = 0): string => {
  // Score is calculated as moves - par, so negative means under par (good) - shows as -X (green)
  // - Zero means par (even) - shows as E (blue)
  // - Positive score means over par (bad) - shows as +X (red)
  
  if (forTrophy) {
    // For trophy display, show the relative score (moves - par)
    if (score < 0) return `${score}`;  // Under par (good) - will show as negative
    if (score === 0) return `Par ${par}`;       // 'Par X' for par
    return `+${score}`;                // Over par (bad) - will show as positive with +
  } else {
    // For other displays, show the traditional par format
    if (score < 0) return `${Math.abs(score)} Under`;  // Under par (good)
    if (score === 0) return 'Par';                   // Exactly par
    return `${score} Over`;                           // Over par (bad)
  }
};

export const PuzzleSummary: React.FC<PuzzleSummaryProps> = ({
  puzzle,
  moves,
  time,
  path,
  onPlayAgain,
  className = '',
}) => {
  const par = puzzle.parSteps ?? getParForWordLength(puzzle.startWord.length);
  // Calculate par score as moves - par so negative means under par (good), positive means over par (bad)
  const parScore = moves - par;
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  const handleShare = async () => {
    const shareData = {
      title: 'I just solved a Morph puzzle!',
      text: `I completed the puzzle in ${moves} moves (${getParLabel(parScore, true, par)})!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareData.text);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Puzzle Complete!</h2>
        <p className="text-blue-100 text-sm">
          {moves <= 5 ? '🎉 Amazing! ' : moves <= 8 ? 'Great job! ' : 'Nice work! '}
          You solved the puzzle in {moves} moves
        </p>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Score</span>
              <span className={`text-2xl font-bold ${
                parScore < 0 ? 'text-green-600' : parScore === 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {getParLabel(parScore, true, par)}
              </span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <Move className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Moves</span>
              <span className="text-2xl font-bold text-gray-900">{moves}</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Time</span>
              <span className="text-2xl font-bold text-gray-900">{formatTime(time)}</span>
            </div>
          </div>
        </div>

        {/* Word Path */}
        {path.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Your Path</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[puzzle.startWord, ...path].map((word, index) => (
                  <React.Fragment key={index}>
                    <React.Fragment key={index}>
                      <div className={`relative px-3 py-1.5 rounded-lg text-center min-w-[60px] ${
                        index === 0 
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-medium' 
                          : index === path.length 
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 font-medium'
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                      }`}>
                        {word}
                        {index === 0 && <div className="absolute -bottom-4 left-0 right-0 text-[10px] text-gray-500 dark:text-gray-400">Start</div>}
                        {index === path.length && <div className="absolute -bottom-4 left-0 right-0 text-[10px] text-gray-500 dark:text-gray-400">End</div>}
                      </div>
                      {index < path.length && (
                        <div className="text-gray-300 dark:text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 p-6 border-t border-gray-100">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-blue-500 hover:bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PuzzleSummary;
