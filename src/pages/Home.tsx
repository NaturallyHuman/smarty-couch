import { useNavigate } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { useEffect, useRef } from 'react';
import { GameState } from '@/types/game';

const Home = () => {
  const navigate = useNavigate();
  const playButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    playButtonRef.current?.focus();
  }, []);

  const handlePlay = () => {
    const gameState: GameState = {
      mode: 'solo',
      category: 'Mixed',
      currentRound: 1,
      totalRounds: 3,
      currentPlayer: 0,
      players: [{
        name: 'Player 1',
        totalScore: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        maxStreak: 0,
        roundScores: [],
      }],
      currentRoundScore: 0,
      currentRoundCorrect: 0,
      currentStreak: 0,
      currentMaxStreak: 0,
      usedQuestionIds: [],
    };
    navigate('/round-intro', { state: { gameState } });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[5%] py-[2%]">
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            Smarty Couch
          </span>
        </h1>
        <p className="mb-12 text-lg text-muted-foreground">
          The ultimate TV trivia experience
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
