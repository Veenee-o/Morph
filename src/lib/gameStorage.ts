// Default par values based on word length (can be adjusted based on actual data)
const DEFAULT_PAR_VALUES: Record<number, number> = {
  3: 4,  // 3-letter words: par 4
  4: 5,  // 4-letter words: par 5
  5: 6,  // 5-letter words: par 6
  6: 7,  // 6-letter words: par 7
  7: 8,  // 7-letter words: par 8
};

export interface GameResult {
  id: string;
  startWord: string;
  endWord: string;
  moves: number;
  time: number;
  par: number;
  parScore: number; // -2: Eagle, -1: Birdie, 0: Par, 1: Bogey, 2: Double Bogey, etc.
  date: string;
  wordPath: string[];
  isComplete: boolean;
}

// Calculate par score based on moves and word length (golf-style scoring)
export const calculateParScore = (moves: number, wordLength: number): number => {
  const par = DEFAULT_PAR_VALUES[wordLength] || wordLength + 1;
  // Calculate score as moves - par (negative is good, positive is bad)
  return moves - par;
};

// Get par label based on par score (golf-style scoring)
export const getParLabel = (parScore: number): string => {
  if (parScore <= -2) return `${-parScore} Under Par`;
  if (parScore === -1) return `${-parScore} Under Par`;
  if (parScore === 0) return 'Par';
  if (parScore === 1) return `${parScore} Over Par`;
  if (parScore === 2) return `${parScore} Over Par`;
  return `${parScore} Over Par`;
};

const STORAGE_KEY = 'morph_game_history';
const MAX_HISTORY = 10;

export const saveGameResult = (result: Omit<GameResult, 'id' | 'par' | 'parScore'> & { 
  wordPath: string[]; 
  time: number; 
  isComplete?: boolean;
  par?: number; // Optional par value from the puzzle
}): void => {
  try {
    const history = getGameHistory();
    const wordLength = result.startWord.length;
    // Use the provided par value if it exists and is defined, otherwise calculate from word length
    const par = result.par !== undefined ? result.par : (DEFAULT_PAR_VALUES[wordLength] || wordLength + 1);
    // Use the moves from the result object
    const moves = result.moves;
    // Calculate par score using golf-style scoring (moves - par)
    const parScore = moves - par;
    
    const newGame: GameResult = {
      ...result,
      id: Date.now().toString(),
      par,
      parScore,
      moves,
      isComplete: result.isComplete ?? true,
      date: new Date().toISOString()
    };
    
    // Add new game to the beginning of the array
    const updatedHistory = [newGame, ...history].slice(0, MAX_HISTORY);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save game result:', error);
  }
};

export const getGameHistory = (): GameResult[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load game history:', error);
    return [];
  }
};

// Alias for getGameHistory for backward compatibility
export const getGameResults = getGameHistory;

// Clear all game history
export const clearGameHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game history:', error);
  }
};

// Alias for clearGameHistory
export const clearGameResults = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game history:', error);
  }
};
