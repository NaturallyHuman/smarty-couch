import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { Trophy, Award, Zap } from 'lucide-react';
import { GameState } from '@/types/game';
import { getEarnedBadges, getRank } from '@/utils/badges';

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const gameState = location.state?.gameState as GameState;

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigate('/stats');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!gameState) {
    navigate('/');
    return null;
  }

  const renderPlayerResults = (player: typeof gameState.players[0], index: number) => {
    const badges = getEarnedBadges(player);
    const rank = getRank(player.totalScore);
    const percentage = Math.round((player.correctAnswers / player.totalQuestions) * 100);

    return (
      <div key={index} className="rounded-2xl bg-card p-8">
        <h2 className="mb-6 text-4xl font-bold text-primary">{player.name}</h2>
        
        <div className="mb-6 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-6">
          <div className="mb-2 text-2xl text-muted-foreground">Final Score</div>
          <div className="text-6xl font-bold text-primary">{player.totalScore.toLocaleString()}</div>
          <div className="mt-2 text-xl text-muted-foreground">
            {rank.icon} {rank.name}
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-background/50 p-4">
            <Award className="mx-auto mb-2 h-8 w-8 text-primary" />
            <div className="text-3xl font-bold">{player.correctAnswers}/{player.totalQuestions}</div>
            <div className="text-lg text-muted-foreground">{percentage}% Correct</div>
          </div>
          <div className="rounded-xl bg-background/50 p-4">
            <Zap className="mx-auto mb-2 h-8 w-8 text-warning" />
            <div className="text-3xl font-bold">{player.maxStreak}</div>
            <div className="text-lg text-muted-foreground">Best Streak</div>
          </div>
        </div>

        {badges.length > 0 && (
          <div className="rounded-xl bg-background/50 p-4">
            <h3 className="mb-3 text-xl font-bold">Badges Earned</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className="rounded-lg bg-primary/20 px-3 py-2 text-center"
                  title={badge.description}
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="text-sm">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-[8vw] py-6">
      <div className="w-full max-w-[85vw]">
        <div className="mb-8 text-center">
          <Trophy className="mx-auto mb-4 h-24 w-24 text-primary" />
          <h1 className="mb-2 text-5xl font-bold">Game Over!</h1>
          <p className="text-xl text-muted-foreground">
            {gameState.mode === 'two-player' ? 'Final Results' : 'Great job!'}
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {gameState.players.map((player, index) => renderPlayerResults(player, index))}
        </div>

        <div className="flex justify-center gap-4">
          <TVButton
            ref={buttonRef}
            size="large"
            onClick={() => navigate('/stats')}
          >
            View Stats
          </TVButton>
          <TVButton
            size="large"
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Home
          </TVButton>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
