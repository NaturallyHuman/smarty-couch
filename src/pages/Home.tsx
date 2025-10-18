import { useNavigate } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { Play, Settings } from 'lucide-react';
import { useEffect, useRef } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const playButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Auto-focus play button on mount
    playButtonRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="mb-2 text-7xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            Smarty Couch
          </span>
        </h1>
        <p className="mb-16 text-2xl text-muted-foreground">
          The ultimate TV trivia experience
        </p>

        <div className="flex flex-col items-center gap-6">
          <TVButton
            ref={playButtonRef}
            size="large"
            onClick={() => navigate('/category')}
            className="min-w-[280px] gap-3"
          >
            <Play className="h-8 w-8" />
            Play
          </TVButton>

          <TVButton
            size="default"
            variant="secondary"
            disabled
            className="min-w-[280px] gap-3 opacity-50"
          >
            <Settings className="h-6 w-6" />
            Settings
          </TVButton>
        </div>

        <p className="mt-12 text-lg text-muted-foreground">
          Use arrow keys to navigate • Enter to select • Esc to go back
        </p>
      </div>
    </div>
  );
};

export default Home;
