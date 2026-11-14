import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { GameState, PlayerStats } from '@/types/game';
import { recordGameScore, loadLifetimeStats } from '@/utils/lifetimeStats';
import { PlayerRanks } from '@/components/PlayerRanks';
import { RoundCelebration } from '@/components/RoundCelebration';

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
  const [stats, setStats] = useState(loadLifetimeStats);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [showRanks, setShowRanks] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const gameState = location.state?.gameState as GameState;

  useEffect(() => {
    if (!gameState || recordedRef.current) return;
    recordedRef.current = true;
    const finalScore = gameState.players[0].totalScore;
    const result = recordGameScore(finalScore, gameState.players[0].maxStreak, gameState.gameId || location.key);
    setStats(result.stats);
    setNewlyUnlocked(result.newlyUnlocked);
  }, [gameState]);

  useEffect(() => {
    playAgainRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const buttons = Array.from(actionsRef.current?.querySelectorAll('button') || []);
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
        buttons[(index + step + buttons.length) % buttons.length]?.focus();
      } else if (e.key === 'Escape' && showRanks) {
        e.preventDefault();
        setShowRanks(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRanks]);

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
      <RoundCelebration />

      <div className="relative z-10 flex w-full flex-col items-center text-center">
        {showRanks ? <PlayerRanks progress={{
          completedGames: stats.completedGames ?? (stats.recentScores || []).length,
          highestScore: stats.highestScore,
          longestStreak: stats.longestStreak,
          unlockedRankIds: stats.unlockedRankIds || [],
        }} newlyUnlocked={newlyUnlocked} /> : <>
        {/* Eyebrow */}
        <div className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Final Score
        </div>

        {/* Score */}
        <div className="round-message mb-4 text-7xl font-bold tabular-nums text-primary">
          {finalScore.toLocaleString()}
        </div>

        {/* Tier name */}
        <div className="mb-6 text-3xl font-bold text-foreground">
          {currentTier.name}!
        </div>

        {/* Stats row */}
        <div className="mb-6 flex items-start justify-center gap-16">
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
        {newlyUnlocked.length > 0 && <p role="status" className="mb-3 text-sm font-semibold text-warning">{newlyUnlocked.length} new {newlyUnlocked.length === 1 ? 'rank' : 'ranks'} unlocked!</p>}
        </>}

        {/* Actions */}
        <div ref={actionsRef} className="mt-4 flex items-center gap-4">
          <TVButton ref={playAgainRef} size="large" onClick={() => navigate('/')}>
            Play Again
          </TVButton>
          <TVButton variant="secondary" onClick={() => setShowRanks(value => !value)} aria-pressed={showRanks}>
            {showRanks ? 'Final Score' : 'Player Ranks'}
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
