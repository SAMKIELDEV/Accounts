'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, User, Shield, Grid, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Personal Info', href: '/personal-info', icon: User },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Products', href: '/products', icon: Grid },
  { name: 'Delete Account', href: '/delete-account', icon: Trash2, color: 'text-red-500' },
];

export const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] border-b border-[#1F1F1F] z-50 px-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tighter text-[#E8FF47] font-syne">
        SAMKIEL
      </Link>

      <button 
        onClick={toggleMenu}
        className="p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Slide-down overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 bg-[#0A0A0A] z-40 animate-in slide-in-from-top duration-300">
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
                    isActive 
                      ? 'bg-[#E8FF47] text-black' 
                      : 'text-[#D4D4D4] hover:bg-white/5'
                  )}
                >
                  <Icon size={22} className={isActive ? 'text-black' : link.color || 'text-[#888888]'} />
                  <span className="text-lg font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
