import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameState } from '@/types/game';
import { fadeIn, fadeOut } from '@/utils/audioFade';

const DURATION_MS = 5000;

const FIRST_ROUND_MESSAGES = [
  "Here we go. Easy ones first.",
  "Warm-up time. Don't get comfortable.",
  "Let's start nice and slow.",
  "Round one. Try not to overthink it.",
  "Easy mode engaged. For now.",
  "Stretch those brain muscles.",
  "Starting light. It won't stay that way.",
];

const TAUNT_MESSAGES = [
  "Not bad. But it's about to get harder. Think you can keep up?",
  "Decent start. The next round won't be so kind.",
  "You survived. Barely. Ready for worse?",
  "Cute. Let's crank it up.",
  "Warm-up's over. Real questions now.",
  "Impressive… for a beginner. Bring it.",
  "You're doing fine. The questions aren't.",
  "Hope you studied. It gets meaner from here.",
  "Easy mode is over. Try not to embarrass yourself.",
  "Getting cocky? Let's fix that.",
  "Nice work. Now forget everything you know.",
  "That was the appetizer. Main course incoming.",
  "Don't get comfortable. The gloves come off now.",
  "Pat yourself on the back. Then panic.",
];

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const RoundIntro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state?.gameState as GameState;
  const introAudioRef = useRef<HTMLAudioElement | null>(null);

  const message = useMemo(() => {
    const isFirstRound = !gameState || gameState.currentRound === 1;
    return pickRandom(isFirstRound ? FIRST_ROUND_MESSAGES : TAUNT_MESSAGES);
  }, [gameState]);

  useEffect(() => {
    const audio = new Audio('/round-start.mp3');
    introAudioRef.current = audio;
    fadeIn(audio, 0.5, 700);

    return () => {
      const current = introAudioRef.current;
      introAudioRef.current = null;
      if (current) {
        fadeOut(current, 600);
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
    const timeout = setTimeout(handleStart, DURATION_MS);
    return () => clearTimeout(timeout);
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
    <div className="flex h-full w-full items-center justify-center px-[5%] py-[3%]">
      <div className="w-full max-w-[85%] text-center animate-fade-in">
        <p className="text-5xl md:text-6xl font-bold leading-tight text-primary">
          {message}
        </p>
      </div>
    </div>
  );
};

export default RoundIntro;
