import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { GameState } from '@/types/game';

const RoundIntro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state?.gameState as GameState;
  const category = gameState?.category || 'All';
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  const handleStart = () => {
    if (!gameState) {
      navigate('/');
      return;
    }
    navigate('/question', { state: { gameState } });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStart();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/category', { state: { gameState } });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, navigate]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[5%] py-[3%]">
      <div className="w-full max-w-[90%] text-center">
        <h1 className="mb-4 text-5xl font-bold">Get Ready!</h1>
        <p className="mb-4 text-2xl text-primary">{category} Trivia</p>
        {gameState && (
          <p className="mb-8 text-xl text-muted-foreground">
            Round {gameState.currentRound} of {gameState.totalRounds}
            {gameState.mode === 'two-player' && ` • ${gameState.players[gameState.currentPlayer].name}`}
          </p>
        )}

        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-card p-6">
            <div className="text-3xl font-bold">6</div>
            <div className="text-lg text-muted-foreground">Questions</div>
          </div>

          <div className="rounded-2xl bg-card p-6">
            <div className="text-3xl font-bold">10s</div>
            <div className="text-lg text-muted-foreground">Per Question</div>
          </div>

          <div className="rounded-2xl bg-card p-6">
            <div className="text-3xl font-bold">Ramps Up</div>
            <div className="text-lg text-muted-foreground">Difficulty</div>
          </div>
        </div>

        <TVButton
          ref={buttonRef}
          size="large"
          onClick={handleStart}
          className="min-w-[300px]"
        >
          Start Round
        </TVButton>

        <p className="mt-8 text-lg text-muted-foreground">
          Use arrow keys for A/B/C/D • Enter to confirm • Esc to pause
        </p>
      </div>
    </div>
  );
};

export default RoundIntro;
