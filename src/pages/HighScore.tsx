import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { loadLifetimeStats } from '@/utils/lifetimeStats';
import { Trophy, Sparkles } from 'lucide-react';

const HighScore = () => {
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
        navigate('/');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl text-center">
        <Sparkles className="mx-auto mb-6 h-20 w-20 text-primary animate-pulse" />
        
        <h1 className="mb-4 text-5xl font-bold">High Score Challenge</h1>
        <p className="mb-12 text-2xl text-muted-foreground">
          Think you can beat your personal best?
        </p>

        <div className="mb-12 rounded-3xl bg-gradient-to-br from-primary/30 via-purple-500/20 to-primary/30 p-12 shadow-[0_0_40px_hsl(var(--primary)/0.3)]">
          <Trophy className="mx-auto mb-4 h-24 w-24 text-primary" />
          <div className="mb-3 text-3xl text-muted-foreground">Your High Score</div>
          <div className="text-8xl font-bold text-primary">
            {stats.highestScore.toLocaleString()}
          </div>
        </div>

        <div className="mb-12 space-y-4 text-xl text-muted-foreground">
          <p>Every correct answer counts towards your total score</p>
          <p>Build streaks for massive bonus points</p>
          <p>Answer quickly to maximize your timer bonus</p>
        </div>

        <TVButton
          ref={buttonRef}
          size="large"
          onClick={() => navigate('/')}
          className="min-w-[300px]"
        >
          Back to Home
        </TVButton>
      </div>
    </div>
  );
};

export default HighScore;
