export type RankTrack = 'games' | 'score' | 'streak';

export interface RankMilestone {
  id: string;
  name: string;
  threshold: number;
}

export const RANK_TRACKS: { key: RankTrack; label: string; unit: string; milestones: RankMilestone[] }[] = [
  { key: 'games', label: 'Games completed', unit: 'games', milestones: [
    { id: 'first-finish', name: 'Couch Rookie', threshold: 1 },
    { id: 'five-finishes', name: 'Couch Regular', threshold: 5 },
    { id: 'ten-finishes', name: 'Quiz Enthusiast', threshold: 10 },
    { id: 'twenty-five-finishes', name: 'Couch Legend', threshold: 25 },
  ] },
  { key: 'score', label: 'Personal best', unit: 'points', milestones: [
    { id: 'score-1500', name: 'Sharp Guess', threshold: 1500 },
    { id: 'score-3000', name: 'Quick Thinker', threshold: 3000 },
    { id: 'score-5000', name: 'Fact Machine', threshold: 5000 },
    { id: 'score-8000', name: 'Trivia Titan', threshold: 8000 },
  ] },
  { key: 'streak', label: 'Best streak', unit: 'in a row', milestones: [
    { id: 'streak-3', name: 'On a Roll', threshold: 3 },
    { id: 'streak-5', name: 'Streak Scholar', threshold: 5 },
    { id: 'streak-10', name: 'Unstoppable', threshold: 10 },
    { id: 'streak-15', name: 'Brainstorm Royalty', threshold: 15 },
  ] },
];

export interface RankProgress {
  completedGames: number;
  highestScore: number;
  longestStreak: number;
  unlockedRankIds: string[];
}

export const getRankValue = (progress: RankProgress, track: RankTrack): number =>
  track === 'games' ? progress.completedGames : track === 'score' ? progress.highestScore : progress.longestStreak;

export const getUnlockedRankIds = (progress: RankProgress): string[] => {
  const ids = new Set(progress.unlockedRankIds);
  RANK_TRACKS.forEach(track => track.milestones.forEach(rank => {
    if (getRankValue(progress, track.key) >= rank.threshold) ids.add(rank.id);
  }));
  return [...ids];
};