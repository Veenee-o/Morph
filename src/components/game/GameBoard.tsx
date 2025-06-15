import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WordPath } from './WordPath';
import PuzzleSummary from './PuzzleSummary';
import RecentGames from './RecentGames';
import * as wordUtils from '../../lib/wordUtils';
import { saveGameResult, getGameResults, clearGameResults, GameResult } from '../../lib/gameStorage';
import { useTheme } from '../../context/ThemeContext';
import type { Puzzle as PuzzleType } from '../../types/index';

// Helper function to get time based on word length
const getTimeForWordLength = (word: string): number => {
  const length = word.length;
  // 3 letters: 120s, 4 letters: 210s, 5 letters: 285s
  switch (length) {
    case 3: return 120;
    case 4: return 210;
    case 5: return 285;
    default: return 300; // Default to 5 minutes for other lengths
  }
};

// Interfaces
type LocalGameResult = {
  time: number;
  morphs: number;
  wordPath: string[];
  isComplete: boolean;
  par?: number; // Optional par value from the puzzle
};

type GameState = {
  steps: string[];
  currentStep: number;
  moves: number;
  error: string | null;
  isComplete: boolean;
  isSubmitted: boolean;
  startTime: number | null;
  endTime: number | null;
  timeRemaining: number;
  maxTime: number;
};

type GameBoardProps = {
  onGameComplete?: (result: LocalGameResult) => void;
};

const GameBoard: React.FC<GameBoardProps> = ({ onGameComplete }) => {
  // Refs
  const isMounted = useRef(true);
  
  // State
  const [puzzle, setPuzzle] = useState<PuzzleType | null>(null);
  const [recentGames, setRecentGames] = useState<GameResult[]>([]);
  const [inputValue, setInputValue] = useState('');
  // Stores score = moves - par (negative is good)
  const [score, setScore] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>({
    steps: [],
    currentStep: 0,
    moves: 0,
    error: null,
    isComplete: false,
    isSubmitted: false,
    startTime: null,
    endTime: null,
    timeRemaining: 300,
    maxTime: 300,
  });
  


  // Start a new game
  const startNewGame = useCallback((difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    console.log('Starting new game with difficulty:', difficulty);
    const newPuzzle = wordUtils.generatePuzzle(difficulty);
    console.log('Generated puzzle:', {
      start: newPuzzle.startWord,
      target: newPuzzle.endWord,
      difficulty: newPuzzle.difficulty
    });
    
    const maxTime = getTimeForWordLength(newPuzzle.startWord);
    
    // Reset score at start of new game
    setScore(0);
    
    setPuzzle(newPuzzle);
    setGameState({
      steps: [],
      currentStep: 0,
      moves: 0,
      error: null,
      isComplete: false,
      isSubmitted: false,
      startTime: Date.now(),
      endTime: null,
      timeRemaining: maxTime,
      maxTime,
    });
    setInputValue('');
  }, [setPuzzle, setGameState, setInputValue, setScore]);

  // Handle game completion
  const handleGameComplete = useCallback(async (result: LocalGameResult) => {
    if (!puzzle) return;
    
    // Use puzzle's parSteps if available, otherwise calculate based on word length
    const par = puzzle.parSteps ?? getParForWordLength(puzzle.startWord.length);
    // Add 1 to moves since the start word is not included in result.wordPath
    const moves = result.wordPath.length + 1;
    // Calculate score as moves - par
    // Negative means under par (good), positive means over par (bad)
    const parScore = moves - par;
    
    const gameResult = {
      id: Date.now().toString(),
      startWord: puzzle.startWord,
      endWord: puzzle.endWord,
      time: result.time,
      wordPath: [puzzle.startWord, ...result.wordPath],
      isComplete: result.isComplete,
      moves,
      date: new Date().toISOString(),
      par,
      parScore
    };
    
    // Save the game result
    await saveGameResult(gameResult);
    
    // Update recent games
    const updatedGames = await getGameResults();
    setRecentGames(updatedGames);
    
    // Notify parent component if needed
    if (onGameComplete) {
      onGameComplete(result);
    }
  }, [puzzle, onGameComplete]);

  // Initialize game on mount
  useEffect(() => {
    console.log('Initializing game...');
    startNewGame('medium');
    
    // Load recent games
    const loadRecentGames = async () => {
      try {
        const games = await getGameResults();
        if (isMounted.current) {
          setRecentGames(games);
        }
      } catch (error) {
        console.error('Failed to load recent games:', error);
      }
    };
    
    loadRecentGames();
    
    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [startNewGame]);

  // Handle word submission
  const handleWordSubmit = useCallback((word: string) => {
    if (!puzzle) return;
    
    // Clear any previous errors
    setGameState(prev => ({ ...prev, error: null }));
    
    // Validate word length
    if (word.length !== puzzle.startWord.length) {
      setGameState(prev => ({
        ...prev,
        error: `Word must be ${puzzle.startWord.length} letters long`
      }));
      return;
    }
    
    const currentStep = gameState.currentStep;
    const isFirstWord = currentStep === 0 && gameState.steps.length === 0;
    const previousWord = isFirstWord ? puzzle.startWord : gameState.steps[currentStep - 1];
    
    // For first word, it must be different from the start word
    if (isFirstWord) {
      if (word.toUpperCase() === puzzle.startWord.toUpperCase()) {
        setGameState(prev => ({
          ...prev,
          error: `First word cannot be the same as the start word (${puzzle.startWord})`
        }));
        return;
      }
      // Check if first word is one letter different from start word
      if (!wordUtils.isOneLetterDifferent(word, puzzle.startWord)) {
        setGameState(prev => ({
          ...prev,
          error: 'Must change exactly one letter from the start word'
        }));
        return;
      }
    } else {
      // For subsequent words, check they're one letter different from previous
      if (!wordUtils.isOneLetterDifferent(word, previousWord)) {
        setGameState(prev => ({
          ...prev,
          error: 'Must change exactly one letter from the previous word'
        }));
        return;
      }
    }
    
    // Check if the word is in our dictionary
    if (!wordUtils.isValidWord(word)) {
      setGameState(prev => ({
        ...prev,
        error: 'Not a valid word'
      }));
      return;
    }
    
    // If we've reached the end word, complete the game
    const isComplete = word === puzzle.endWord;
    const endTime = isComplete ? Date.now() : null;
    const currentMoves = gameState.moves + 1;
    
    // Get the updated steps for the game state
    const newSteps = [...gameState.steps];
    if (isFirstWord) {
      newSteps[0] = word; // Update first step if it's the first word
    } else {
      newSteps.push(word); // Add new step for subsequent words
    }
    
    // Update game state
    const newGameState = {
      ...gameState,
      steps: newSteps,
      currentStep: isFirstWord ? 1 : gameState.currentStep + 1,
      moves: currentMoves,
      error: null,
      isComplete,
      endTime
    };
    
    setGameState(newGameState);
    setInputValue('');
    
    // If game is complete, call the handleGameComplete callback
    if (isComplete && gameState.startTime && endTime) {
      const timeElapsed = Math.floor((endTime - gameState.startTime) / 1000);
      const result: LocalGameResult = {
        time: timeElapsed,
        // The number of moves is equal to the number of words in the path (including start and end words) minus 1
        // For example: [start, word1, word2, end] = 3 moves (start->word1, word1->word2, word2->end)
        morphs: newSteps.length, // This is the correct number of moves
        wordPath: newSteps,
        isComplete: true,
        par: puzzle.parSteps ?? getParForWordLength(puzzle.startWord.length)
      };
      handleGameComplete(result);
    }
  }, [puzzle, gameState, handleGameComplete]);

  // Clear recent games
  const clearRecentGames = useCallback(async () => {
    await clearGameResults();
    setRecentGames([]);
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState.startTime && !gameState.isComplete) {
      timer = setInterval(() => {
        setGameState(prev => {
          if (!prev.startTime) return prev;
          
          const now = Date.now();
          const elapsed = Math.floor((now - prev.startTime) / 1000);
          const timeRemaining = Math.max(0, prev.maxTime - elapsed);
          
          if (timeRemaining <= 0) {
            // Time's up!
            clearInterval(timer);
            if (puzzle) {
              const result: LocalGameResult = {
                time: prev.maxTime,
                morphs: prev.moves, // Use moves from gameState
                wordPath: [...prev.steps],
                isComplete: false,
                par: puzzle.parSteps ?? getParForWordLength(puzzle.startWord.length)
              };
              handleGameComplete(result);
            }
            return { ...prev, isComplete: true, timeRemaining: 0 };
          }
          
          return { ...prev, timeRemaining };
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.startTime, gameState.isComplete, handleGameComplete, puzzle]);

  // Initialize recent games on component mount
  useEffect(() => {
    const loadRecentGames = async () => {
      const games = await getGameResults();
      setRecentGames(games);
    };
    
    loadRecentGames();
    
    // Start a new game when component mounts with medium difficulty
    startNewGame('medium');
    
    return () => {
      isMounted.current = false;
    };
  }, [startNewGame]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate par score based on word length
  const getParForWordLength = useCallback((wordLength: number): number => {
    const parMap: Record<number, number> = {
      3: 4,  // 3-letter words: par 4
      4: 5,  // 4-letter words: par 5
      5: 6,  // 5-letter words: par 6
      6: 7,  // 6-letter words: par 7
      7: 8,  // 7-letter words: par 8
    };
    return parMap[wordLength] || wordLength + 1;
  }, []);

  const getParLabel = useCallback((s: number): string => {
    if (s < 0) {
      return `Par ${-s}`;
    } else if (s === 0) {
      return 'Par';
    } else {
      return `Par ${s}`;
    }
  }, []);

  // Render the game board
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          {puzzle && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Change <span className="text-blue-600 dark:text-blue-400">{puzzle.startWord}</span> to{' '}
              <span className="text-blue-600 dark:text-blue-400">{puzzle.endWord}</span>
            </h1>
          )}
        </header>
        
        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Moves */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {gameState.moves}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Morphs
            </div>
          </div>
          
          {/* Time */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatTime(gameState.timeRemaining)}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Time
            </div>
          </div>
          
          {/* Par */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {puzzle ? getParLabel(score) : '-'}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Par
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
          {!gameState.isComplete ? (
            <>
              <WordPath 
                startWord={puzzle?.startWord || ''} 
                endWord={puzzle?.endWord || ''} 
                currentStep={gameState.currentStep} 
                words={gameState.steps} 
              />
              
              <div className="mt-10">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleWordSubmit(inputValue)}
                      className="w-full px-5 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder={`Enter a ${puzzle?.startWord.length}-letter word...`}
                      maxLength={puzzle?.startWord.length}
                      disabled={gameState.isComplete}
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => handleWordSubmit(inputValue)}
                    disabled={!inputValue || gameState.isComplete}
                    className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Submit
                  </button>
                </div>
                {gameState.error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {gameState.error}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {gameState.isComplete && puzzle && gameState.startTime && gameState.endTime && (
                <PuzzleSummary
                  puzzle={puzzle}
                  moves={gameState.steps.length}
                  time={Math.floor((gameState.endTime - gameState.startTime) / 1000)}
                  path={gameState.steps}
                  onPlayAgain={() => startNewGame('medium')}
                />
              )}
            </>
          )}
        </div>

        {/* How to Play */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How to Play</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Start with the given word at the top</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Change one letter at a time to form a new valid word</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Reach the target word in as few moves as possible</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Try to beat the par score!</span>
            </li>
          </ul>
        </div>

        {/* Recent Games */}
        <div className="mt-8">
          <RecentGames games={recentGames} onClearHistory={clearRecentGames} />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
