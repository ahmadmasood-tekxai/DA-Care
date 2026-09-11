import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'navy' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  pill?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-pink-deep text-white hover:bg-navy shadow-md shadow-pink-deep/25 focus-visible:ring-pink-deep',
  navy: 'bg-navy text-white hover:bg-pink-deep focus-visible:ring-navy',
  secondary: 'bg-white text-navy border-2 border-navy hover:bg-pink-pale focus-visible:ring-navy',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm',
  ghost: 'bg-transparent text-navy-soft hover:bg-pink-pale focus-visible:ring-pink-200',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-3.5 py-1.5 gap-1.5',
  md: 'text-sm px-5 py-2.5 gap-2',
  lg: 'text-base px-8 py-3.5 gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, fullWidth, pill = true, disabled, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center font-bold font-body transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
          'hover:-translate-y-0.5',
          pill ? 'rounded-full' : 'rounded-lg',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...rest}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
