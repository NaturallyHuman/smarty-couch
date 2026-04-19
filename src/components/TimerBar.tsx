import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Hourglass } from 'lucide-react';

interface TimerBarProps {
  timeRemaining: number;
  maxTime: number;
  score?: number;
}

export const TimerBar = ({ timeRemaining, maxTime, score }: TimerBarProps) => {
  const percentage = (timeRemaining / maxTime) * 100;
  const isLow = timeRemaining <= 5;

  const [animate, setAnimate] = useState(false);
  const prevPctRef = useRef(percentage);

  useEffect(() => {
    if (percentage < prevPctRef.current) {
      setAnimate(true);
    } else if (percentage > prevPctRef.current) {
      setAnimate(false);
    }
    prevPctRef.current = percentage;
  }, [percentage]);

  return (
    <div className="flex w-full items-center gap-3">
      {/* Pill: hourglass + seconds + bar */}
      <div className="flex flex-1 items-center gap-3 rounded-full border border-border/60 bg-card/60 px-5 py-2 backdrop-blur-sm">
        <Hourglass
          className={cn('h-5 w-5 shrink-0', {
            'text-destructive animate-pulse': isLow,
            'text-foreground/80': !isLow,
          })}
        />
        <span
          className={cn('w-10 text-xl font-bold tabular-nums', {
            'text-destructive animate-pulse': isLow,
            'text-foreground': !isLow,
          })}
        >
          {timeRemaining}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
          <div
            className={cn('h-full ease-linear', {
              'transition-all duration-1000': animate,
              'bg-destructive': isLow,
              'bg-foreground': !isLow,
            })}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Question counter pill */}
      {questionNumber !== undefined && (
        <div className="flex h-11 min-w-[70px] items-center justify-center rounded-full border border-border/60 bg-card/60 px-5 text-xl font-bold tabular-nums backdrop-blur-sm">
          {questionNumber}
        </div>
      )}
    </div>
  );
};
