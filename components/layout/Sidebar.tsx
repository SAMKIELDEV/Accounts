'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@samkiel/authsdk/react';
import { cn } from '@/lib/utils';
import { navLinks } from '@/lib/nav';
import { useLogout } from '@/hooks/useLogout';
import { Avatar } from '@/components/ui/Avatar';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const handleLogout = useLogout();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-65 bg-background border-r border-border flex-col hidden lg:flex">
      <div className="p-8">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white font-syne">
          SAMKIEL <span className="text-accent">ID</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-accent/5 text-accent border-l-2 border-accent rounded-l-none'
                  : 'text-muted hover:text-white hover:bg-white/5'
              )}
            >
              <Icon
                size={20}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-accent' : link.color || 'text-muted group-hover:text-white'
                )}
              />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border space-y-4">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <>
              <div className="h-10 w-10 rounded-full bg-border animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-16 bg-border animate-pulse rounded" />
                <div className="h-4 w-32 bg-border animate-pulse rounded" />
              </div>
            </>
          ) : (
            <>
              <Avatar src={user?.avatar} name={user?.name} email={user?.email} size="md" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted uppercase tracking-wider">Signed in as</span>
                <span className="text-sm text-white truncate font-medium">
                  {user?.name || user?.email}
                </span>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all group"
        >
          <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
