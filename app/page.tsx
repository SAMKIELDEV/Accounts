'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@samkiel/authsdk/react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { User, Shield, Grid, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OverviewPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good day');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      
      if (response.ok) {
        toast.success('Verification link sent to your inbox.');
      } else {
        toast.error('Failed to send verification link.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const quickActions = [
    {
      title: 'Personal Info',
      description: 'Update your name and email',
      href: '/personal-info',
      icon: User,
    },
    {
      title: 'Security',
      description: 'Change password and manage sessions',
      href: '/security',
      icon: Shield,
    },
    {
      title: 'Products',
      description: 'See your connected SAMKIEL products',
      href: '/products',
      icon: Grid,
    },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            {greeting}, {user?.name?.split(' ')[0] || 'User'}.
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[#888888] font-medium">{user?.email}</span>
            <Badge variant={user?.isVerified ? 'success' : 'warning'}>
              {user?.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </header>

        {!user?.isVerified && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-yellow-500">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">Your email is not verified. Check your inbox.</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
              onClick={handleResendVerification}
              isLoading={isResending}
            >
              Resend
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:border-[#E8FF47]/30 hover:bg-[#161616] transition-all group p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-center text-[#888888] group-hover:text-[#E8FF47] transition-colors">
                      <action.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-0.5">{action.title}</h3>
                      <p className="text-sm text-[#888888]">{action.description}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-[#1F1F1F] group-hover:text-[#E8FF47] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}