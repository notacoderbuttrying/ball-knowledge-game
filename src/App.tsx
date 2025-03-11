/// <reference types="react" />
/// <reference types="react-dom" />

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { Sport, GameState, Question } from './types';
import { getQuestionForDate, checkAnswer } from './utils/gameLogic';
import { AnswerInput } from './components/AnswerInput';

const SPORTS: Sport[] = [
  'NFL',
  'College Football',
  'NBA',
  'NHL',
  'College Basketball',
  'Soccer',
  'Random',
  'Golf'
];

const MAX_GUESSES = 5;

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('gameState');
    if (!saved) {
      return {
        selectedSport: null,
        currentQuestion: null,
        guesses: [],
        hasAnswered: false,
        lastPlayedDate: null,
        foundAnswers: []
      };
    }
    try {
      return JSON.parse(saved) as GameState;
    } catch {
      return {
        selectedSport: null,
        currentQuestion: null,
        guesses: [],
        hasAnswered: false,
        lastPlayedDate: null,
        foundAnswers: []
      };
    }
  });

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  useEffect(() => {
    if (gameState.lastPlayedDate !== today) {
      setGameState((prev: GameState) => ({
        ...prev,
        hasAnswered: false,
        guesses: [],
        foundAnswers: [],
        lastPlayedDate: today
      }));
    }
  }, [today]);

  // Debounce localStorage updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('gameState', JSON.stringify(gameState));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  const handleSportSelect = useCallback((sport: Sport) => {
    const question = getQuestionForDate(sport);
    setGameState((prev: GameState) => ({
      ...prev,
      selectedSport: sport,
      currentQuestion: question,
      guesses: [],
      foundAnswers: [],
      hasAnswered: false
    }));
  }, []);

  const handleAnswerSubmit = useCallback((answer: string) => {
    if (!gameState.currentQuestion) return;

    setGameState((prev: GameState) => {
      if (!prev.currentQuestion) return prev;

      const newGuesses = [...(prev.guesses || []), answer];
      const isCorrect = checkAnswer(answer, prev.currentQuestion.solutions);
      
      const newFoundAnswers = isCorrect && !prev.foundAnswers.includes(answer) 
        ? [...(prev.foundAnswers || []), answer]
        : prev.foundAnswers;

      const isGameOver = prev.currentQuestion.solutions && (
        newFoundAnswers.length === prev.currentQuestion.solutions.length || 
        newGuesses.length >= MAX_GUESSES
      );

      return {
        ...prev,
        guesses: newGuesses,
        foundAnswers: newFoundAnswers,
        hasAnswered: isGameOver
      };
    });
  }, [gameState.currentQuestion]);

  // Memoize the game status for performance
  const gameStatus = useMemo(() => {
    if (!gameState.currentQuestion || !gameState.hasAnswered) return null;
    
    return {
      isComplete: gameState.foundAnswers.length === gameState.currentQuestion.solutions.length,
      foundCount: gameState.foundAnswers.length,
      totalAnswers: gameState.currentQuestion.solutions.length
    };
  }, [gameState.currentQuestion, gameState.hasAnswered, gameState.foundAnswers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <header className="py-6 px-4 border-b border-blue-600">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy size={32} className="text-yellow-400" />
            <h1 className="text-3xl font-bold">Ball Knowledge</h1>
          </div>
          <p className="text-center text-blue-200 mb-6">
            Daily Sports Trivia - Updated for {format(new Date(), 'MMMM d, yyyy')}
          </p>
          
          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SPORTS.map(sport => (
              <button
                key={sport}
                onClick={() => handleSportSelect(sport)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${gameState.selectedSport === sport 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-800 hover:bg-blue-700 text-blue-100'}
                `}
              >
                {sport}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {!gameState.selectedSport ? (
          <div className="text-center py-12">
            <p className="text-xl text-blue-200">Select a sport to start playing!</p>
          </div>
        ) : (
          <section className="bg-blue-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">{gameState.selectedSport} Trivia</h2>
            {gameState.currentQuestion && (
              <div className="space-y-4">
                <p className="text-lg mb-6">{gameState.currentQuestion.text}</p>
                <AnswerInput
                  sport={gameState.selectedSport}
                  onSubmit={handleAnswerSubmit}
                  disabled={gameState.hasAnswered}
                  maxGuesses={MAX_GUESSES}
                  currentGuesses={gameState.guesses || []}
                  correctAnswers={gameState.currentQuestion.solutions || []}
                  foundAnswers={gameState.foundAnswers || []}
                />
                {gameState.hasAnswered && gameState.currentQuestion.solutions && gameStatus && (
                  <div className="mt-4 p-4 rounded bg-blue-700">
                    <p className="text-blue-200">
                      {gameStatus.isComplete
                        ? "Congratulations! You found all the answers!"
                        : `Game Over! You found ${gameStatus.foundCount} out of ${gameStatus.totalAnswers} answers.`
                      }
                      {" Come back tomorrow for a new question!"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="py-4 text-center text-blue-300 border-t border-blue-600">
        <p>
          © 2025 notacoderbuttrying. All rights reserved. |{' '}
          <a 
            href="https://github.com/notacoderbuttrying" 
            className="text-blue-200 hover:text-white transition-colors"
            target="_blank" 
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;