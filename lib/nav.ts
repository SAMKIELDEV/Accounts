import { LayoutDashboard, User, Shield, Grid, Eye, Trash2, type LucideIcon } from 'lucide-react';

export type NavLink = {
  name: string;
  href: string;
  icon: LucideIcon;
  color?: string;
};

export const navLinks: NavLink[] = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Personal Info', href: '/personal-info', icon: User },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Products', href: '/products', icon: Grid },
  { name: 'Privacy', href: '/privacy', icon: Eye },
  { name: 'Delete Account', href: '/delete-account', icon: Trash2, color: 'text-red-500' },
];
