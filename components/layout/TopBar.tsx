'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navLinks } from '@/lib/nav';
import { useLogout } from '@/hooks/useLogout';

export const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const handleLogout = useLogout();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((s) => !s);

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 px-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tighter text-accent font-syne">
        SAMKIEL
      </Link>

      <button
        type="button"
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-16 bg-background z-40 animate-in slide-in-from-top duration-300 overflow-y-auto">
          <nav className="p-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-4 px-4 py-4 rounded-xl transition-all',
                    isActive ? 'bg-accent text-black' : 'text-text hover:bg-white/5'
                  )}
                >
                  <Icon size={22} className={isActive ? 'text-black' : link.color || 'text-muted'} />
                  <span className="text-lg font-medium">{link.name}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-text hover:bg-white/5 transition-all"
            >
              <LogOut size={22} className="text-red-500" />
              <span className="text-lg font-medium text-red-500">Sign Out</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
