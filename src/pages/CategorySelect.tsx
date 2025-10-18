import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { ArrowLeft } from 'lucide-react';

const categories = ['All', 'Movies', 'Science', 'History', 'Sports', 'General'];

const CategorySelect = () => {
  const navigate = useNavigate();
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
    navigate('/round-intro', { state: { category } });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <button
        onClick={() => navigate('/')}
        className="absolute left-8 top-8 flex items-center gap-2 text-xl text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:text-foreground"
      >
        <ArrowLeft className="h-6 w-6" />
        Back
      </button>

      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold">Choose a Category</h1>
        <p className="mb-12 text-xl text-muted-foreground">
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
