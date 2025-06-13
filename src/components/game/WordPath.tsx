import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordPathProps {
  words: string[];
  currentStep: number;
  startWord: string;
  endWord: string;
}

export const WordPath: React.FC<WordPathProps> = ({
  words,
  currentStep,
  startWord,
  endWord
}) => {
  // Filter out empty words and create the full path
  const submittedWords = words.filter(word => word && word !== endWord);
  const allWords = [startWord, ...submittedWords];
  if (!submittedWords.includes(endWord) && endWord !== startWord) {
    allWords.push(endWord);
  }
  
  // Function to render a word with appropriate styling
  const renderWord = (word: string, index: number, isLast: boolean = false) => {
    const isStartWord = index === 0 && word === startWord;
    const isEndWord = isLast || word === endWord;
    const isSubmitted = index > 0 && !isEndWord && word !== startWord;
    const isCurrent = index === currentStep + 1; // +1 because startWord is at 0
    const isCompleted = index < currentStep + 1;
    
    return (
      <div 
        className={`relative px-3 py-2 md:px-4 md:py-2 rounded-xl text-center transition-all duration-200 flex-shrink-0 ${
          isStartWord 
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-2 border-blue-200 dark:border-blue-800 font-semibold' 
            : isEndWord
              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-2 border-purple-200 dark:border-purple-800 font-semibold'
              : isCurrent
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-blue-500 dark:border-blue-400 shadow-md font-medium'
                : isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-green-200 border-2 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-600'
        }`}
      >
        <div className="text-sm md:text-base lg:text-lg">
          {word}
        </div>
        {isStartWord && (
          <div className="absolute -bottom-5 left-0 right-0 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
            Start
          </div>
        )}
        {isEndWord && (
          <div className="absolute -bottom-5 left-0 right-0 text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
            Target
          </div>
        )}
      </div>
    );
  };
  
  // Function to render the arrow between words
  const renderArrow = (key: string) => (
    <motion.div 
      key={key}
      className="mx-1 text-gray-300 dark:text-gray-600 flex-shrink-0"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 md:h-5 md:w-5"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M9 5l7 7-7 7" 
        />
      </svg>
    </motion.div>
  );

  // Split words into chunks to handle wrapping
  const MAX_WORDS_PER_ROW = 5;
  const wordChunks = [];
  
  // First, create pairs of words and arrows
  const items = [];
  for (let i = 0; i < allWords.length; i++) {
    // Add word
    items.push({
      type: 'word' as const,
      content: allWords[i],
      index: i,
      isLast: i === allWords.length - 1
    });
    
    // Add arrow if not the last item
    if (i < allWords.length - 1) {
      items.push({
        type: 'arrow' as const,
        content: `arrow-${i}`,
        index: -1,
        isLast: false
      });
    }
  }
  
  // Then split into chunks for display
  const itemsPerChunk = MAX_WORDS_PER_ROW * 2 - 1; // Words + arrows
  for (let i = 0; i < items.length; i += itemsPerChunk) {
    wordChunks.push(items.slice(i, i + itemsPerChunk));
  }

  return (
    <div className="w-full py-4 px-2">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          <div className="flex flex-col gap-2">
            {wordChunks.map((chunk, chunkIndex) => (
              <motion.div 
                key={`chunk-${chunkIndex}`}
                className="flex flex-wrap items-center justify-center gap-1 md:gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: chunkIndex * 0.1 }}
              >
                {chunk.map((item, itemIndex) => (
                  <React.Fragment key={`${item.type}-${item.content}`}>
                    {item.type === 'word' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                      >
                        {renderWord(item.content, item.index, item.isLast)}
                      </motion.div>
                    ) : (
                      renderArrow(item.content)
                    )}
                  </React.Fragment>
                ))}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordPath;
