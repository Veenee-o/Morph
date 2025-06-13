import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

interface WordInputProps {
  currentWord: string;
  value: string;
  onChange: (word: string) => void;
  onSubmit: (word: string) => void;
  disabled?: boolean;
  error?: string | null;
  startWord?: string;
  isComplete?: boolean;
}

export const WordInput: React.FC<WordInputProps> = ({
  currentWord,
  value,
  onChange,
  onSubmit,
  disabled = false,
  error = null,
  startWord = '',
  isComplete = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the current word changes
  useEffect(() => {
    if (inputRef.current && !disabled && !isComplete) {
      inputRef.current.focus();
    }
  }, [currentWord, disabled, isComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters and convert to uppercase
    const newValue = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
    onChange(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length === currentWord.length) {
      onSubmit(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full word-input">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          maxLength={currentWord.length}
          disabled={disabled}
          className={`w-full p-3 text-2xl text-center font-mono border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : 'bg-white'} no-underline`}
          placeholder={'_'.repeat(currentWord.length)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck="false"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.length === currentWord.length) {
              handleSubmit(e);
            }
          }}
        />
        {error && (
          <div className="mt-2 text-sm text-red-600">{error}</div>
        )}
      </div>

    </form>
  );
};

// Export the component as a named export
export default WordInput;
