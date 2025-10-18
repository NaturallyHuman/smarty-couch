import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TVButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'large';
}

export const TVButton = forwardRef<HTMLButtonElement, TVButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-lg font-semibold transition-all duration-200 focus:outline-none',
          'focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.5)]',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95': variant === 'secondary',
            'bg-transparent text-foreground hover:bg-secondary/50 active:scale-95': variant === 'ghost',
            'px-8 py-4 text-2xl': size === 'large',
            'px-6 py-3 text-xl': size === 'default',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TVButton.displayName = 'TVButton';
