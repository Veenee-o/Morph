export interface Puzzle {
  id: string;
  startWord: string;
  endWord: string;
  currentWord: string;
  moves: string[];
  usedWords: Set<string>;
  wordLength: number;
  path: string[];
  
  // Game state
  isComplete: boolean;
  isSuccess: boolean;
  startTime: string;
  endTime: string;
  score: number;
  
  // Puzzle metadata
  difficulty: 'easy' | 'medium' | 'hard';
  parSteps: number;
  maxMoves: number;
  
  // Legacy fields
  constraint?: string | null;
  wildcardEnabled?: boolean;
  featured?: boolean;
  date?: string;
  length?: number;
  minSteps?: number;
  maxSteps?: number;
}

export interface GameState {
  currentStep: number;
  steps: string[];
  isComplete: boolean;
  isSubmitted: boolean;
  startTime: number | null;
  endTime: number | null;
  error: string | null;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  lastPlayed: string | null;
}

export interface DailyPuzzle extends Puzzle {
  date: string;
  solution: string[];
  averageSteps: number;
  totalPlays: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
