import { useEffect, useMemo, useRef, useState } from 'react';
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

const getBestCategory = (player: PlayerStats): string | undefined => {
  const attempted = player.attemptedByCategory || {};
  const correct = player.correctByCategory || {};
  let best: { cat: string; acc: number; correct: number } | undefined;
  for (const cat of Object.keys(attempted)) {
    const a = attempted[cat] || 0;
    if (a < 2) continue;
    const c = correct[cat] || 0;
    const acc = c / a;
    if (!best || acc > best.acc || (acc === best.acc && c > best.correct)) {
      best = { cat, acc, correct: c };
    }
  }
  return best?.cat;
};

const computePercentile = (current: number, history: number[]): number | null => {
  // history includes the current score (recorded by recordGameScore).
  if (!history || history.length < 2) return null;
  const others = [...history];
  // Remove a single occurrence of current to compare against past runs.
  const i = others.indexOf(current);
  if (i >= 0) others.splice(i, 1);
  if (others.length === 0) return null;
  const beaten = others.filter((s) => current > s).length;
  // "Top X%" = how high you rank. Higher score → smaller X.
  const rankFromTop = others.length - beaten; // 0 = best ever
  const pct = Math.max(1, Math.round(((rankFromTop + 1) / (others.length + 1)) * 100));
  return pct;
};

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const recordedRef = useRef(false);

  const gameState = location.state?.gameState as GameState;

  const [recentScores, setRecentScores] = useState<number[]>([]);

  useEffect(() => {
    if (!gameState || recordedRef.current) return;
    recordedRef.current = true;
    const finalScore = gameState.players[0].totalScore;
    const { stats } = recordGameScore(finalScore);
    setRecentScores(stats.recentScores);
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
  const nextTier = TIERS[tierIdx + 1];
  const ptsToNext = nextTier ? nextTier.threshold - finalScore : 0;

  const accuracy = useMemo(() => {
    if (!player || !player.totalQuestions) return 0;
    return Math.round((player.correctAnswers / player.totalQuestions) * 100);
  }, [player]);

  const bestCategory = useMemo(() => (player ? getBestCategory(player) : undefined), [player]);
  const percentile = useMemo(
    () => computePercentile(finalScore, recentScores),
    [finalScore, recentScores]
  );

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
          Quiz Complete
        </div>

        {/* Score */}
        <div className="mb-3 text-7xl font-bold tabular-nums text-primary animate-scale-in">
          {finalScore.toLocaleString()}
        </div>

        {/* Tier name */}
        <div className="mb-1 text-3xl font-bold text-foreground">{currentTier.name}</div>

        {/* Percentile */}
        {percentile !== null && (
          <div className="mb-6 text-base text-muted-foreground">
            Top {percentile}% of your runs
          </div>
        )}
        {percentile === null && <div className="mb-6 text-base text-muted-foreground">Your first run!</div>}

        {/* Tier ladder */}
        <div className="relative mb-3 w-full max-w-3xl">
          <div className="absolute left-[8%] right-[8%] top-1/2 h-px -translate-y-1/2 bg-border" />
          <div className="relative flex items-center justify-between">
            {TIERS.map((t, i) => {
              const isActive = i === tierIdx;
              const isPast = i < tierIdx;
              return (
                <div key={t.name} className="flex flex-col items-center gap-2">
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      isActive
                        ? 'scale-110 bg-primary text-primary-foreground shadow-lg'
                        : isPast
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {t.name}
                  </div>
                  {isActive && (
                    <div className="text-primary" aria-hidden>
                      ▲
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Distance to next */}
        <div className="mb-8 text-sm text-muted-foreground">
          {nextTier
            ? `${ptsToNext.toLocaleString()} pts to ${nextTier.name}`
            : 'Max rank reached!'}
        </div>

        {/* Stats row */}
        <div className="mb-10 flex items-center gap-6 text-base">
          <span className="text-foreground">
            <span className="text-muted-foreground">Accuracy </span>
            <span className="font-bold">{accuracy}%</span>
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground">
            <span className="text-muted-foreground">Best streak </span>
            <span className="font-bold">{player?.maxStreak ?? 0}</span>
          </span>
          {bestCategory && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground">
                <span className="text-muted-foreground">Best category </span>
                <span className="font-bold text-success">{bestCategory}</span>
              </span>
            </>
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
