import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { GameState } from '@/types/game';

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
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!gameState) {
    navigate('/');
    return null;
  }

  const isTwoPlayer = gameState.mode === 'two-player';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[5%] py-[3%]">
      <h1 className="mb-12 text-5xl font-bold tracking-tight text-foreground">Game Over</h1>

      {isTwoPlayer ? (
        <div className="mb-16 flex w-full max-w-[80%] items-center justify-center gap-16">
          {gameState.players.map((p, i) => (
            <div key={i} className="text-center">
              <div className="mb-2 text-2xl text-muted-foreground">{p.name}</div>
              <div className="text-7xl font-bold text-primary">
                {p.totalScore.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-16 text-center">
          <div className="mb-3 text-2xl text-muted-foreground">Your Score</div>
          <div className="text-8xl font-bold text-primary">
            {gameState.players[0].totalScore.toLocaleString()}
          </div>
        </div>
      )}

      <TVButton ref={buttonRef} size="large" onClick={() => navigate('/')}>
        Play Again
      </TVButton>
    </div>
  );
};

export default GameOver;
