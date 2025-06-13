import * as React from 'react';

interface WordListProps {
  words: string[];
  highlightLast?: boolean;
}

export const WordList: React.FC<WordListProps> = ({ words, highlightLast = true }) => {
  if (words.length === 0) return null;

  return (
    <div className="space-y-2">
      {words.map((word, index) => {
        const isLast = index === words.length - 1;
        const isFirst = index === 0;
        const showArrow = index < words.length - 1;
        
        return (
          <div 
            key={`${word}-${index}`} 
            className={`flex items-center ${isLast && highlightLast ? 'font-bold' : ''}`}
          >
            <div 
              className={`inline-flex items-center justify-center rounded-md px-3 py-1 font-mono text-xl ${
                isFirst ? 'bg-blue-100 text-blue-800' : 
                isLast && highlightLast ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}
            >
              {word}
            </div>
            {showArrow && (
              <div className="ml-2 text-gray-400">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Export the component as a named export
export default WordList;
