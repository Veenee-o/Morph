import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import GameBoard from '../components/game/GameBoard';
import ThemeToggle from '../components/ui/ThemeToggle';

const GamePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGameComplete = (result: any) => {
    // Handle game completion (save to leaderboard, etc.)
    console.log('Game completed:', result);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Morph
            </button>
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <GameBoard onGameComplete={handleGameComplete} />
        </div>
      </main>
    </div>
  );
};

export default GamePage;
