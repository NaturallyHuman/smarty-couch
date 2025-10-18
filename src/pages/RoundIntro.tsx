import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { Clock, TrendingUp, Target } from 'lucide-react';

const RoundIntro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || 'All';
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigate('/question', { state: { category } });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/category');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, category]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl text-center">
        <h1 className="mb-4 text-6xl font-bold">Get Ready!</h1>
        <p className="mb-12 text-3xl text-primary">{category} Trivia</p>

        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-card p-6">
            <Target className="mx-auto mb-3 h-12 w-12 text-primary" />
            <div className="text-4xl font-bold">10</div>
            <div className="text-xl text-muted-foreground">Questions</div>
          </div>

          <div className="rounded-2xl bg-card p-6">
            <Clock className="mx-auto mb-3 h-12 w-12 text-primary" />
            <div className="text-4xl font-bold">15s</div>
            <div className="text-xl text-muted-foreground">Per Question</div>
          </div>

          <div className="rounded-2xl bg-card p-6">
            <TrendingUp className="mx-auto mb-3 h-12 w-12 text-primary" />
            <div className="text-4xl font-bold">Ramps Up</div>
            <div className="text-xl text-muted-foreground">Difficulty</div>
          </div>
        </div>

        <TVButton
          ref={buttonRef}
          size="large"
          onClick={() => navigate('/question', { state: { category } })}
          className="min-w-[300px]"
        >
          Start Round
        </TVButton>

        <p className="mt-8 text-lg text-muted-foreground">
          Use arrow keys for A/B/C/D • Enter to confirm • Esc to pause
        </p>
      </div>
    </div>
  );
};

export default RoundIntro;
