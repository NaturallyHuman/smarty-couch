import { cn } from '@/lib/utils';

interface TimerBarProps {
  timeRemaining: number;
  maxTime: number;
}

export const TimerBar = ({ timeRemaining, maxTime }: TimerBarProps) => {
  const percentage = (timeRemaining / maxTime) * 100;
  const isLow = timeRemaining <= 5;

  return (
    <div className="flex w-full items-center gap-4">
      <span
        className={cn('text-2xl font-bold tabular-nums', {
          'text-destructive animate-pulse': isLow,
          'text-foreground': !isLow,
        })}
      >
        {timeRemaining}
      </span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full transition-all duration-1000 ease-linear', {
            'bg-destructive': isLow,
            'bg-primary': !isLow,
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
