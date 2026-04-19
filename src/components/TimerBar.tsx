import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerBarProps {
  timeRemaining: number;
  maxTime: number;
}

export const TimerBar = ({ timeRemaining, maxTime }: TimerBarProps) => {
  const percentage = (timeRemaining / maxTime) * 100;
  const isLow = timeRemaining <= 5;

  // Disable transition on first render (so the bar snaps to full instantly).
  const [animate, setAnimate] = useState(false);
  const prevPctRef = useRef(percentage);

  useEffect(() => {
    // Only animate when the bar is draining (percentage decreasing).
    // When it jumps up (e.g. new question reset), skip the animation.
    if (percentage < prevPctRef.current) {
      setAnimate(true);
    } else if (percentage > prevPctRef.current) {
      setAnimate(false);
    }
    prevPctRef.current = percentage;
  }, [percentage]);

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
          className={cn('h-full ease-linear', {
            'transition-all duration-1000': animate,
            'bg-destructive': isLow,
            'bg-primary': !isLow,
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
