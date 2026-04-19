import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameState, Question as QuestionType } from '@/types/game';
import { audioManager } from '@/utils/audioManager';
import { selectQuestions } from '@/utils/questionSelector';

const DURATION_MS = 5000;
const QUESTION_POOL_SIZE = 30;

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

  const message = useMemo(() => {
    const isFirstRound = !gameState || gameState.currentRound === 1;
    return pickRandom(isFirstRound ? FIRST_ROUND_MESSAGES : TAUNT_MESSAGES);
  }, [gameState]);

  const preloadedRef = useRef<QuestionType[] | null>(null);
  const timerDoneRef = useRef(false);
  const navigatedRef = useRef(false);
  const [, forceTick] = useState(0);

  const tryNavigate = () => {
    if (navigatedRef.current) return;
    if (!gameState) {
      navigate('/');
      navigatedRef.current = true;
      return;
    }
    if (timerDoneRef.current && preloadedRef.current) {
      navigatedRef.current = true;
      navigate('/question', {
        state: { gameState, preloadedQuestions: preloadedRef.current },
      });
    }
  };

  useEffect(() => {
    audioManager.playTrack('intro', '/round-start.mp3', { volume: 0.5, durationMs: 700 });
  }, []);

  // Preload questions in parallel with the timer
  useEffect(() => {
    if (!gameState) return;
    let cancelled = false;
    (async () => {
      try {
        const questions = await selectQuestions(
          gameState.category || 'All',
          QUESTION_POOL_SIZE,
          gameState.currentRound,
          gameState.usedQuestionIds || []
        );
        if (cancelled) return;
        preloadedRef.current = questions;
        forceTick((n) => n + 1);
        tryNavigate();
      } catch (err) {
        console.error('Failed to preload questions:', err);
        if (!cancelled) navigate('/');
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    const timeout = setTimeout(() => {
      timerDoneRef.current = true;
      tryNavigate();
    }, DURATION_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    if (!gameState) {
      navigate('/');
      return;
    }
    timerDoneRef.current = true;
    tryNavigate();
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
