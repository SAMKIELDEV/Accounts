import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[#D4D4D4]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-lg border border-[#1F1F1F] bg-[#111111] px-4 py-2 text-base text-white ring-offset-[#0A0A0A] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] focus:outline-none focus:border-[#E8FF47] focus:ring-1 focus:ring-[#E8FF47] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500">
            {error}
          </span>
        )}
        {hint && !error && (
          <span className="text-xs text-[#888888]">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
