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
        'relative w-full rounded-xl p-6 text-left transition-all duration-200',
        'border-2 focus:outline-none',
        'text-[2rem] font-medium leading-tight',
        {
          // Normal state
          'border-border bg-card hover:border-primary/50': !isHighlighted && !isSelected && !showFeedback,
          // Highlighted state (D-pad navigation)
          'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.3)]': isHighlighted && !showFeedback,
          // Selected state (locked in)
          'border-primary bg-primary/20': isSelected && !showFeedback,
          // Correct feedback
          'border-success bg-success/20 animate-pulse': feedbackState === 'correct',
          // Incorrect feedback
          'border-destructive bg-destructive/20': feedbackState === 'incorrect',
        }
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl font-bold transition-colors',
            {
              'bg-primary/20 text-primary': isHighlighted || isSelected,
              'bg-muted text-muted-foreground': !isHighlighted && !isSelected && !showFeedback,
              'bg-success text-success-foreground': feedbackState === 'correct',
              'bg-destructive text-destructive-foreground': feedbackState === 'incorrect',
            }
          )}
        >
          {showFeedback ? (
            feedbackState === 'correct' ? (
              <Check className="h-7 w-7" />
            ) : (
              <X className="h-7 w-7" />
            )
          ) : (
            letter
          )}
        </div>
        <span className="flex-1">{text}</span>
      </div>
    </button>
  );
};
