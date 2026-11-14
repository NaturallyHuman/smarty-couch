import { cn } from '@/lib/utils';
import { TVButton } from '@/components/TVButton';

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
    <TVButton
      variant="ghost"
      onClick={onClick}
      className={cn(
        'answer-choice relative w-full bg-transparent border-0 p-0 focus:outline-none transition-colors duration-200 hover:bg-transparent active:scale-100',
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
      data-feedback={feedbackState || undefined}
      data-selected={isSelected || undefined}
    >
      <span className="answer-label inline-block">{text}</span>
    </TVButton>
  );
};
