import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { GameState } from '@/types/game';
import { recordGameScore, loadLifetimeStats, saveLifetimeStats } from '@/utils/lifetimeStats';
import { PlayerRanks } from '@/components/PlayerRanks';
import { RoundCelebration } from '@/components/RoundCelebration';
import { createGame, RULES_VERSION } from '@/utils/gameSession';
import { categorySummary, previousScores } from '@/utils/scoreHistory';
import { RANK_TRACKS } from '@/utils/playerRanks';

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state?.gameState as GameState | undefined;
  const player = gameState?.players[0];
  const gameId = gameState?.gameId || location.key;
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const recordedRef = useRef(false);
  const [stats, setStats] = useState(loadLifetimeStats);
  const [previousBest, setPreviousBest] = useState(stats.highestScore);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [saved, setSaved] = useState(true);
  const [view, setView] = useState<'final' | 'scores' | 'ranks'>('final');

  useEffect(() => {
    if (!player) { navigate('/'); return; }
    if (recordedRef.current) return;
    recordedRef.current = true;
    const result = recordGameScore(player.totalScore, player.maxStreak, gameId);
    setStats(result.stats); setPreviousBest(result.previousBest);
    setNewlyUnlocked(result.newlyUnlocked); setSaved(result.saved);
  }, [player, gameId, navigate]);
  useEffect(() => { playAgainRef.current?.focus(); }, []);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const buttons = Array.from(contentRef.current?.querySelectorAll<HTMLButtonElement>('button') || []);
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const step = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
        buttons[(index + step + buttons.length) % buttons.length]?.focus();
      } else if (event.key === 'Escape' && view !== 'final') { event.preventDefault(); setView('final'); playAgainRef.current?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view]);
  if (!player) return null;
  const score = player.totalScore;
  const tier = [...RANK_TRACKS[1].milestones].reverse().find(rank => score >= rank.threshold)?.name || 'Warm-Up';
  const categories = categorySummary(player);
  const history = previousScores(stats, gameId);
  return <div ref={contentRef} className="final-screen relative flex h-full w-full flex-col items-center justify-center px-[5%] py-[3%]">
    <RoundCelebration />
    <div className="final-content relative z-10 w-full text-center">
      {view === 'final' ? <>
        <h1 className="final-eyebrow text-muted-foreground font-bold">Final Score</h1>
        <div className="final-number round-message text-primary font-bold tabular-nums">{score.toLocaleString()}</div>
        <p className="final-tier font-bold">{tier}!</p>
        <div className="final-stats">
          <div><h2>Best streak</h2><p className="stat-value">{player.maxStreak}</p><p className="stat-detail text-warning">{(player.streakBonusTotal || 0).toLocaleString()} bonus points</p></div>
          <div><h2>Best category</h2><p className="stat-category text-success">{categories.best?.cat || '—'}</p><p className="stat-detail text-muted-foreground">{categories.best ? `${categories.best.correct}/${categories.best.attempted}` : 'Not enough answers'}</p></div>
          <div><h2>Worst category</h2><p className="stat-category text-destructive">{categories.worst?.cat || '—'}</p><p className="stat-detail text-muted-foreground">{categories.worst ? `${categories.worst.correct}/${categories.worst.attempted}` : 'Not enough answers'}</p></div>
        </div>
        <p className="best-comparison text-muted-foreground">{history.length === 0 ? 'Your first completed run' : score > previousBest ? `New personal best · previous ${previousBest.toLocaleString()}` : `Personal best ${previousBest.toLocaleString()} · ${Math.max(0, previousBest - score).toLocaleString()} points away`}</p>
        {newlyUnlocked.length > 0 && <p role="status" className="unlock-notice text-warning">{newlyUnlocked.length} new {newlyUnlocked.length === 1 ? 'rank' : 'ranks'} unlocked!</p>}
      </> : <>
        <div className="progress-tabs" role="group" aria-label="Progress view">
          <TVButton variant={view === 'scores' ? 'primary' : 'secondary'} aria-pressed={view === 'scores'} onClick={() => setView('scores')}>Scores</TVButton>
          <TVButton variant={view === 'ranks' ? 'primary' : 'secondary'} aria-pressed={view === 'ranks'} onClick={() => setView('ranks')}>Ranks</TVButton>
        </div>
        {view === 'ranks' ? <PlayerRanks progress={{ completedGames: stats.completedGames || 0, highestScore: stats.highestScore, longestStreak: stats.longestStreak, unlockedRankIds: stats.unlockedRankIds || [] }} newlyUnlocked={newlyUnlocked} /> : <section aria-label="Previous scores" className="scores-view">
          <h1 className="text-2xl font-bold">Previous scores</h1><p className="text-muted-foreground">This run: {score.toLocaleString()}</p>
          {history.length ? <ol className="score-history">{history.map((record, index) => <li key={record.gameId}>
            <span className="text-muted-foreground">{index + 1}</span><strong className="tabular-nums">{record.score.toLocaleString()}</strong>
            <span className="history-meta text-muted-foreground">{record.completedAt ? new Date(record.completedAt).toLocaleDateString() : 'Earlier run'}{record.rulesVersion !== RULES_VERSION && <span className="block text-warning">Earlier timing</span>}</span>
          </li>)}</ol> : <p className="empty-history text-muted-foreground">Your next completed game will have a score to compare.</p>}
        </section>}
      </>}
      {!saved && <div role="alert" className="save-notice text-warning">This result could not be saved. <TVButton variant="secondary" onClick={() => setSaved(saveLifetimeStats(stats))}>Retry Save</TVButton></div>}
      <div className="final-actions">
        <TVButton ref={playAgainRef} size="large" onClick={() => navigate('/round-intro', { state: { gameState: createGame() } })}>Play Again</TVButton>
        <TVButton variant="secondary" onClick={() => setView(view === 'final' ? 'scores' : 'final')}>{view === 'final' ? 'Progress' : 'Final Score'}</TVButton>
        <TVButton variant="secondary" size="large" onClick={() => navigate('/')}>Home</TVButton>
      </div>
    </div>
  </div>;
};
export default GameOver;
