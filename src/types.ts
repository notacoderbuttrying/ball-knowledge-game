export type Sport = 'NFL' | 'College Football' | 'NBA' | 'NHL' | 'College Basketball' | 'Soccer' | 'Random' | 'Golf';

export interface Question {
  text: string;
  solutions: string[];
}

export interface GameState {
  selectedSport: Sport | null;
  currentQuestion: Question | null;
  guesses: string[];
  hasAnswered: boolean;
  lastPlayedDate: string | null;
  foundAnswers: string[];
}

export interface QuizData {
  [key: string]: Question[];
}

export interface PotentialAnswers {
  [key: string]: string[][];
}