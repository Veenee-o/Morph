import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import RecentGames from '../components/game/RecentGames';
import { GameResult } from '../lib/gameStorage';

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentGames, setRecentGames] = useState<GameResult[]>([]);

  useEffect(() => {
    // Load recent games from storage
    import('../lib/gameStorage').then(({ getGameHistory }) => {
      setRecentGames(getGameHistory());
    });
  }, []);

  const handleStartGame = () => {
    navigate('/play');
  };

  const handleClearHistory = () => {
    import('../lib/gameStorage').then(({ clearGameHistory }) => {
      clearGameHistory();
      setRecentGames([]);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Morph</h1>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Word Ladder
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-300">
            Change one letter at a time to transform words!
          </p>
          <div className="mt-10">
            <button
              onClick={handleStartGame}
              className="px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 md:py-5 md:text-xl md:px-12 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start New Game
            </button>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
              How to Play
            </h2>
            <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-3 text-xl">•</span>
                <span>Start with the given word at the top</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-3 text-xl">•</span>
                <span>Change one letter at a time to form a new valid word</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-3 text-xl">•</span>
                <span>Reach the target word in as few moves as possible</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-3 text-xl">•</span>
                <span>Try to beat the par score!</span>
              </li>
            </ul>
            {recentGames.length > 0 && (
              <div className="mt-12">
                <RecentGames 
                  games={recentGames} 
                  onClearHistory={handleClearHistory} 
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StartPage;
