import { describe, test, expect, beforeEach } from 'bun:test';
import { RANK_TRACKS, getUnlockedRankIds } from './playerRanks.ts';
import { recordGameScore, loadLifetimeStats } from './lifetimeStats.ts';

const progress = (values = {}) => ({ completedGames: 0, highestScore: 0, longestStreak: 0, unlockedRankIds: [], ...values });

describe('rank thresholds', () => {
  for (const [track, field, thresholds] of [
    ['games', 'completedGames', [1, 5, 10, 25]],
    ['score', 'highestScore', [1500, 3000, 5000, 8000]],
    ['streak', 'longestStreak', [3, 5, 10, 15]],
  ]) {
    thresholds.forEach((threshold, index) => {
      test(`${track} rank ${index + 1} unlocks at ${threshold}`, () => {
        const id = RANK_TRACKS.find(t => t.key === track).milestones[index].id;
        expect(getUnlockedRankIds(progress({ [field]: threshold - 1 }))).not.toContain(id);
        expect(getUnlockedRankIds(progress({ [field]: threshold }))).toContain(id);
      });
    });
  }
  test('earned ranks stay unlocked when later values are lower', () => {
    expect(getUnlockedRankIds(progress({ unlockedRankIds: ['score-8000'] }))).toContain('score-8000');
  });
});

describe('completed-game progress', () => {
  beforeEach(() => {
    const data = new Map();
    globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  });
  test('completion records games, personal best, streak and new ranks', () => {
    const result = recordGameScore(3000, 5, 'game-one');
    expect(result.stats.completedGames).toBe(1);
    expect(result.stats.highestScore).toBe(3000);
    expect(result.stats.longestStreak).toBe(5);
    expect(result.newlyUnlocked).toEqual(['first-finish', 'score-1500', 'score-3000', 'streak-3', 'streak-5']);
  });
  test('reopening one completed game never counts twice', () => {
    recordGameScore(3000, 5, 'game-one');
    expect(recordGameScore(3000, 5, 'game-one').newlyUnlocked).toEqual([]);
    expect(loadLifetimeStats().completedGames).toBe(1);
    expect(loadLifetimeStats().recentScores).toEqual([3000]);
  });
  test('a lower score and streak cannot remove achievements', () => {
    recordGameScore(8000, 15, 'game-one');
    const result = recordGameScore(100, 0, 'game-two');
    expect(result.stats.highestScore).toBe(8000);
    expect(result.stats.longestStreak).toBe(15);
    expect(result.stats.unlockedRankIds).toContain('score-8000');
    expect(result.stats.unlockedRankIds).toContain('streak-15');
  });
  test('legacy round counts do not inflate completed games', () => {
    localStorage.setItem('smarty-couch-stats', JSON.stringify({ timesPlayed: 99, highestScore: 1500, longestStreak: 3, recentScores: [1500, 500], categoryStats: {} }));
    expect(recordGameScore(100, 0, 'new-game').stats.completedGames).toBe(3);
  });
});