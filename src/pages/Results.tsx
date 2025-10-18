import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { Trophy, Target, Zap, TrendingUp } from 'lucide-react';
import { updateLifetimeStats } from '@/utils/lifetimeStats';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    correctAnswers = 0,
    totalQuestions = 10,
    score = 0,
    maxStreak = 0,
    streakBonus = 0,
    category = 'All',
    correctByCategory = {},
  } = location.state || {};

  useEffect(() => {
    buttonRef.current?.focus();
    
    // Update lifetime stats
    updateLifetimeStats(
      { correctAnswers, totalQuestions, score, maxStreak, streakBonus },
      category,
      correctByCategory
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigate('/stats');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl text-center">
        <div className="mb-8">
          <Trophy className="mx-auto mb-4 h-24 w-24 text-primary" />
          <h1 className="mb-2 text-6xl font-bold">Round Complete!</h1>
          <p className="text-2xl text-muted-foreground">{category} Trivia</p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-card p-8">
            <Target className="mx-auto mb-3 h-12 w-12 text-primary" />
            <div className="text-5xl font-bold text-primary">{correctAnswers}</div>
            <div className="text-2xl text-muted-foreground">out of {totalQuestions}</div>
            <div className="mt-2 text-xl font-medium text-foreground">{percentage}% Correct</div>
          </div>

          <div className="rounded-2xl bg-card p-8">
            <Zap className="mx-auto mb-3 h-12 w-12 text-warning" />
            <div className="text-5xl font-bold text-warning">{maxStreak}</div>
            <div className="text-2xl text-muted-foreground">Best Streak</div>
            {streakBonus > 0 && (
              <div className="mt-2 text-xl font-medium text-success">+{streakBonus} bonus</div>
            )}
          </div>
        </div>

        <div className="mb-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-12">
          <TrendingUp className="mx-auto mb-4 h-16 w-16 text-primary" />
          <div className="mb-2 text-3xl text-muted-foreground">Total Score</div>
          <div className="text-7xl font-bold text-primary">{score.toLocaleString()}</div>
        </div>

        <TVButton
          ref={buttonRef}
          size="large"
          onClick={() => navigate('/stats')}
          className="min-w-[300px]"
        >
          View Lifetime Stats
        </TVButton>
      </div>
    </div>
  );
};

export default Results;
