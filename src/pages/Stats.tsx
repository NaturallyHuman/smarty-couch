import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { loadLifetimeStats } from '@/utils/lifetimeStats';
import { Trophy, Zap, Target, TrendingUp, TrendingDown } from 'lucide-react';

const Stats = () => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const stats = loadLifetimeStats();

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigate('/highscore');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Find best and worst categories
  const categoryEntries = Object.entries(stats.categoryStats);
  const bestCategory = categoryEntries.reduce((best, [cat, data]) => {
    const accuracy = data.total > 0 ? data.correct / data.total : 0;
    const bestAccuracy = best.data.total > 0 ? best.data.correct / best.data.total : 0;
    return accuracy > bestAccuracy ? { cat, data } : best;
  }, { cat: 'None', data: { correct: 0, total: 0 } });

  const worstCategory = categoryEntries.reduce((worst, [cat, data]) => {
    const accuracy = data.total > 0 ? data.correct / data.total : 1;
    const worstAccuracy = worst.data.total > 0 ? worst.data.correct / worst.data.total : 1;
    return accuracy < worstAccuracy ? { cat, data } : worst;
  }, { cat: 'None', data: { correct: 0, total: 0 } });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-[8vw] py-6">
      <div className="w-full max-w-[85vw] text-center">
        <h1 className="mb-4 text-5xl font-bold">Lifetime Stats</h1>
        <p className="mb-12 text-xl text-muted-foreground">Your trivia journey so far</p>

        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-card p-6">
            <Trophy className="mx-auto mb-3 h-12 w-12 text-primary" />
            <div className="text-3xl font-bold text-primary">
              {stats.highestScore.toLocaleString()}
            </div>
            <div className="text-lg text-muted-foreground">Highest Score</div>
          </div>

          <div className="rounded-2xl bg-card p-6">
            <Zap className="mx-auto mb-3 h-12 w-12 text-warning" />
            <div className="text-3xl font-bold text-warning">{stats.longestStreak}</div>
            <div className="text-lg text-muted-foreground">Longest Streak</div>
          </div>

          <div className="rounded-2xl bg-card p-6">
            <Target className="mx-auto mb-3 h-12 w-12 text-success" />
            <div className="text-3xl font-bold text-success">{stats.timesPlayed}</div>
            <div className="text-lg text-muted-foreground">Games Played</div>
          </div>

          <div className="rounded-2xl bg-card p-6">
            <TrendingUp className="mx-auto mb-3 h-12 w-12 text-foreground" />
            <div className="text-3xl font-bold">
              {categoryEntries.reduce((sum, [, data]) => sum + data.correct, 0)}
            </div>
            <div className="text-lg text-muted-foreground">Total Correct</div>
          </div>
        </div>

        {categoryEntries.length > 0 && (
          <div className="mb-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-success/20 to-success/5 p-8">
              <TrendingUp className="mx-auto mb-3 h-10 w-10 text-success" />
              <div className="mb-2 text-xl text-muted-foreground">Best Category</div>
              <div className="text-3xl font-bold text-success">{bestCategory.cat}</div>
              <div className="mt-2 text-lg text-muted-foreground">
                {bestCategory.data.total > 0
                  ? `${Math.round((bestCategory.data.correct / bestCategory.data.total) * 100)}% accuracy`
                  : 'No data'}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 p-8">
              <TrendingDown className="mx-auto mb-3 h-10 w-10 text-destructive" />
              <div className="mb-2 text-xl text-muted-foreground">Room to Improve</div>
              <div className="text-3xl font-bold text-destructive">{worstCategory.cat}</div>
              <div className="mt-2 text-lg text-muted-foreground">
                {worstCategory.data.total > 0
                  ? `${Math.round((worstCategory.data.correct / worstCategory.data.total) * 100)}% accuracy`
                  : 'No data'}
              </div>
            </div>
          </div>
        )}

        <TVButton
          ref={buttonRef}
          size="large"
          onClick={() => navigate('/highscore')}
          className="min-w-[300px]"
        >
          Continue
        </TVButton>
      </div>
    </div>
  );
};

export default Stats;
