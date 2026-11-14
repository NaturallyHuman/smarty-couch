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
  gameId?: string;
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

export interface ScoreRecord {
  gameId: string;
  score: number;
  completedAt?: string;
  rulesVersion?: string;
  previousBest?: number;
}

export interface LifetimeStats {
  scoreRecords?: ScoreRecord[];
  completedGames?: number;
  unlockedRankIds?: string[];
  recordedGameIds?: string[];
  highestScore: number;
  longestStreak: number;
  timesPlayed: number;
  recentScores: number[]; // newest first, current plus ten previous
  categoryStats: {
    [category: string]: {
      correct: number;
      total: number;
    };
  };
}
