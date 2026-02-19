import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2',
          // Variants
          variant === 'primary' && 'bg-primary text-white hover:bg-primary-dark focus:ring-primary active:scale-[0.98]',
          variant === 'secondary' && 'bg-text-primary text-white hover:bg-text-primary/90 focus:ring-text-primary active:scale-[0.98]',
          variant === 'outline' && 'border-2 border-border text-text-primary hover:bg-border/50 focus:ring-text-muted',
          variant === 'ghost' && 'text-text-secondary hover:bg-border/50 focus:ring-text-muted',
          variant === 'danger' && 'bg-error text-white hover:bg-error/90 focus:ring-error active:scale-[0.98]',
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-5 py-2.5 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          // Full width
          fullWidth && 'w-full',
          // Disabled
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
