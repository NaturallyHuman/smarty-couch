import type { LifetimeStats, PlayerStats, ScoreRecord } from '@/types/game';

export const previousScores = (stats: LifetimeStats, gameId: string): ScoreRecord[] =>
  (stats.scoreRecords || []).filter(record => record.gameId !== gameId).slice(0, 10);

export const categorySummary = (player: PlayerStats) => {
  const categories = Object.entries(player.attemptedByCategory || {})
    .filter(([, attempted]) => attempted >= 2)
    .map(([cat, attempted]) => ({ cat, attempted, correct: player.correctByCategory?.[cat] || 0 }))
    .sort((a, b) => b.correct / b.attempted - a.correct / a.attempted || b.correct - a.correct || a.cat.localeCompare(b.cat));
  return { best: categories[0], worst: categories.length > 1 ? categories[categories.length - 1] : undefined };
};