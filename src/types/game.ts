export interface Question {
  id: string;
  category: string;
  difficulty: number;
  text: string;
  choices: string[];
  correctIndex: number;
}

export type GameMode = 'solo' | 'two-player';

export interface PlayerStats {
  name: string;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  maxStreak: number;
  roundScores: number[];
  // Aggregated across all rounds in the current game
  correctByCategory?: { [category: string]: number };
  attemptedByCategory?: { [category: string]: number };
  // Whether the game ended on a wrong answer (for awards)
  endedOnWrong?: boolean;
  // Total streak bonus points earned across all rounds in the current game
  streakBonusTotal?: number;
}

export interface GameState {
  mode: GameMode;
  category: string;
  currentRound: number;
  totalRounds: number;
  currentPlayer: number;
  players: PlayerStats[];
  currentRoundScore: number;
  currentRoundCorrect: number;
  currentStreak: number;
  currentMaxStreak: number;
  usedQuestionIds: string[];
}

export interface RoundResult {
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  maxStreak: number;
  streakBonus: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: PlayerStats) => boolean;
}

export interface LifetimeStats {
  highestScore: number;
  longestStreak: number;
  timesPlayed: number;
  recentScores: number[]; // newest first, max 10
  categoryStats: {
    [category: string]: {
      correct: number;
      total: number;
    };
  };
}
