import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'navy' | 'danger' | 'ghost' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  pill?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#7a4f4f] to-[#5C3838] text-white shadow-md shadow-[#7a4f4f]/30 hover:shadow-[#7a4f4f]/50 hover:from-[#8a5f5f] hover:to-[#6C4848] focus-visible:ring-[#7a4f4f]',
  navy:
    'bg-gradient-to-r from-[#0d0a0a] to-[#1a0f0f] text-white shadow-md shadow-black/25 hover:from-[#1a0f0f] hover:to-[#0d0a0a] focus-visible:ring-[#0d0a0a]',
  gold:
    'bg-gradient-to-r from-[#C9A84C] via-[#E8C96D] to-[#C9A84C] bg-[length:200%_auto] text-[#0d0a0a] shadow-[0_4px_16px_rgba(201,168,76,0.35)] hover:shadow-[0_8px_32px_rgba(201,168,76,0.5)] focus-visible:ring-[#C9A84C] animate-[gradient_3s_linear_infinite]',
  secondary:
    'bg-white text-[#0d0a0a] border-2 border-[#0d0a0a]/15 hover:border-[#C9A84C] hover:text-[#7a4f4f] hover:bg-[#C9A84C]/5 shadow-sm focus-visible:ring-[#C9A84C]',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm',
  ghost:
    'bg-transparent text-[#3a2e2e]/70 hover:bg-pink-pale hover:text-[#7a4f4f] focus-visible:ring-pink-200',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-[11px] px-4 py-2 gap-1.5 tracking-wide',
  md: 'text-sm px-6 py-2.5 gap-2 tracking-wide',
  lg: 'text-sm px-8 py-3.5 gap-2 tracking-widest',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading, fullWidth, pill = true, disabled, className, children, ...rest },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center font-bold font-body uppercase transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100',
          'hover:-translate-y-0.5 hover:scale-[1.02]',
          pill ? 'rounded-full' : 'rounded-xl',
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
