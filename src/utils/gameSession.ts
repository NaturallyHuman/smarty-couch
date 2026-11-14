import type { GameState } from '@/types/game';

export const ANSWER_REVEAL_MS = 1200;
export const RULES_VERSION = 'sprint-reveal-1200-v1';
export const remainingReveal = (deadline: number, now: number) => Math.max(0, deadline - now);
export const canAcceptAnswer = (remaining: number, revealing: boolean, paused: boolean, ended: boolean) =>
  remaining > 0 && !revealing && !paused && !ended;

export const createGame = (): GameState => ({
  gameId: crypto.randomUUID(), mode: 'solo', category: 'Mixed', currentRound: 1,
  totalRounds: 3, currentPlayer: 0,
  players: [{ name: 'Player 1', totalScore: 0, correctAnswers: 0, totalQuestions: 0, maxStreak: 0, roundScores: [] }],
  currentRoundScore: 0, currentRoundCorrect: 0, currentStreak: 0, currentMaxStreak: 0, usedQuestionIds: [],
});