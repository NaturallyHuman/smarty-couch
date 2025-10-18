import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface AnswerChoiceProps {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  isSelected: boolean;
  isHighlighted: boolean;
  feedbackState?: 'correct' | 'incorrect' | null;
  onClick: () => void;
}

export const AnswerChoice = ({
  letter,
  text,
  isSelected,
  isHighlighted,
  feedbackState,
  onClick,
}: AnswerChoiceProps) => {
  const showFeedback = feedbackState !== null && feedbackState !== undefined;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full rounded-xl p-5 text-center transition-all duration-200',
        'border-2 border-border/50 bg-card/30 backdrop-blur-sm',
        'focus:outline-none',
        'text-lg font-medium leading-tight',
        'min-h-[80px] flex items-center justify-center',
        {
          // Normal state
          'hover:border-primary/50 hover:bg-card/50': !isHighlighted && !isSelected && !showFeedback,
          // Highlighted state (D-pad navigation)
          'border-primary bg-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.3)]': isHighlighted && !showFeedback,
          // Selected state (locked in)
          'border-primary bg-primary/30': isSelected && !showFeedback,
          // Correct feedback
          'border-success bg-success/30 animate-pulse': feedbackState === 'correct',
          // Incorrect feedback
          'border-destructive bg-destructive/30': feedbackState === 'incorrect',
        }
      )}
    >
      <span className="block">{text}</span>
    </button>
  );
};
