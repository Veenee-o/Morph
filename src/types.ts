export interface GameState {
  currentStep: number;
  steps: string[];
  isComplete: boolean;
  isSubmitted: boolean;
  moves?: number; // Made optional
  startTime: number;
  endTime: number | null;
  error: string | null;
  timeRemaining: number;
  maxTime: number;
}

export interface Game {
  id: number;
  startWord: string;
  endWord: string;
  moves: number;
  time: number;
  date: string;
  score: number;
}

export interface GameResult {
  score: number;
  time: number;
  morphs: number;
  wordPath: string[];
  isComplete: boolean;
}
