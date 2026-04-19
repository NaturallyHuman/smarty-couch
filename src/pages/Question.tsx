import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnswerChoice } from '@/components/AnswerChoice';
import { TimerBar } from '@/components/TimerBar';
import { selectQuestions } from '@/utils/questionSelector';
import { calculateScore } from '@/utils/scoring';
import { Question as QuestionType, GameState } from '@/types/game';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TVButton } from '@/components/TVButton';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { audioManager } from '@/utils/audioManager';

const ROUND_TIME = 60; // seconds — the entire round is one 60s sprint
const QUESTION_POOL_SIZE = 30; // fetched up front so we never run out
const FEEDBACK_DELAY = 600; // snappier sprint feel

type AnswerDirection = 0 | 1 | 2 | 3 | null;

const Question = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state?.gameState as GameState;
  const category = gameState?.category || 'All';

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedAnswer, setHighlightedAnswer] = useState<AnswerDirection>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerDirection>(null);
  const [feedbackState, setFeedbackState] = useState<'correct' | 'incorrect' | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(ROUND_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [correctByCategory, setCorrectByCategory] = useState<{ [key: string]: number }>({});
  const [attemptedByCategory, setAttemptedByCategory] = useState<{ [key: string]: number }>({});
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [streakBonus, setStreakBonus] = useState(0);
  const [endedOnWrong, setEndedOnWrong] = useState(false);
  const [streakLostFlash, setStreakLostFlash] = useState(false);
  const [scorePopup, setScorePopup] = useState<{ base: number; bonus: number; key: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const roundEndedRef = useRef(false);
  const lastWasWrongRef = useRef(false);

  useEffect(() => {
    if (!gameState) {
      navigate('/');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const selected = await selectQuestions(
          category,
          QUESTION_POOL_SIZE,
          gameState.currentRound,
          gameState.usedQuestionIds || []
        );
        setQuestions(selected);
        setScore(gameState.currentRoundScore);
        setStreak(gameState.currentStreak);
        setMaxStreak(gameState.currentMaxStreak);
        setCorrectCount(gameState.currentRoundCorrect);

        audioManager.crossfade('intro', 'question', '/question-music.mp3', {
          volume: 0.35,
          loop: true,
          durationMs: 1200,
        });

        if (!correctSoundRef.current) {
          correctSoundRef.current = new Audio('/correct.mp3');
          correctSoundRef.current.volume = 0.6;
        }
        if (!incorrectSoundRef.current) {
          incorrectSoundRef.current = new Audio('/incorrect.mp3');
          incorrectSoundRef.current.volume = 0.6;
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        navigate('/');
      }
    };

    fetchQuestions();
  }, [category, gameState, navigate]);

  const currentQuestion = questions[currentIndex];

  // Single round-level timer — drains continuously across all questions.
  useEffect(() => {
    if (questions.length === 0 || showPauseDialog || roundEndedRef.current) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleRoundEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions.length, showPauseDialog]);

  const handleRoundEnd = () => {
    if (roundEndedRef.current) return;
    roundEndedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    if (!gameState) return;

    audioManager.stopTrack('question', 600);

    const currentPlayer = gameState.players[gameState.currentPlayer];
    currentPlayer.totalScore += score;
    currentPlayer.correctAnswers += correctCount;
    currentPlayer.totalQuestions += attemptedCount;
    currentPlayer.maxStreak = Math.max(currentPlayer.maxStreak, maxStreak);
    currentPlayer.roundScores.push(score);

    // Merge category aggregates onto the player.
    const mergedCorrect = { ...(currentPlayer.correctByCategory || {}) };
    Object.entries(correctByCategory).forEach(([k, v]) => {
      mergedCorrect[k] = (mergedCorrect[k] || 0) + v;
    });
    currentPlayer.correctByCategory = mergedCorrect;

    const mergedAttempted = { ...(currentPlayer.attemptedByCategory || {}) };
    Object.entries(attemptedByCategory).forEach(([k, v]) => {
      mergedAttempted[k] = (mergedAttempted[k] || 0) + v;
    });
    currentPlayer.attemptedByCategory = mergedAttempted;

    currentPlayer.endedOnWrong = lastWasWrongRef.current;

    const usedIds = [
      ...(gameState.usedQuestionIds || []),
      ...questions.slice(0, currentIndex + 1).map((q) => q.id),
    ];

    let nextPlayer = gameState.currentPlayer;
    let nextRound = gameState.currentRound;
    if (gameState.mode === 'two-player') {
      nextPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
      if (nextPlayer === 0) nextRound++;
    } else {
      nextRound++;
    }

    const updatedGameState: GameState = {
      ...gameState,
      players: [...gameState.players],
      currentRound: nextRound,
      currentPlayer: nextPlayer,
      currentRoundScore: 0,
      currentRoundCorrect: 0,
      currentStreak: 0,
      currentMaxStreak: 0,
      usedQuestionIds: usedIds,
    };

    const isGameOver = nextRound > gameState.totalRounds;
    if (isGameOver) {
      navigate('/game-over', { state: { gameState: updatedGameState } });
    } else if (updatedGameState.mode === 'two-player') {
      navigate('/turn-transition', { state: { gameState: updatedGameState } });
    } else {
      navigate('/round-intro', { state: { gameState: updatedGameState } });
    }
  };

  const handleAnswer = (answerIndex: AnswerDirection) => {
    if (
      answerIndex === null ||
      selectedAnswer !== null ||
      feedbackState !== null ||
      !currentQuestion ||
      roundEndedRef.current
    )
      return;

    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === currentQuestion.correctIndex;
    const newStreak = isCorrect ? streak + 1 : 0;

    const { points, breakdown } = calculateScore(isCorrect, 0, ROUND_TIME, newStreak);

    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    setAttemptedCount((prev) => prev + 1);
    setAttemptedByCategory((prev) => ({
      ...prev,
      [currentQuestion.category]: (prev[currentQuestion.category] || 0) + 1,
    }));
    lastWasWrongRef.current = !isCorrect;

    if (isCorrect) {
      correctSoundRef.current?.play().catch(() => {});
      if (correctSoundRef.current) correctSoundRef.current.currentTime = 0;
      setScore((prev) => prev + points);
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      setCorrectCount((prev) => prev + 1);
      setStreakBonus((prev) => prev + breakdown.streak);
      setCorrectByCategory((prev) => ({
        ...prev,
        [currentQuestion.category]: (prev[currentQuestion.category] || 0) + 1,
      }));
      setScorePopup({ base: breakdown.base, bonus: breakdown.streak, key: Date.now() });
    } else {
      incorrectSoundRef.current?.play().catch(() => {});
      if (incorrectSoundRef.current) incorrectSoundRef.current.currentTime = 0;
      const hadStreak = streak >= 2;
      setStreak(0);
      if (hadStreak) {
        setStreakLostFlash(true);
        setTimeout(() => setStreakLostFlash(false), 700);
      }
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      moveToNext();
    }, FEEDBACK_DELAY);
  };

  const moveToNext = () => {
    if (roundEndedRef.current) return;
    // If we run out of questions in the pool, end the round early.
    if (currentIndex >= questions.length - 1) {
      handleRoundEnd();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setHighlightedAnswer(null);
    setSelectedAnswer(null);
    setFeedbackState(null);
    setScorePopup(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPauseDialog) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowPauseDialog(true);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      if (selectedAnswer !== null || feedbackState !== null || !currentQuestion) return;

      const directionMap: { [key: string]: AnswerDirection } = {
        ArrowUp: 0,
        ArrowLeft: 1,
        ArrowDown: 2,
        ArrowRight: 3,
      };

      if (e.key in directionMap) {
        e.preventDefault();
        handleAnswer(directionMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnswer, feedbackState, showPauseDialog, currentQuestion]);

  useEffect(() => {
    if (showPauseDialog) {
      audioManager.setTrackVolume('question', 0, 300);
    }
  }, [showPauseDialog]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      correctSoundRef.current = null;
      incorrectSoundRef.current = null;
    };
  }, []);

  const handleResume = () => {
    setShowPauseDialog(false);
    audioManager.setTrackVolume('question', 0.35, 500);
  };

  const handleQuit = () => {
    roundEndedRef.current = true;
    audioManager.stopTrack('question', 500);
    navigate('/');
  };

  if (!currentQuestion) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-2xl">Loading questions...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-full flex-col px-[5%] py-[3%]">
        {/* Round-level Timer Bar with question counter */}
        <div className="mb-6">
          <TimerBar
            timeRemaining={timeRemaining}
            maxTime={ROUND_TIME}
            questionNumber={attemptedCount + 1}
          />
        </div>

        <div className="mb-3 flex items-center justify-center gap-6 text-base">
          <span className="text-primary">{currentQuestion.category}</span>
          {streak >= 2 && !streakLostFlash && (
            <span className="text-warning font-bold">🔥 {streak} streak</span>
          )}
          {streakLostFlash && (
            <span className="font-bold text-destructive animate-fade-in">💔 Streak lost</span>
          )}
        </div>

        {/* Question text — large, centered, with breathing room */}
        <h1 className="mt-4 mb-10 text-center text-3xl font-bold leading-tight px-12">
          {currentQuestion.text}
        </h1>

        {/* Answers arranged around a central D-pad */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="grid items-center justify-items-center"
            style={{
              gridTemplateColumns: 'minmax(180px, 1fr) 140px minmax(180px, 1fr)',
              gridTemplateRows: 'auto 140px auto',
              columnGap: '40px',
              rowGap: '24px',
            }}
          >
            {/* Top — A (Up) */}
            <div className="col-start-2 row-start-1 w-full text-center">
              <AnswerChoice
                letter="A"
                text={currentQuestion.choices[0]}
                isSelected={selectedAnswer === 0}
                isHighlighted={highlightedAnswer === 0}
                feedbackState={
                  feedbackState && selectedAnswer === 0
                    ? feedbackState
                    : feedbackState && 0 === currentQuestion.correctIndex
                    ? 'correct'
                    : null
                }
                onClick={() => handleAnswer(0 as AnswerDirection)}
              />
            </div>

            {/* Left — B (Left) */}
            <div className="col-start-1 row-start-2 w-full text-right">
              <AnswerChoice
                letter="B"
                text={currentQuestion.choices[1]}
                isSelected={selectedAnswer === 1}
                isHighlighted={highlightedAnswer === 1}
                feedbackState={
                  feedbackState && selectedAnswer === 1
                    ? feedbackState
                    : feedbackState && 1 === currentQuestion.correctIndex
                    ? 'correct'
                    : null
                }
                onClick={() => handleAnswer(1 as AnswerDirection)}
              />
            </div>

            {/* Center D-pad with question number */}
            <div className="col-start-2 row-start-2 flex h-36 w-36 shrink-0 items-center justify-center">
              <div className="relative h-full w-full">
                {/* Up arrow */}
                <div className="absolute left-1/2 top-0 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-md border border-foreground/40 bg-card/40">
                  <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-foreground/70" />
                </div>
                {/* Left arrow */}
                <div className="absolute left-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md border border-foreground/40 bg-card/40">
                  <div className="h-0 w-0 border-t-[6px] border-b-[6px] border-r-[8px] border-t-transparent border-b-transparent border-r-foreground/70" />
                </div>
                {/* Right arrow */}
                <div className="absolute right-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-md border border-foreground/40 bg-card/40">
                  <div className="h-0 w-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-foreground/70" />
                </div>
                {/* Down arrow */}
                <div className="absolute bottom-0 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-md border border-foreground/40 bg-card/40">
                  <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-foreground/70" />
                </div>
                {/* Center badge with live score */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative grid h-14 min-w-20 place-items-center rounded-full border-2 border-primary/60 bg-card px-3 text-xl font-bold tabular-nums text-foreground shadow-[0_0_18px_hsl(var(--primary)/0.35)]">
                    {score.toLocaleString()}
                    {scorePopup && (
                      <span
                        key={scorePopup.key}
                        className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-success animate-fade-in"
                      >
                        +{scorePopup.base}
                        {scorePopup.bonus > 0 && (
                          <span className="ml-1 text-warning">+{scorePopup.bonus} bonus</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right — D (Right) */}
            <div className="col-start-3 row-start-2 w-full text-left">
              <AnswerChoice
                letter="D"
                text={currentQuestion.choices[3]}
                isSelected={selectedAnswer === 3}
                isHighlighted={highlightedAnswer === 3}
                feedbackState={
                  feedbackState && selectedAnswer === 3
                    ? feedbackState
                    : feedbackState && 3 === currentQuestion.correctIndex
                    ? 'correct'
                    : null
                }
                onClick={() => handleAnswer(3 as AnswerDirection)}
              />
            </div>

            {/* Bottom — C (Down) */}
            <div className="col-start-2 row-start-3 w-full text-center">
              <AnswerChoice
                letter="C"
                text={currentQuestion.choices[2]}
                isSelected={selectedAnswer === 2}
                isHighlighted={highlightedAnswer === 2}
                feedbackState={
                  feedbackState && selectedAnswer === 2
                    ? feedbackState
                    : feedbackState && 2 === currentQuestion.correctIndex
                    ? 'correct'
                    : null
                }
                onClick={() => handleAnswer(2 as AnswerDirection)}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="bg-card sm:max-w-md">
          <DialogTitle className="text-3xl">Game Paused</DialogTitle>
          <DialogDescription className="text-xl text-muted-foreground">
            What would you like to do?
          </DialogDescription>
          <div className="mt-6 flex flex-col gap-4">
            <TVButton size="large" onClick={handleResume}>
              Resume
            </TVButton>
            <TVButton size="large" variant="secondary" onClick={handleQuit}>
              Quit to Home
            </TVButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Question;
