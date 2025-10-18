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
        'relative w-full rounded-xl p-4 text-center transition-all duration-200',
        'focus:outline-none',
        'text-xl font-semibold leading-tight',
        {
          // Normal state
          'bg-card/50 hover:bg-primary/10': !isHighlighted && !isSelected && !showFeedback,
          // Highlighted state (D-pad navigation)
          'bg-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.3)]': isHighlighted && !showFeedback,
          // Selected state (locked in)
          'bg-primary/30': isSelected && !showFeedback,
          // Correct feedback
          'bg-success/30 animate-pulse': feedbackState === 'correct',
          // Incorrect feedback
          'bg-destructive/30': feedbackState === 'incorrect',
        }
      )}
    >
      <span>{text}</span>
    </button>
  );
};
