import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-2xl p-6 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
};
