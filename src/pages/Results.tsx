import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { Trophy, Target, Zap, TrendingUp } from 'lucide-react';
import { updateLifetimeStats } from '@/utils/lifetimeStats';
import { GameState } from '@/types/game';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    correctAnswers = 0,
    totalQuestions = 6,
    score = 0,
    maxStreak = 0,
    streakBonus = 0,
    category = 'All',
    correctByCategory = {},
    gameState,
  } = location.state || {};

  const typedGameState = gameState as GameState | undefined;

  useEffect(() => {
    buttonRef.current?.focus();
    
    // Update lifetime stats
    updateLifetimeStats(
      { correctAnswers, totalQuestions, score, maxStreak, streakBonus },
      category,
      correctByCategory
    );
  }, []);

  const handleContinue = () => {
    if (!typedGameState) {
      navigate('/stats');
      return;
    }

    const isGameOver =
      (typedGameState.mode === 'solo' && typedGameState.currentRound >= typedGameState.totalRounds) ||
      (typedGameState.mode === 'two-player' && typedGameState.currentRound >= typedGameState.totalRounds);

    if (isGameOver) {
      navigate('/game-over', { state: { gameState: typedGameState } });
    } else {
      // Move to next round/player
      let nextPlayer = typedGameState.currentPlayer;
      let nextRound = typedGameState.currentRound;

      if (typedGameState.mode === 'two-player') {
        nextPlayer = (typedGameState.currentPlayer + 1) % typedGameState.players.length;
        if (nextPlayer === 0) {
          nextRound++;
        }
      } else {
        nextRound++;
      }

      const updatedGameState: GameState = {
        ...typedGameState,
        currentRound: nextRound,
        currentPlayer: nextPlayer,
        currentRoundScore: 0,
        currentRoundCorrect: 0,
        currentStreak: 0,
        currentMaxStreak: 0,
      };

      if (typedGameState.mode === 'two-player' && nextPlayer !== typedGameState.currentPlayer) {
        navigate('/turn-transition', { state: { gameState: updatedGameState } });
      } else {
        navigate('/round-intro', { state: { gameState: updatedGameState } });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typedGameState]);

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-[8vw] py-6">
      <div className="w-full max-w-[80vw] text-center">
        <div className="mb-8">
          <Trophy className="mx-auto mb-4 h-24 w-24 text-primary" />
          <h1 className="mb-2 text-5xl font-bold">Round Complete!</h1>
          <p className="text-xl text-muted-foreground">{category} Trivia</p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-card p-8">
            <Target className="mx-auto mb-3 h-12 w-12 text-primary" />
            <div className="text-4xl font-bold text-primary">{correctAnswers}</div>
            <div className="text-xl text-muted-foreground">out of {totalQuestions}</div>
            <div className="mt-2 text-lg font-medium text-foreground">{percentage}% Correct</div>
          </div>

          <div className="rounded-2xl bg-card p-8">
            <Zap className="mx-auto mb-3 h-12 w-12 text-warning" />
            <div className="text-4xl font-bold text-warning">{maxStreak}</div>
            <div className="text-xl text-muted-foreground">Best Streak</div>
            {streakBonus > 0 && (
              <div className="mt-2 text-lg font-medium text-success">+{streakBonus} bonus</div>
            )}
          </div>
        </div>

        <div className="mb-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-12">
          <TrendingUp className="mx-auto mb-4 h-16 w-16 text-primary" />
          <div className="mb-2 text-2xl text-muted-foreground">Total Score</div>
          <div className="text-6xl font-bold text-primary">{score.toLocaleString()}</div>
        </div>

        <div className="mb-4 text-xl text-muted-foreground">
          {typedGameState && (
            <>Round {typedGameState.currentRound - (typedGameState.mode === 'two-player' && typedGameState.currentPlayer === 1 ? 0 : 1)} Complete!</>
          )}
        </div>

        <TVButton
          ref={buttonRef}
          size="large"
          onClick={handleContinue}
          className="min-w-[300px]"
        >
          {typedGameState &&
          ((typedGameState.mode === 'solo' && typedGameState.currentRound >= typedGameState.totalRounds) ||
            (typedGameState.mode === 'two-player' && typedGameState.currentRound >= typedGameState.totalRounds))
            ? 'View Final Results'
            : 'Continue'}
        </TVButton>
      </div>
    </div>
  );
};

export default Results;
