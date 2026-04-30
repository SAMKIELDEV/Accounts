import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'default';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const variants = {
    success: 'text-green-500 border-green-500/20 bg-green-500/10',
    warning: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
    danger: 'text-red-500 border-red-500/20 bg-red-500/10',
    default: 'text-[#888888] border-[#1F1F1F] bg-[#111111]',
  };

  const dots = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    default: 'bg-[#888888]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium',
        variants[variant],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dots[variant])} />
      {children}
    </div>
  );
};
