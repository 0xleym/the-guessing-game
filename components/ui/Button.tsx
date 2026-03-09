'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700',
  ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-300',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-xl font-semibold
          transition-all duration-200 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          active:scale-95
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
