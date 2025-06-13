import * as React from 'react';
import { useState } from 'react';
import type { Puzzle } from '../../types/index';

interface ShareButtonProps {
  steps: string[];
  puzzle: Puzzle;
  stepCount: number;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ steps, puzzle, stepCount }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const shareText = `🧩 MORPH (${stepCount} steps)\n\n${steps.join(' → ')}\n\n#MorphGame`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Morph Game',
      text: `I solved today's Morph in ${stepCount} steps!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error('Error sharing:', err);
      handleCopy();
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleShare}
        className="w-full bg-purple-500 text-white py-2 px-4 rounded-md flex items-center justify-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        {isCopied ? 'Copied!' : 'Share Result'}
      </button>
      <div className="text-xs text-center text-gray-500">
        Share your solution with friends!
      </div>
    </div>
  );
};

// Export the component as a named export
export default ShareButton;
