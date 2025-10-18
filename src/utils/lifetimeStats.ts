import { LifetimeStats, RoundResult } from '@/types/game';

const STORAGE_KEY = 'smarty-couch-stats';

const defaultStats: LifetimeStats = {
  highestScore: 0,
  longestStreak: 0,
  timesPlayed: 0,
  categoryStats: {},
};

export const loadLifetimeStats = (): LifetimeStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultStats, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
  return defaultStats;
};

export const saveLifetimeStats = (stats: LifetimeStats): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

export const updateLifetimeStats = (
  result: RoundResult,
  category: string,
  correctByCategory: { [key: string]: number }
): LifetimeStats => {
  const stats = loadLifetimeStats();
  
  stats.highestScore = Math.max(stats.highestScore, result.score);
  stats.longestStreak = Math.max(stats.longestStreak, result.maxStreak);
  stats.timesPlayed += 1;

  // Update category stats
  Object.entries(correctByCategory).forEach(([cat, correct]) => {
    if (!stats.categoryStats[cat]) {
      stats.categoryStats[cat] = { correct: 0, total: 0 };
    }
    stats.categoryStats[cat].correct += correct;
    stats.categoryStats[cat].total += 1;
  });

  saveLifetimeStats(stats);
  return stats;
};
