import { useNavigate } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { Trophy, Users, Settings } from 'lucide-react';
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
      category: '',
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
    };
    navigate('/category', { state: { gameState } });
  };

  const handlePlayTwoPlayer = () => {
    const gameState: GameState = {
      mode: 'two-player',
      category: '',
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
    };
    navigate('/category', { state: { gameState } });
  };

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

        {!showModeSelect ? (
          <div className="flex flex-col items-center gap-6">
            <TVButton
              ref={playButtonRef}
              size="large"
              onClick={() => setShowModeSelect(true)}
              className="min-w-[280px] gap-3"
            >
              <Trophy className="h-8 w-8" />
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
        ) : (
          <div className="flex flex-col items-center gap-6">
            <TVButton
              ref={soloButtonRef}
              size="large"
              onClick={handlePlaySolo}
              className="min-w-[280px] gap-3"
            >
              <Trophy className="h-8 w-8" />
              Solo
            </TVButton>

            <TVButton
              size="large"
              variant="secondary"
              onClick={handlePlayTwoPlayer}
              className="min-w-[280px] gap-3"
            >
              <Users className="h-8 w-8" />
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

        <p className="mt-12 text-lg text-muted-foreground">
          Use arrow keys to navigate • Enter to select • Esc to go back
        </p>
      </div>
    </div>
  );
};

export default Home;
