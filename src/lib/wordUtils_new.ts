import type { Puzzle } from '../types/index';

// Word lists by length (medium difficulty only)
const WORD_LISTS = {
  3: [
    ['CAT', 'COT', 'DOT', 'DOG'],
    ['HOT', 'HOP', 'MOP', 'MAP'],
    ['BIG', 'BAG', 'BAT', 'CAT']
  ],
  4: [
    ['COLD', 'CORD', 'CARD', 'WARD', 'WARM'],
    ['FISH', 'DISH', 'DASH', 'DARN', 'YARN'],
    ['WIND', 'WILD', 'WILE', 'WILL', 'WALL']
  ],
  5: [
    ['CRANE', 'CRANK', 'CRACK', 'TRACK', 'TRACE'],
    ['PLATE', 'PLACE', 'PLANE', 'PLANK', 'BLANK'],
    ['STONE', 'ATONE', 'ATONY', 'PEONY', 'PENNY'],
    ['HEART', 'HEARD', 'HEARD', 'HEARD', 'HEARD'],
    ['CLOUD', 'CLOUT', 'FLOUT', 'FLOOR', 'FLOOD']
  ]
};

// Dictionary of all words
const DICTIONARY = new Set<string>();

// Populate dictionary
Object.values(WORD_LISTS).forEach(ladders => {
  ladders.forEach(ladder => {
    ladder.forEach(word => DICTIONARY.add(word.toUpperCase()));
  });
});

// Word frequency data (for future use in difficulty calculation)
const WORD_FREQUENCY: Record<string, number> = {
  // Common words have higher frequency
  'THE': 100, 'AND': 95, 'HAVE': 90, 'THAT': 85, 'FOR': 80,
  // Add more words as needed
};

// Helper function to get a random element from an array
const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const isValidWord = (word: string): boolean => {
  if (!word) return false;
  return DICTIONARY.has(word.toUpperCase());
};

export const isOneLetterDifferent = (word1: string, word2: string): boolean => {
  if (!word1 || !word2 || word1.length !== word2.length) return false;
  
  let differences = 0;
  const upperWord1 = word1.toUpperCase();
  const upperWord2 = word2.toUpperCase();
  
  for (let i = 0; i < upperWord1.length; i++) {
    if (upperWord1[i] !== upperWord2[i]) {
      differences++;
      if (differences > 1) return false;
    }
  }
  
  return differences === 1;
};

// Helper function to calculate word difficulty
const calculateWordDifficulty = (word: string): number => {
  // Simple difficulty calculation based on word length and frequency
  const lengthFactor = Math.min(word.length / 3, 1.5); // 1-1.5x based on length (3-5 letters)
  const frequency = WORD_FREQUENCY[word] || 1; // Default to 1 if not in frequency list
  const frequencyFactor = 1 + (100 - Math.min(frequency, 100)) / 100; // 1-2x based on frequency
  
  return lengthFactor * frequencyFactor;
};

// Helper function to create a puzzle with all required properties
const createPuzzle = (
  startWord: string,
  endWord: string,
  difficulty: 'easy' | 'medium' | 'hard',
  path: string[]
): Puzzle => {
  // Calculate par steps based on optimal path length and difficulty
  const optimalSteps = path.length - 1;
  let parSteps = optimalSteps;
  
  // Adjust par based on difficulty
  switch (difficulty) {
    case 'easy':
      parSteps = Math.ceil(optimalSteps * 1.5); // More lenient
      break;
    case 'hard':
      parSteps = Math.max(optimalSteps - 1, 1); // More challenging
      break;
    // medium stays at optimal
  }

  const now = new Date().toISOString();
  
  return {
    id: `puzzle-${Date.now()}`,
    startWord,
    endWord,
    currentWord: startWord,
    moves: [],
    usedWords: new Set([startWord]),
    wordLength: startWord.length,
    path: [...path],
    isComplete: false,
    isSuccess: false,
    startTime: now,
    endTime: '',
    score: 0,
    difficulty,
    parSteps,
    maxMoves: Math.ceil(optimalSteps * 1.5),
    // Legacy fields
    length: startWord.length,
    date: now.split('T')[0],
    constraint: null,
    featured: false,
    wildcardEnabled: false
  };
};

export const generatePuzzle = (difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Puzzle => {
  // Get all available word lengths (3, 4, 5)
  const availableLengths = Object.keys(WORD_LISTS).map(Number);
  
  // Select a random word length
  const targetLength = getRandomElement(availableLengths);
  
  // Get all ladders of the target length
  const availableLadders = WORD_LISTS[targetLength as keyof typeof WORD_LISTS];
  
  // Select a random ladder
  let ladder = getRandomElement(availableLadders);
  let startWord = ladder[0];
  let endWord = ladder[ladder.length - 1];
  
  // Ensure start and end words are different
  while (startWord === endWord) {
    // If they're the same, pick a different ladder
    ladder = getRandomElement(availableLadders);
    startWord = ladder[0];
    endWord = ladder[ladder.length - 1];
  }
  
  // Create and return the puzzle with the specified difficulty
  return createPuzzle(startWord, endWord, difficulty, ladder);
};

export const validateWord = (word: string, previousWord: string, isFirstWord: boolean): { isValid: boolean; error?: string } => {
  if (!word) {
    return { isValid: false, error: 'Word cannot be empty' };
  }

  if (word.length !== previousWord.length) {
    return { 
      isValid: false, 
      error: `Word must be ${previousWord.length} letters long` 
    };
  }

  if (!isFirstWord && !isOneLetterDifferent(word, previousWord)) {
    return { 
      isValid: false, 
      error: 'Only one letter can be changed at a time' 
    };
  }

  if (!isValidWord(word)) {
    return { 
      isValid: false, 
      error: 'Not a valid word' 
    };
  }

  return { isValid: true };
};
