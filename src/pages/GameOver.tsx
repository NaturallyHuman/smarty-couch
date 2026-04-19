import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { GameState, PlayerStats } from '@/types/game';
import { recordGameScore } from '@/utils/lifetimeStats';

interface Tier {
  name: string;
  threshold: number;
}

const TIERS: Tier[] = [
  { name: 'Warm-Up', threshold: 0 },
  { name: 'Sharp Guess', threshold: 1500 },
  { name: 'Quick Thinker', threshold: 3000 },
  { name: 'Fact Machine', threshold: 5000 },
  { name: 'Trivia Titan', threshold: 8000 },
];

const STREAK_BONUS_PER = 100;

const getTierIndex = (score: number): number => {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (score >= TIERS[i].threshold) idx = i;
  }
  return idx;
};

interface CategoryResult {
  cat: string;
  correct: number;
  attempted: number;
  acc: number;
}

const getBestCategory = (player: PlayerStats): CategoryResult | undefined => {
  const attempted = player.attemptedByCategory || {};
  const correct = player.correctByCategory || {};
  let best: CategoryResult | undefined;
  for (const cat of Object.keys(attempted)) {
    const a = attempted[cat] || 0;
    if (a < 2) continue;
    const c = correct[cat] || 0;
    const acc = c / a;
    if (!best || acc > best.acc || (acc === best.acc && c > best.correct)) {
      best = { cat, correct: c, attempted: a, acc };
    }
  }
  return best;
};

const getWorstCategory = (player: PlayerStats): CategoryResult | undefined => {
  const attempted = player.attemptedByCategory || {};
  const correct = player.correctByCategory || {};
  let worst: CategoryResult | undefined;
  for (const cat of Object.keys(attempted)) {
    const a = attempted[cat] || 0;
    if (a < 2) continue;
    const c = correct[cat] || 0;
    const acc = c / a;
    if (!worst || acc < worst.acc || (acc === worst.acc && c < worst.correct)) {
      worst = { cat, correct: c, attempted: a, acc };
    }
  }
  return worst;
};

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const recordedRef = useRef(false);

  const gameState = location.state?.gameState as GameState;

  useEffect(() => {
    if (!gameState || recordedRef.current) return;
    recordedRef.current = true;
    const finalScore = gameState.players[0].totalScore;
    recordGameScore(finalScore);
  }, [gameState]);

  useEffect(() => {
    playAgainRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const player = gameState?.players[0];
  const finalScore = player?.totalScore ?? 0;
  const tierIdx = useMemo(() => getTierIndex(finalScore), [finalScore]);
  const currentTier = TIERS[tierIdx];

  const bestCategory = useMemo(() => (player ? getBestCategory(player) : undefined), [player]);
  const worstCategory = useMemo(() => (player ? getWorstCategory(player) : undefined), [player]);

  if (!gameState) {
    navigate('/');
    return null;
  }

  const maxStreak = player?.maxStreak ?? 0;
  const streakPoints = maxStreak * STREAK_BONUS_PER;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-[5%] py-[3%]">
      <div className="flex w-full max-w-5xl flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Quiz Complete
        </div>

        {/* Final Score label */}
        <div className="mb-1 text-lg font-medium text-muted-foreground">Final Score</div>

        {/* Score */}
        <div className="mb-8 text-8xl font-bold tabular-nums text-primary animate-scale-in leading-none">
          {finalScore.toLocaleString()}
        </div>

        {/* Tier */}
        <div className="mb-16 text-4xl font-bold text-success">{currentTier.name}!</div>

        {/* Stat row */}
        <div className="grid w-full max-w-3xl grid-cols-3 gap-8">
          {/* Best streak */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Best streak
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">{maxStreak}</div>
            <div className="text-sm text-muted-foreground">
              {maxStreak > 0 ? `${streakPoints.toLocaleString()} points!` : '—'}
            </div>
          </div>

          {/* Best category */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Best category
            </div>
            <div className="text-3xl font-bold text-success">
              {bestCategory?.cat ?? '—'}
            </div>
            <div className="text-sm text-muted-foreground tabular-nums">
              {bestCategory ? `${bestCategory.correct}/${bestCategory.attempted}` : '—'}
            </div>
          </div>

          {/* Worst category */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Worst category
            </div>
            <div className="text-3xl font-bold text-destructive">
              {worstCategory?.cat ?? '—'}
            </div>
            <div className="text-sm text-muted-foreground tabular-nums">
              {worstCategory ? `${worstCategory.correct}/${worstCategory.attempted}` : '—'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-12 flex items-center gap-4">
          <TVButton ref={playAgainRef} size="large" onClick={() => navigate('/')}>
            Play Again
          </TVButton>
          <TVButton variant="secondary" size="large" onClick={() => navigate('/')}>
            Home
          </TVButton>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
