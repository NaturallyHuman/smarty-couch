export interface Question {
  id: string;
  category: string;
  difficulty: number;
  text: string;
  choices: string[];
  correctIndex: number;
}

export type GameMode = 'solo' | 'teams';

export interface GameState {
  mode: GameMode;
  category: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  correctAnswers: number;
  streak: number;
  maxStreak: number;
  timeRemaining: number;
  answers: (number | null)[];
}

export interface RoundResult {
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  maxStreak: number;
  streakBonus: number;
}

export interface LifetimeStats {
  highestScore: number;
  longestStreak: number;
  timesPlayed: number;
  categoryStats: {
    [category: string]: {
      correct: number;
      total: number;
    };
  };
}
