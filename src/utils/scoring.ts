export const BASE_SCORE = 100;
export const MAX_TIMER_BONUS = 50;
export const STREAK_MULTIPLIER = 50;
export const MIN_STREAK_FOR_BONUS = 3;

export const calculateScore = (
  isCorrect: boolean,
  timeRemaining: number,
  maxTime: number,
  currentStreak: number
): { points: number; breakdown: { base: number; timer: number; streak: number } } => {
  if (!isCorrect) {
    return { points: 0, breakdown: { base: 0, timer: 0, streak: 0 } };
  }

  const base = BASE_SCORE;
  const timerBonus = Math.round((timeRemaining / maxTime) * MAX_TIMER_BONUS);
  const streakBonus = currentStreak >= MIN_STREAK_FOR_BONUS 
    ? currentStreak * STREAK_MULTIPLIER 
    : 0;

  return {
    points: base + timerBonus + streakBonus,
    breakdown: { base, timer: timerBonus, streak: streakBonus }
  };
};
