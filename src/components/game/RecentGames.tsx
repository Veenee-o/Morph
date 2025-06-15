import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GameResult } from '../../lib/gameStorage';

// Helper function to format par score with golf-style notation and symbols
// e.g., +1 (Par 8), -4 (Par 5), Par (8)
const formatGolfScore = (score: number, par: number): string => {
  if (score === 0) return `Par (${par})`;
  const symbol = score > 0 ? '+' : '−'; // Unicode minus sign for better appearance
  return `${symbol}${Math.abs(score)} (Par ${par})`;
};

// Helper function to get background color for score badge
const getScoreBackground = (score: number): string => {
  if (score < 0) return '#e6ffed'; // light green
  if (score === 0) return '#e6f0ff'; // light blue
  return '#ffe6e6'; // light red
};

// Helper function to get the appropriate color class for the score
const getScoreColor = (score: number): string => {
  if (score < 0) return 'text-green-600';  // Under par (good)
  if (score === 0) return 'text-blue-600'; // Par (even)
  return 'text-red-600';                    // Over par (bad)
};

export interface RecentGamesProps {
  games: GameResult[];
  onClearHistory?: () => void;
  className?: string;
}

const RecentGames: React.FC<RecentGamesProps> = ({ games, onClearHistory, className = '' }) => {
  if (games.length === 0) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClearHistory = () => {
    if (onClearHistory) onClearHistory();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-colors duration-200">
      <div className="relative text-center mb-6">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Recent Games</h2>
        {games.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="absolute top-0 right-0 px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Puzzle
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Moves
              </th>
              <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {games.slice(0, 5).map((game) => (
              <tr key={game.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {game.startWord} → {game.endWord}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(game.date), { addSuffix: true })}
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {game.moves}
                </td>
                <td className="px-3 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {formatTime(game.time)}
                </td>
                <td className="px-3 py-3 text-center text-sm font-medium">
                  {!game.isComplete ? (
                    <span className="text-gray-500 italic">Incomplete</span>
                  ) : (
                    <div className="flex items-center justify-end space-x-1">
                      <span 
                        className={getScoreColor(game.moves - game.par)}
                        style={{
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: getScoreBackground(game.moves - game.par),
                        }}
                      >
                        {formatGolfScore(game.moves - game.par, game.par)}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentGames;
