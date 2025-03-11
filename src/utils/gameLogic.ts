import { format } from 'date-fns';
import { Question, Sport } from '../types';
import { quizData } from '../data/questions';
import { potentialAnswers } from '../data/answers';

export function getQuestionForDate(sport: Sport): Question | null {
  const questions = quizData[sport];
  if (!questions) return null;
  
  // Use the current date to deterministically select a question
  const today = format(new Date(), 'yyyy-MM-dd');
  const dateNumber = parseInt(today.replace(/-/g, ''), 10);
  const index = dateNumber % questions.length;
  
  return questions[index];
}

export function checkAnswer(answer: string, solutions: string[]): boolean {
  const normalizedAnswer = answer.toLowerCase().trim();
  return solutions.some(solution => solution.toLowerCase().trim() === normalizedAnswer);
}

export function getAnswerSuggestions(sport: Sport, input: string): string[] {
  if (!potentialAnswers[sport]) return [];
  
  // Get all possible answers for the sport from our curated list
  const allAnswers = new Set<string>();
  potentialAnswers[sport].forEach(answerSet => {
    answerSet.forEach(answer => allAnswers.add(answer));
  });
  
  // Filter suggestions based on input
  const normalizedInput = input.toLowerCase().trim();
  return Array.from(allAnswers)
    .filter(answer => answer.toLowerCase().includes(normalizedInput))
    .sort((a, b) => {
      // Prioritize answers that start with the input
      const aStarts = a.toLowerCase().startsWith(normalizedInput);
      const bStarts = b.toLowerCase().startsWith(normalizedInput);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    })
    .slice(0, 5); // Limit to 5 suggestions
}