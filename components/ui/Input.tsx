import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[#D4D4D4]">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'flex h-11 w-full rounded-lg border border-[#1F1F1F] bg-[#111111] px-4 py-2 text-base text-white ring-offset-[#0A0A0A] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] focus:outline-none focus:border-[#E8FF47] focus:ring-1 focus:ring-[#E8FF47] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              isPassword && 'pr-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#E8FF47] transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
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
