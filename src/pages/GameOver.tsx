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
  if (!history || history.length < 2) return null;
  const others = [...history];
  const i = others.indexOf(current);
  if (i >= 0) others.splice(i, 1);
  if (others.length === 0) return null;
  const beaten = others.filter((s) => current > s).length;
  const rankFromTop = others.length - beaten;
  const pct = Math.max(1, Math.round(((rankFromTop + 1) / (others.length + 1)) * 100));
  return pct;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const recordedRef = useRef(false);

  const gameState = location.state?.gameState as GameState;

  const [recentScores, setRecentScores] = useState<number[]>([]);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!gameState || recordedRef.current) return;
    recordedRef.current = true;
    const finalScore = gameState.players[0].totalScore;
    const { stats } = recordGameScore(finalScore);
    setRecentScores(stats.recentScores);
  }, [gameState]);

  const player = gameState?.players[0];
  const finalScore = player?.totalScore ?? 0;

  // Score count-up animation
  useEffect(() => {
    if (!finalScore) {
      setDisplayScore(0);
      return;
    }
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplayScore(Math.round(finalScore * easeOutCubic(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finalScore]);

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

      {/* Elevated results card */}
      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-border/50 bg-card/80 px-12 py-10 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div
            className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground animate-fade-in"
            style={{ animationFillMode: 'both' }}
          >
            Round Complete
          </div>

          {/* Score (count-up) */}
          <div
            className="mb-5 text-8xl font-black tracking-tight text-primary tabular-nums drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
          >
            {displayScore.toLocaleString()}
          </div>

          {/* Rank badge pill */}
          <div
            className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-6 py-2 text-2xl font-bold uppercase tracking-wider text-primary animate-scale-in"
            style={{ animationDelay: '950ms', animationFillMode: 'both', opacity: 0 }}
          >
            <span style={{ animation: 'fade-in 0.01s 950ms forwards' }} className="opacity-0">
              {currentTier.name}
            </span>
          </div>

          {/* Percentile */}
          <div
            className="mb-8 text-base text-muted-foreground animate-fade-in"
            style={{ animationDelay: '1100ms', animationFillMode: 'both', opacity: 0 }}
          >
            {percentile !== null ? `Top ${percentile}% of your runs` : 'Your first run!'}
          </div>

          {/* Milestone ladder */}
          <div
            className="relative mb-3 w-full animate-fade-in"
            style={{ animationDelay: '1250ms', animationFillMode: 'both', opacity: 0 }}
          >
            {/* Background gradient line */}
            <div
              className="absolute left-[8%] right-[8%] top-3 h-[2px] -translate-y-1/2 rounded-full opacity-30"
              style={{
                background:
                  'linear-gradient(to right, hsl(var(--success)), hsl(var(--primary)), hsl(var(--warning)))',
              }}
            />
            {/* Filled portion up to current tier */}
            <div
              className="absolute left-[8%] top-3 h-[2px] -translate-y-1/2 rounded-full"
              style={{
                width: `${(tierIdx / (TIERS.length - 1)) * 84}%`,
                background:
                  'linear-gradient(to right, hsl(var(--success)), hsl(var(--primary)))',
              }}
            />
            <div className="relative flex items-start justify-between">
              {TIERS.map((t, i) => {
                const isActive = i === tierIdx;
                const isPast = i < tierIdx;
                return (
                  <div key={t.name} className="flex flex-col items-center gap-2" style={{ width: '20%' }}>
                    {isActive ? (
                      <div
                        className="h-6 w-6 rotate-45 scale-110 border-2 border-primary bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
                        aria-hidden
                      />
                    ) : isPast ? (
                      <div className="mt-1 h-4 w-4 rounded-full bg-success" aria-hidden />
                    ) : (
                      <div className="mt-1 h-4 w-4 rounded-full border-2 border-muted bg-transparent" aria-hidden />
                    )}
                    <div
                      className={`text-xs font-semibold leading-tight ${
                        isActive
                          ? 'text-primary'
                          : isPast
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {t.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distance to next */}
          <div
            className="mb-8 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: '1350ms', animationFillMode: 'both', opacity: 0 }}
          >
            {nextTier
              ? `${ptsToNext.toLocaleString()} pts to ${nextTier.name}`
              : 'Max rank reached!'}
          </div>

          {/* Stat row */}
          <div
            className="mb-10 flex items-center gap-6 text-base animate-fade-in"
            style={{ animationDelay: '1450ms', animationFillMode: 'both', opacity: 0 }}
          >
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
          <div
            className="flex items-center gap-4 animate-fade-in"
            style={{ animationDelay: '1600ms', animationFillMode: 'both', opacity: 0 }}
          >
            <div className="rounded-md shadow-[0_0_0_0_hsl(var(--primary)/0.5)] animate-pulse">
              <TVButton ref={playAgainRef} size="large" onClick={() => navigate('/')}>
                Play Again
              </TVButton>
            </div>
            <TVButton variant="secondary" size="large" onClick={() => navigate('/')}>
              Home
            </TVButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
