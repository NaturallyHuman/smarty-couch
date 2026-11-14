import { describe, test, expect, beforeEach } from 'bun:test';
import { createGame, ANSWER_REVEAL_MS, remainingReveal, canAcceptAnswer, RULES_VERSION } from './gameSession.ts';
import { categorySummary, previousScores } from './scoreHistory.ts';
import { calculateScore } from './scoring.ts';
import { recordGameScore, loadLifetimeStats } from './lifetimeStats.ts';

beforeEach(() => {
  const data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
});
test('replay starts a new zero-score three-round solo game', () => {
  const first = createGame(); const next = createGame();
  expect(next.gameId).not.toBe(first.gameId);
  expect(next.players[0].totalScore).toBe(0);
  expect(next.totalRounds).toBe(3); expect(next.currentRound).toBe(1); expect(next.mode).toBe('solo');
});
test('answer reveal lasts 1200 ms and pauses with remaining duration', () => {
  expect(ANSWER_REVEAL_MS).toBe(1200);
  expect(remainingReveal(1200, 500)).toBe(700);
  expect(remainingReveal(1200, 1400)).toBe(0);
});
test('expired, paused and revealing rounds reject new answers', () => {
  expect(canAcceptAnswer(1, false, false, false)).toBe(true);
  expect(canAcceptAnswer(0, false, false, false)).toBe(false);
  expect(canAcceptAnswer(1, true, false, false)).toBe(false);
  expect(canAcceptAnswer(1, false, true, false)).toBe(false);
  expect(canAcceptAnswer(1, false, false, true)).toBe(false);
});
test('three correct answers earn 350 and a miss never subtracts earned points', () => {
  let score = [1, 2, 3].reduce((total, streak) => total + calculateScore(true, 0, 60, streak).points, 0);
  expect(score).toBe(350);
  score += calculateScore(false, 0, 60, 0).points; expect(score).toBe(350);
  score += calculateScore(true, 0, 60, 1).points; expect(score).toBe(450);
});
test('keep ten previous completed scores after saving current game', () => {
  for (let i = 0; i < 11; i++) recordGameScore(i * 100, 0, `game-${i}`);
  const stats = loadLifetimeStats(); const history = previousScores(stats, 'game-10');
  expect(history.map(record => record.score)).toEqual([900,800,700,600,500,400,300,200,100,0]);
  expect(stats.scoreRecords[0].rulesVersion).toBe(RULES_VERSION);
});
test('legacy scores retain unknown dates and timing', () => {
  localStorage.setItem('smarty-couch-stats', JSON.stringify({ recentScores: [400, 200], highestScore: 400 }));
  const history = previousScores(recordGameScore(600, 0, 'current').stats, 'current');
  expect(history.map(record => record.score)).toEqual([400, 200]);
  expect(history[0].completedAt).toBeUndefined(); expect(history[0].rulesVersion).toBeUndefined();
});
test('category ranking requires two attempts and never invents a worst category', () => {
  expect(categorySummary({ attemptedByCategory: { Science: 1 }, correctByCategory: { Science: 1 } }).best).toBeUndefined();
  const summary = categorySummary({ attemptedByCategory: { Science: 2 }, correctByCategory: { Science: 2 } });
  expect(summary.best.cat).toBe('Science'); expect(summary.worst).toBeUndefined();
});
test('category accuracy outranks raw correct count with stable ties', () => {
  const summary = categorySummary({ attemptedByCategory: { History: 9, Science: 9, Movies: 2 }, correctByCategory: { History: 9, Science: 3, Movies: 2 } });
  expect(summary.best.cat).toBe('History'); expect(summary.worst.cat).toBe('Science');
});
test('save failure is reported while final score remains available', () => {
  localStorage.setItem = () => { throw new Error('Storage blocked'); };
  const result = recordGameScore(350, 3, 'game');
  expect(result.saved).toBe(false); expect(result.stats.highestScore).toBe(350);
});