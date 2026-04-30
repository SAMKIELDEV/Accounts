'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Shield, 
  Grid, 
  Trash2 
} from 'lucide-react';
import { useAuth } from '@samkiel/authsdk/react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Personal Info', href: '/personal-info', icon: User },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Products', href: '/products', icon: Grid },
  { name: 'Delete Account', href: '/delete-account', icon: Trash2, color: 'text-red-500' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col hidden lg:flex">
      <div className="p-8">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-[#E8FF47] font-syne">
          SAMKIEL
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
                  ? 'bg-[#E8FF47]/5 text-[#E8FF47] border-l-2 border-[#E8FF47] rounded-l-none' 
                  : 'text-[#888888] hover:text-white hover:bg-white/5'
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  'transition-colors',
                  isActive ? 'text-[#E8FF47]' : link.color || 'text-[#888888] group-hover:text-white'
                )} 
              />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#1F1F1F]">
        <div className="flex flex-col">
          <span className="text-xs text-[#888888] uppercase tracking-wider mb-1">Logged in as</span>
          <span className="text-sm text-white truncate font-medium">
            {user?.email || 'Loading...'}
          </span>
        </div>
      </div>
    </aside>
  );
};
