'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Shield, 
  Grid, 
  Trash2,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@samkiel/authsdk/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navLinks = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Personal Info', href: '/personal-info', icon: User },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Products', href: '/products', icon: Grid },
  { name: 'Delete Account', href: '/delete-account', icon: Trash2, color: 'text-red-500' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col hidden lg:flex">
      <div className="p-8">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-[#E8FF47] font-syne">
          SAMKIEL ID
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

      <div className="p-6 border-t border-[#1F1F1F] space-y-4">
        <div className="flex flex-col">
          <span className="text-xs text-[#888888] uppercase tracking-wider mb-1">Logged in as</span>
          {isLoading ? (
            <div className="h-5 w-32 bg-[#1F1F1F] animate-pulse rounded mt-0.5" />
          ) : (
            <span className="text-sm text-white truncate font-medium">
              {user?.email}
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-[#888888] hover:text-white hover:bg-white/5 transition-all group"
        >
          <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
