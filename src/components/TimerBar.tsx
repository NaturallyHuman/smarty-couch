import { cn } from '@/lib/utils';

interface TimerBarProps {
  timeRemaining: number;
  maxTime: number;
}

export const TimerBar = ({ timeRemaining, maxTime }: TimerBarProps) => {
  const percentage = (timeRemaining / maxTime) * 100;
  const isLow = timeRemaining <= 5;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xl font-medium text-muted-foreground">Time Remaining</span>
        <span
          className={cn('text-3xl font-bold tabular-nums', {
            'text-destructive animate-pulse': isLow,
            'text-foreground': !isLow,
          })}
        >
          {timeRemaining}s
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
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
