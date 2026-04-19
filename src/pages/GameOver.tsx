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

const getTierIndex = (score: number): number => {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (score >= TIERS[i].threshold) idx = i;
  }
  return idx;
};

interface CategoryStat {
  cat: string;
  correct: number;
  attempted: number;
  acc: number;
}

const getCategoryStats = (player: PlayerStats): CategoryStat[] => {
  const attempted = player.attemptedByCategory || {};
  const correct = player.correctByCategory || {};
  return Object.keys(attempted)
    .filter((c) => (attempted[c] || 0) >= 2)
    .map((cat) => {
      const a = attempted[cat] || 0;
      const c = correct[cat] || 0;
      return { cat, correct: c, attempted: a, acc: c / a };
    });
};

const getBestCategory = (player: PlayerStats): CategoryStat | undefined => {
  const stats = getCategoryStats(player);
  if (stats.length === 0) return undefined;
  return stats.reduce((best, cur) => {
    if (cur.acc > best.acc) return cur;
    if (cur.acc === best.acc && cur.correct > best.correct) return cur;
    return best;
  });
};

const getWorstCategory = (player: PlayerStats): CategoryStat | undefined => {
  const stats = getCategoryStats(player);
  if (stats.length < 2) return undefined;
  return stats.reduce((worst, cur) => {
    if (cur.acc < worst.acc) return cur;
    if (cur.acc === worst.acc && cur.correct < worst.correct) return cur;
    return worst;
  });
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
  const streakBonusTotal = player?.streakBonusTotal ?? 0;
  const maxStreak = player?.maxStreak ?? 0;

  if (!gameState) {
    navigate('/');
    return null;
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-[5%] py-[3%]">
      {/* Celebration glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl animate-fade-in"
        style={{
          background:
            'radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, transparent 70%)',
        }}
      />
      {/* Confetti dots */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          { x: '12%', y: '18%', c: 'bg-primary', d: '0s' },
          { x: '88%', y: '22%', c: 'bg-success', d: '0.4s' },
          { x: '20%', y: '70%', c: 'bg-warning', d: '0.8s' },
          { x: '82%', y: '74%', c: 'bg-primary', d: '1.2s' },
          { x: '50%', y: '12%', c: 'bg-success', d: '0.2s' },
          { x: '10%', y: '45%', c: 'bg-warning', d: '0.6s' },
          { x: '92%', y: '50%', c: 'bg-primary', d: '1.0s' },
        ].map((dot, i) => (
          <span
            key={i}
            className={`absolute h-2 w-2 rounded-full ${dot.c} animate-pulse`}
            style={{ left: dot.x, top: dot.y, animationDelay: dot.d }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Final Score
        </div>

        {/* Score */}
        <div className="mb-4 text-7xl font-bold tabular-nums text-primary animate-scale-in">
          {finalScore.toLocaleString()}
        </div>

        {/* Tier name */}
        <div className="mb-12 text-3xl font-bold text-foreground">
          {currentTier.name}!
        </div>

        {/* Stats row */}
        <div className="mb-12 flex items-start justify-center gap-16">
          <div className="flex flex-col items-center">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Best streak
            </div>
            <div className="text-4xl font-bold tabular-nums text-foreground">
              {maxStreak}
            </div>
            <div className="mt-1 text-sm text-warning">
              {streakBonusTotal.toLocaleString()} points!
            </div>
          </div>

          {bestCategory && (
            <div className="flex flex-col items-center">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Best category
              </div>
              <div className="text-2xl font-bold text-success">{bestCategory.cat}</div>
              <div className="mt-1 text-sm tabular-nums text-muted-foreground">
                {bestCategory.correct}/{bestCategory.attempted}
              </div>
            </div>
          )}

          {worstCategory && (
            <div className="flex flex-col items-center">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Worst category
              </div>
              <div className="text-2xl font-bold text-destructive">{worstCategory.cat}</div>
              <div className="mt-1 text-sm tabular-nums text-muted-foreground">
                {worstCategory.correct}/{worstCategory.attempted}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
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
