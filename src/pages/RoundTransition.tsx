import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameState } from '@/types/game';

const MESSAGES = [
  "Not bad… but it's about to get harder. Think you can keep up?",
  "Nice warm-up. The real challenge starts now.",
  "You're doing great — let's crank up the difficulty.",
  "Easy round done. Brace yourself.",
  "Solid! But the next round won't go easy on you.",
  "Hope you were just warming up. It's getting tougher.",
  "Pretty good… but the next round bites back.",
  "You've earned a tougher challenge. Ready?",
];

const DURATION = 5;

const RoundTransition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state?.gameState as GameState | undefined;

  const message = useMemo(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)], []);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);

  const goNext = () => {
    if (!gameState) {
      navigate('/');
      return;
    }

    const isGameOver = gameState.currentRound > gameState.totalRounds;
    if (isGameOver) {
      navigate('/game-over', { state: { gameState } });
      return;
    }

    if (
      gameState.mode === 'two-player' &&
      gameState.currentPlayer !== 0 // means we just rolled over to player 0 of next round? handled in Question.tsx
    ) {
      navigate('/turn-transition', { state: { gameState } });
    } else if (gameState.mode === 'two-player') {
      navigate('/turn-transition', { state: { gameState } });
    } else {
      navigate('/round-intro', { state: { gameState } });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          // Defer navigation so it doesn't fire during render
          setTimeout(() => goNext(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!gameState) return null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[8%] py-[4%]">
      <div className="text-center">
        <h1 className="mb-12 text-4xl font-semibold leading-snug text-foreground md:text-5xl">
          {message}
        </h1>
        <div className="flex justify-center gap-3">
          {Array.from({ length: DURATION }).map((_, i) => (
            <div
              key={i}
              className={
                'h-3 w-3 rounded-full transition-colors duration-300 ' +
                (i < DURATION - secondsLeft ? 'bg-primary' : 'bg-muted')
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoundTransition;
