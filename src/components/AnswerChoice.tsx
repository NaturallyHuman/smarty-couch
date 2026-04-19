import { cn } from '@/lib/utils';

interface AnswerChoiceProps {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  isSelected: boolean;
  isHighlighted: boolean;
  feedbackState?: 'correct' | 'incorrect' | null;
  onClick: () => void;
}

export const AnswerChoice = ({
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
        'w-full bg-transparent border-0 p-0 focus:outline-none transition-colors duration-200',
        'text-xl font-medium leading-snug text-center',
        {
          'text-foreground': !isHighlighted && !isSelected && !showFeedback,
          'text-primary [text-shadow:0_0_18px_hsl(var(--primary)/0.7)]':
            (isHighlighted || isSelected) && !showFeedback,
          'text-success [text-shadow:0_0_18px_hsl(var(--success)/0.7)]':
            feedbackState === 'correct',
          'text-destructive line-through opacity-80': feedbackState === 'incorrect',
        }
      )}
    >
      {text}
    </button>
  );
};
