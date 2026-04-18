import { useNavigate } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { useEffect, useRef, useState } from 'react';
import { GameState } from '@/types/game';

const Home = () => {
  const navigate = useNavigate();
  const [showModeSelect, setShowModeSelect] = useState(false);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const soloButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    playButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (showModeSelect) {
      soloButtonRef.current?.focus();
    }
  }, [showModeSelect]);

  const handlePlaySolo = () => {
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

  const handlePlayTwoPlayer = () => {
    const gameState: GameState = {
      mode: 'two-player',
      category: 'Mixed',
      currentRound: 1,
      totalRounds: 4,
      currentPlayer: 0,
      players: [
        {
          name: 'Player 1',
          totalScore: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          maxStreak: 0,
          roundScores: [],
        },
        {
          name: 'Player 2',
          totalScore: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          maxStreak: 0,
          roundScores: [],
        },
      ],
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

        {!showModeSelect ? (
          <div className="flex flex-col items-center gap-5">
            <TVButton
              ref={playButtonRef}
              size="large"
              onClick={() => setShowModeSelect(true)}
              className="min-w-[280px]"
            >
              Play
            </TVButton>

            <TVButton
              size="default"
              variant="secondary"
              disabled
              className="min-w-[280px] opacity-50"
            >
              Settings
            </TVButton>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <TVButton
              ref={soloButtonRef}
              size="large"
              onClick={handlePlaySolo}
              className="min-w-[280px]"
            >
              Solo
            </TVButton>

            <TVButton
              size="large"
              variant="secondary"
              onClick={handlePlayTwoPlayer}
              className="min-w-[280px]"
            >
              Two Players
            </TVButton>

            <TVButton
              size="default"
              variant="secondary"
              onClick={() => setShowModeSelect(false)}
              className="min-w-[280px]"
            >
              Back
            </TVButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
