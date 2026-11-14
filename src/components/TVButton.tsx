import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TVButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'view';
  size?: 'default' | 'large';
}

export const TVButton = forwardRef<HTMLButtonElement, TVButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'tv-control rounded-lg font-semibold transition-colors duration-200 focus:outline-none',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95': variant === 'secondary',
            'bg-transparent text-foreground hover:bg-secondary/50 active:scale-95': variant === 'ghost',
            'view-control bg-transparent text-muted-foreground hover:text-foreground': variant === 'view',
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
