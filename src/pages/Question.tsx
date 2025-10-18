import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnswerChoice } from '@/components/AnswerChoice';
import { TimerBar } from '@/components/TimerBar';
import { selectQuestions } from '@/utils/questionSelector';
import { calculateScore } from '@/utils/scoring';
import { Question as QuestionType, GameState } from '@/types/game';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TVButton } from '@/components/TVButton';
import { Flame, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const QUESTION_TIME = 10;
const QUESTIONS_PER_ROUND = 10;
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
    
    const fetchQuestions = async () => {
      try {
        const selected = await selectQuestions(
          category, 
          QUESTIONS_PER_ROUND, 
          gameState.currentRound,
          gameState.usedQuestionIds || []
        );
        setQuestions(selected);
        setScore(gameState.currentRoundScore);
        setStreak(gameState.currentStreak);
        setMaxStreak(gameState.currentMaxStreak);
        setCorrectCount(gameState.currentRoundCorrect);
      } catch (error) {
        console.error('Error fetching questions:', error);
        // Fallback to home if we can't fetch questions
        navigate('/');
      }
    };
    
    fetchQuestions();
  }, [category, gameState, navigate]);

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
    if (answerIndex === null || selectedAnswer !== null || feedbackState !== null || !currentQuestion) return;

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

      // Add used question IDs to game state
      const usedIds = [...(gameState.usedQuestionIds || []), ...questions.map(q => q.id)];

      const updatedGameState: GameState = {
        ...gameState,
        players: [...gameState.players],
        currentRoundScore: 0,
        currentRoundCorrect: 0,
        currentStreak: 0,
        currentMaxStreak: 0,
        usedQuestionIds: usedIds,
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

      if (selectedAnswer !== null || feedbackState !== null || !currentQuestion) return;

      const directionMap: { [key: string]: AnswerDirection } = {
        ArrowUp: 0,
        ArrowLeft: 1,
        ArrowDown: 2,
        ArrowRight: 3,
      };

      if (e.key in directionMap) {
        e.preventDefault();
        const direction = directionMap[e.key];
        handleAnswer(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [highlightedAnswer, selectedAnswer, feedbackState, showPauseDialog, timeRemaining, streak, score, currentQuestion]);

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
      <div className="flex min-h-screen items-start justify-center bg-background p-[5%]">
        <div className="aspect-video w-full max-w-[1920px]">
          <div className="flex h-full flex-col">
            {/* Timer Bar */}
            <div className="mb-8">
              <TimerBar timeRemaining={timeRemaining} maxTime={QUESTION_TIME} />
            </div>

            {/* Category */}
            <h2 className="mb-6 text-center text-xl text-primary">
              {currentQuestion.category}
            </h2>

            {/* Question */}
            <h1 className="mb-12 text-center text-2xl font-semibold leading-tight px-8">
              {currentQuestion.text}
            </h1>

            {/* D-pad Answer Layout */}
            <div className="relative mx-auto h-[450px] w-full max-w-[900px] flex-1">
              {/* Top Answer (Up/A) */}
              <div className="absolute left-1/2 top-0 w-[40%] -translate-x-1/2">
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

              {/* Middle Row */}
              <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-between">
                {/* Left Answer (Left/B) */}
                <div className="w-[38%]">
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

                {/* Center D-pad Visual */}
                <div className="flex h-32 w-32 shrink-0 items-center justify-center">
                  <div className="relative h-full w-full opacity-30">
                    {/* D-pad shape */}
                    <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-t-lg border-2 border-foreground/50 bg-background/20 flex items-center justify-center">
                      <ArrowUp className="h-5 w-5" />
                    </div>
                    <div className="absolute left-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-l-lg border-2 border-foreground/50 bg-background/20 flex items-center justify-center">
                      <ArrowLeft className="h-5 w-5" />
                    </div>
                    <div className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-r-lg border-2 border-foreground/50 bg-background/20 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <div className="absolute bottom-0 left-1/2 h-10 w-10 -translate-x-1/2 rounded-b-lg border-2 border-foreground/50 bg-background/20 flex items-center justify-center">
                      <ArrowDown className="h-5 w-5" />
                    </div>
                    <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/30" />
                  </div>
                </div>

                {/* Right Answer (Right/D) */}
                <div className="w-[38%]">
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
              </div>

              {/* Bottom Answer (Down/C) */}
              <div className="absolute bottom-0 left-1/2 w-[40%] -translate-x-1/2">
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
