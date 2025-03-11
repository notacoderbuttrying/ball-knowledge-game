import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Sport } from '../types';
import { getAnswerSuggestions } from '../utils/gameLogic';

interface AnswerInputProps {
  sport: Sport;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  maxGuesses: number;
  currentGuesses: string[];
  correctAnswers: string[];
  foundAnswers: string[];
}

export function AnswerInput({ 
  sport, 
  onSubmit, 
  disabled = false,
  maxGuesses = 5,
  currentGuesses = [],
  correctAnswers = [],
  foundAnswers = []
}: AnswerInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (input.length >= 2) {
      const newSuggestions = getAnswerSuggestions(sport, input);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [input, sport]);

  const options = suggestions.map(suggestion => ({
    value: suggestion,
    label: suggestion
  }));

  const remainingGuesses = Math.max(0, maxGuesses - (currentGuesses?.length || 0));
  const progress = `${foundAnswers.length}/${correctAnswers.length || 0}`;

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center gap-4">
        <Select
          isDisabled={disabled || remainingGuesses <= 0}
          options={options}
          onInputChange={(newValue) => setInput(newValue)}
          onChange={(option) => {
            if (option) {
              onSubmit(option.value);
              setInput('');
            }
          }}
          placeholder={`Type your answer (${remainingGuesses} guesses remaining)...`}
          className="flex-1 text-gray-900"
          isSearchable
          isClearable
          noOptionsMessage={({ inputValue }) => 
            inputValue.length < 2 ? "Type at least 2 characters..." : "No matches found"
          }
        />
        <div className="text-sm font-medium bg-blue-600 px-3 py-1 rounded">
          {progress}
        </div>
      </div>

      {/* Display previous guesses */}
      <div className="space-y-2">
        {currentGuesses?.map((guess, index) => (
          <div 
            key={index}
            className={`px-4 py-2 rounded ${
              correctAnswers.includes(guess) 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {guess}
          </div>
        ))}
      </div>

      {/* Show remaining answers when game is over */}
      {disabled && correctAnswers?.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-lg">All Correct Answers:</h3>
          {correctAnswers.map((answer, index) => (
            <div 
              key={index} 
              className={`px-4 py-2 rounded ${
                foundAnswers.includes(answer)
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              } text-white`}
            >
              {answer}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}