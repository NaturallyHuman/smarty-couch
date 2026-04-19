import { useEffect, useRef, useState } from 'react';
import { Hourglass } from 'lucide-react';
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
    if (percentage < prevPctRef.current) {
      setAnimate(true);
    } else if (percentage > prevPctRef.current) {
      setAnimate(false);
    }
    prevPctRef.current = percentage;
  }, [percentage]);

  return (
    <div className="flex w-full items-center gap-4">
      <Hourglass
        className={cn('h-6 w-6 shrink-0', {
          'text-destructive animate-pulse': isLow,
          'text-muted-foreground': !isLow,
        })}
      />
      <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full ease-linear ml-auto', {
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
