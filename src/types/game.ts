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
  categoryStats: {
    [category: string]: {
      correct: number;
      total: number;
    };
  };
}
