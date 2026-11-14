import { useNavigate } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { useEffect, useRef } from 'react';
import { createGame } from '@/utils/gameSession';

const Home = () => {
  const navigate = useNavigate();
  const playButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    playButtonRef.current?.focus();
  }, []);

  const handlePlay = () => {
    const gameState = createGame();
    navigate('/round-intro', { state: { gameState } });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[5%] py-[2%]">
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-bold tracking-tight">
          <span className="text-primary">
            Smarty Couch
          </span>
        </h1>
        <p className="mb-12 text-lg text-muted-foreground">
          Train your brain.
        </p>

        <div className="flex flex-col items-center gap-5">
          <TVButton
            ref={playButtonRef}
            size="large"
            onClick={handlePlay}
            className="min-w-[280px]"
          >
            Play
          </TVButton>
        </div>
      </div>
    </div>
  );
};

export default Home;
