'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, User, Shield, Grid, Trash2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@samkiel/authsdk/react';
import { toast } from 'sonner';

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
  const { logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      // Clear authentication cookies
      document.cookie = 'sk_access_token=; path=/; domain=.samkiel.tech; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'sk_refresh_token=; path=/; domain=.samkiel.tech; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

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
        <div className="fixed inset-0 top-16 bg-[#0A0A0A] z-40 animate-in slide-in-from-top duration-300 overflow-y-auto">
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

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-[#D4D4D4] hover:bg-white/5 transition-all"
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
