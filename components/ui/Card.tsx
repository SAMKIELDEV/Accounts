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
        'bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
};
