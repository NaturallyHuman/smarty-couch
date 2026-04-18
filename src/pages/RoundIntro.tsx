import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { GameState } from '@/types/game';

const RoundIntro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state?.gameState as GameState;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    buttonRef.current?.focus();

    introAudioRef.current = new Audio('/round-start.mp3');
    introAudioRef.current.volume = 0.5;
    introAudioRef.current.play().catch(error => {
      console.log('Intro audio autoplay blocked:', error);
    });

    return () => {
      if (introAudioRef.current) {
        introAudioRef.current.pause();
        introAudioRef.current = null;
      }
    };
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
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, navigate]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[5%] py-[3%]">
      <div className="w-full max-w-[90%] text-center">
        <h1 className="mb-4 text-5xl font-bold">Get Ready!</h1>
        <p className="mb-4 text-2xl text-primary">Mixed Trivia</p>
        {gameState && (
          <p className="mb-12 text-xl text-muted-foreground">
            Round {gameState.currentRound} of {gameState.totalRounds}
            {gameState.mode === 'two-player' && ` • ${gameState.players[gameState.currentPlayer].name}`}
          </p>
        )}

        <TVButton
          ref={buttonRef}
          size="large"
          onClick={handleStart}
          className="min-w-[300px]"
        >
          Start Round
        </TVButton>
      </div>
    </div>
  );
};

export default RoundIntro;
