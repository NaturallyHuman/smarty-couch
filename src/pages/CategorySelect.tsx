import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { ArrowLeft } from 'lucide-react';
import { GameState } from '@/types/game';

const categories = ['All', 'Movies', 'Science', 'History', 'Sports', 'General'];

const CategorySelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameState = location.state?.gameState as GameState;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    buttonRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : categories.length - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < categories.length - 1 ? prev + 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          handleSelect(categories[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          navigate('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, navigate]);

  const handleSelect = (category: string) => {
    if (!gameState) {
      navigate('/');
      return;
    }
    const updatedGameState = { ...gameState, category };
    navigate('/round-intro', { state: { gameState: updatedGameState } });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-[5%] py-[3%]">
      <button
        onClick={() => navigate('/')}
        className="absolute left-[3%] top-[3%] flex items-center gap-2 text-xl text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:text-foreground"
      >
        <ArrowLeft className="h-6 w-6" />
        Back
      </button>

      <div className="w-full max-w-[90%] text-center">
        <h1 className="mb-4 text-4xl font-bold">Choose a Category</h1>
        <p className="mb-12 text-lg text-muted-foreground">
          Select a category or play with all categories
        </p>

        <div className="grid gap-4">
          {categories.map((category, index) => (
            <TVButton
              key={category}
              ref={(el) => (buttonRefs.current[index] = el)}
              size="large"
              variant={selectedIndex === index ? 'primary' : 'secondary'}
              onClick={() => handleSelect(category)}
              className="w-full"
            >
              {category}
            </TVButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySelect;
