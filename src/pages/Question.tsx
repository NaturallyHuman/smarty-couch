import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnswerChoice } from '@/components/AnswerChoice';
import { TimerBar } from '@/components/TimerBar';
import { selectQuestions } from '@/utils/questionSelector';
import { calculateScore } from '@/utils/scoring';
import { Question as QuestionType, GameState } from '@/types/game';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TVButton } from '@/components/TVButton';

const QUESTION_TIME = 10;
const QUESTIONS_PER_ROUND = 6;
const FEEDBACK_DELAY = 1200;

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
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [correctByCategory, setCorrectByCategory] = useState<{ [key: string]: number }>({});
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [streakBonus, setStreakBonus] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!gameState) {
      navigate('/');
      return;
    }
    const selected = selectQuestions(category, QUESTIONS_PER_ROUND);
    setQuestions(selected);
    setScore(gameState.currentRoundScore);
    setStreak(gameState.currentStreak);
    setMaxStreak(gameState.currentMaxStreak);
    setCorrectCount(gameState.currentRoundCorrect);
  }, [category, gameState]);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!currentQuestion || selectedAnswer !== null || feedbackState !== null) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, selectedAnswer, feedbackState]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFeedbackState('incorrect');
    setStreak(0);
    
    feedbackTimeoutRef.current = setTimeout(() => {
      moveToNext();
    }, FEEDBACK_DELAY);
  };

  const handleAnswer = (answerIndex: AnswerDirection) => {
    if (answerIndex === null || selectedAnswer !== null || feedbackState !== null) return;

    setSelectedAnswer(answerIndex);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeRemaining(0);

    const isCorrect = answerIndex === currentQuestion.correctIndex;
    const newStreak = isCorrect ? streak + 1 : 0;
    
    const { points, breakdown } = calculateScore(
      isCorrect,
      timeRemaining,
      QUESTION_TIME,
      newStreak
    );

    setFeedbackState(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore((prev) => prev + points);
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      setCorrectCount((prev) => prev + 1);
      setStreakBonus((prev) => prev + breakdown.streak);
      setCorrectByCategory((prev) => ({
        ...prev,
        [currentQuestion.category]: (prev[currentQuestion.category] || 0) + 1,
      }));
    } else {
      setStreak(0);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      moveToNext();
    }, FEEDBACK_DELAY);
  };

  const moveToNext = () => {
    if (currentIndex >= questions.length - 1) {
      if (!gameState) return;
      
      const currentPlayer = gameState.players[gameState.currentPlayer];
      currentPlayer.totalScore += score;
      currentPlayer.correctAnswers += correctCount;
      currentPlayer.totalQuestions += questions.length;
      currentPlayer.maxStreak = Math.max(currentPlayer.maxStreak, maxStreak);
      currentPlayer.roundScores.push(score);

      const updatedGameState: GameState = {
        ...gameState,
        players: [...gameState.players],
        currentRoundScore: 0,
        currentRoundCorrect: 0,
        currentStreak: 0,
        currentMaxStreak: 0,
      };

      navigate('/results', {
        state: {
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          score: score,
          maxStreak,
          streakBonus,
          category,
          correctByCategory,
          gameState: updatedGameState,
        },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setHighlightedAnswer(null);
      setSelectedAnswer(null);
      setFeedbackState(null);
      setTimeRemaining(QUESTION_TIME);
    }
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

      if (selectedAnswer !== null || feedbackState !== null) return;

      const directionMap: { [key: string]: AnswerDirection } = {
        ArrowUp: 0,
        ArrowLeft: 1,
        ArrowDown: 2,
        ArrowRight: 3,
      };

      if (e.key in directionMap) {
        e.preventDefault();
        const direction = directionMap[e.key];
        
        if (highlightedAnswer === direction) {
          handleAnswer(direction);
        } else {
          setHighlightedAnswer(direction);
        }
      } else if (e.key === 'Enter' && highlightedAnswer !== null) {
        e.preventDefault();
        handleAnswer(highlightedAnswer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [highlightedAnswer, selectedAnswer, feedbackState, showPauseDialog, timeRemaining, streak, score]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const handleResume = () => {
    setShowPauseDialog(false);
    setTimeRemaining(QUESTION_TIME);
    setHighlightedAnswer(null);
    setSelectedAnswer(null);
    setFeedbackState(null);
  };

  const handleQuit = () => {
    navigate('/');
  };

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl">Loading questions...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-xl text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="flex gap-8 text-xl">
              <div>
                Score: <span className="font-bold text-primary">{score}</span>
              </div>
              <div>
                Streak: <span className="font-bold text-warning">{streak}</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="mb-8">
            <TimerBar timeRemaining={timeRemaining} maxTime={QUESTION_TIME} />
          </div>

          {/* Question */}
          <div className="mb-12 rounded-3xl bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl text-primary">{currentQuestion.category}</h2>
            <h1 className="text-5xl font-bold leading-tight">{currentQuestion.text}</h1>
          </div>

          {/* D-pad Answer Layout */}
          <div className="relative mx-auto mb-12 h-[500px] w-full max-w-4xl">
            {/* Top Answer (Up/A) */}
            <div className="absolute left-1/2 top-0 w-[380px] -translate-x-1/2">
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
                onClick={() => {
                  if (highlightedAnswer === 0) {
                    handleAnswer(0 as AnswerDirection);
                  } else {
                    setHighlightedAnswer(0 as AnswerDirection);
                  }
                }}
              />
            </div>

            {/* Middle Row */}
            <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-between">
              {/* Left Answer (Left/B) */}
              <div className="w-[380px]">
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
                  onClick={() => {
                    if (highlightedAnswer === 1) {
                      handleAnswer(1 as AnswerDirection);
                    } else {
                      setHighlightedAnswer(1 as AnswerDirection);
                    }
                  }}
                />
              </div>

              {/* Right Answer (Right/D) */}
              <div className="w-[380px]">
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
                  onClick={() => {
                    if (highlightedAnswer === 3) {
                      handleAnswer(3 as AnswerDirection);
                    } else {
                      setHighlightedAnswer(3 as AnswerDirection);
                    }
                  }}
                />
              </div>
            </div>

            {/* Bottom Answer (Down/C) */}
            <div className="absolute bottom-0 left-1/2 w-[380px] -translate-x-1/2">
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
                onClick={() => {
                  if (highlightedAnswer === 2) {
                    handleAnswer(2 as AnswerDirection);
                  } else {
                    setHighlightedAnswer(2 as AnswerDirection);
                  }
                }}
              />
            </div>
          </div>

          {/* Instructions */}
          <p className="text-center text-lg text-muted-foreground">
            Use arrow keys to select your answer
          </p>
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
