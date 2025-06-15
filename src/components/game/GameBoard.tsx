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

// Helper function to get par based on word length
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
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // Helper function to get par based on word length
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
  }, [puzzle, gameState]);

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
            clearInterval(timer);
            setShowTimeoutModal(true);
            if (puzzle) {
              const result: LocalGameResult = {
                time: prev.maxTime,
                morphs: prev.moves,
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4">
          {puzzle && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{puzzle.startWord}</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-lg font-semibold">{puzzle.endWord}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Time:</span>
                  <span className="text-sm font-medium">
                    {Math.floor(gameState.timeRemaining / 60)}:{
                      Math.floor(gameState.timeRemaining % 60)
                        .toString()
                        .padStart(2, '0')
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Moves:</span>
                <span className="text-sm font-medium">{gameState.moves}</span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleWordSubmit(inputValue);
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                  placeholder="Enter a word..."
                  disabled={gameState.isComplete || showTimeoutModal}
                  autoFocus
                />
                <button
                  onClick={() => handleWordSubmit(inputValue)}
                  disabled={!inputValue || gameState.isComplete || showTimeoutModal}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-400"
                >
                  Submit
                </button>
              </div>
              <WordPath 
                startWord={puzzle?.startWord || ''} 
                endWord={puzzle?.endWord || ''} 
                currentStep={gameState.currentStep} 
                words={gameState.steps} 
              />
              {gameState.error && (
                <div className="text-red-500 text-sm">{gameState.error}</div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {puzzle && (
                <PuzzleSummary
                  puzzle={puzzle}
                  moves={gameState.steps.length}
                  time={gameState.endTime ? Math.floor((gameState.endTime - gameState.startTime!) / 1000) : 0}
                  path={gameState.steps}
                  onPlayAgain={() => startNewGame('medium')}
                />
              )}
              <RecentGames games={recentGames} />
            </div>
          </div>
        </div>
      </div>
      {showTimeoutModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTimeoutModal(false);
              startNewGame('medium');
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="timeout-modal-title"
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 
              id="timeout-modal-title"
              className="text-2xl font-bold text-blue-600 mb-4"
            >
              Time's Up!
            </h2>
            <p className="text-gray-600 mb-6">
              The puzzle was: <strong>{puzzle?.startWord} → {puzzle?.endWord}</strong>
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowTimeoutModal(false);
                  startNewGame('medium');
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoFocus
              >
                Retry
              </button>
              <button
                onClick={() => {
                  setShowTimeoutModal(false);
                  startNewGame('medium');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                New Puzzle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) as React.ReactElement;
};

export default GameBoard;
