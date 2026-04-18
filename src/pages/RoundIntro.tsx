import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameState } from '@/types/game';

const COUNTDOWN = 3;

const RoundIntro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state?.gameState as GameState;
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN);

  useEffect(() => {
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
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          handleStart();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <div className="text-7xl font-bold text-primary tabular-nums">
          {secondsLeft}
        </div>
      </div>
    </div>
  );
};

export default RoundIntro;
