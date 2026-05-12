import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { box: 'h-8 w-8', text: 'text-xs' },
  md: { box: 'h-12 w-12', text: 'text-base' },
  lg: { box: 'h-20 w-20', text: 'text-2xl' },
  xl: { box: 'h-28 w-28', text: 'text-3xl' },
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '?';
}

export const Avatar = ({ src, name, email, size = 'md', className }: AvatarProps) => {
  const s = sizeMap[size];
  const initials = getInitials(name, email);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full overflow-hidden bg-surface border border-border shrink-0',
        s.box,
        className
      )}
      aria-label={name || email || 'User avatar'}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || email || 'User avatar'} className="h-full w-full object-cover" />
      ) : (
        <span className={cn('font-semibold text-accent font-syne', s.text)}>{initials}</span>
      )}
    </div>
  );
};
