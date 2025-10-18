import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnswerChoice } from '@/components/AnswerChoice';
import { TimerBar } from '@/components/TimerBar';
import { selectQuestions } from '@/utils/questionSelector';
import { calculateScore } from '@/utils/scoring';
import { Question as QuestionType } from '@/types/game';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TVButton } from '@/components/TVButton';

const QUESTION_TIME = 15;
const FEEDBACK_DELAY = 1200;

type AnswerDirection = 0 | 1 | 2 | 3 | null;

const Question = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || 'All';

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
    const selected = selectQuestions(category, 10);
    setQuestions(selected);
  }, [category]);

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
      navigate('/results', {
        state: {
          correctAnswers: correctCount + (feedbackState === 'correct' ? 1 : 0),
          totalQuestions: questions.length,
          score: score,
          maxStreak,
          streakBonus,
          category,
          correctByCategory,
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
      <div className="flex min-h-screen flex-col p-8">
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

        <div className="mb-8">
          <TimerBar timeRemaining={timeRemaining} maxTime={QUESTION_TIME} />
        </div>

        <div className="mb-12 flex-1">
          <h2 className="mb-2 text-2xl text-primary">{currentQuestion.category}</h2>
          <h1 className="text-[2.75rem] font-bold leading-tight">{currentQuestion.text}</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {currentQuestion.choices.map((choice, index) => (
            <AnswerChoice
              key={index}
              letter={['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D'}
              text={choice}
              isSelected={selectedAnswer === index}
              isHighlighted={highlightedAnswer === index}
              feedbackState={
                feedbackState && selectedAnswer === index
                  ? feedbackState
                  : feedbackState && index === currentQuestion.correctIndex
                  ? 'correct'
                  : null
              }
              onClick={() => {
                if (highlightedAnswer === index) {
                  handleAnswer(index as AnswerDirection);
                } else {
                  setHighlightedAnswer(index as AnswerDirection);
                }
              }}
            />
          ))}
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
