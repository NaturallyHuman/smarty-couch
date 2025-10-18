import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { GameState } from '@/types/game';

const TurnTransition = () => {
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
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContinue = () => {
    navigate('/round-intro', { state: { gameState } });
  };

  if (!gameState) {
    navigate('/');
    return null;
  }

  const currentPlayer = gameState.players[gameState.currentPlayer];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[5%] py-[3%]">
      <div className="w-full max-w-[90%] text-center">
        <h1 className="mb-8 text-5xl font-bold">
          {currentPlayer.name}'s Turn
        </h1>
        <p className="mb-4 text-2xl text-muted-foreground">
          Round {gameState.currentRound} of {gameState.totalRounds}
        </p>
        <p className="mb-12 text-xl text-muted-foreground">
          Get ready for your round!
        </p>
        <TVButton
          ref={buttonRef}
          size="large"
          onClick={handleContinue}
          className="min-w-[300px]"
        >
          Start Round
        </TVButton>
      </div>
    </div>
  );
};

export default TurnTransition;
