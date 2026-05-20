'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@samkiel/authsdk/react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { CopyButton } from '@/components/ui/CopyButton';
import { AUTH_URL } from '@/lib/auth';
import { User, Shield, Grid, Activity, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OverviewPage() {
  const { user, isLoading } = useAuth();
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
      const response = await fetch(`${AUTH_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });

      if (response.ok) {
        toast.success('Verification link sent to your inbox.');
      } else {
        toast.error('Failed to send verification link.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const summaryCards = [
    {
      title: 'Personal Info',
      description: 'Name, email, profile picture',
      href: '/personal-info',
      icon: User,
    },
    {
      title: 'Security',
      description: 'Password and active sessions',
      href: '/security',
      icon: Shield,
    },
    {
      title: 'Connected Products',
      description: 'Apps signed in with SAMKIEL ID',
      href: '/products',
      icon: Grid,
    },
    {
      title: 'Recent Activity',
      description: 'Recent sign-ins and changes',
      href: '/security',
      icon: Activity,
      comingSoon: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-12">
        <header className="flex items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-4 w-56" />
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="space-y-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <header className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-6">
        <Avatar src={user?.avatar} name={user?.name} email={user?.email} size="xl" />
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-syne">
            {greeting}, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}.
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
            <span className="text-muted font-medium truncate">{user?.email}</span>
            <Badge variant={user?.emailVerified ? 'success' : 'warning'}>
              {user?.emailVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Verification banner */}
      {!user?.emailVerified && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-yellow-500">
            <AlertCircle size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">Verify your email</p>
              <p className="text-sm text-muted mt-0.5">
                We sent a link to <span className="text-white">{user?.email}</span>. Check your inbox to unlock all features.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 self-start sm:self-auto shrink-0"
            onClick={handleResendVerification}
            isLoading={isResending}
          >
            Resend link
          </Button>
        </div>
      )}

      {/* SAMKIEL ID */}
      <section>
        <Card className="bg-surface/70">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted font-medium">Your SAMKIEL ID</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-accent tracking-wider">
                  {user?.samkielId ?? '—'}
                </span>
                {user?.samkielId && <CopyButton value={user.samkielId} label="Copy SAMKIEL ID" />}
              </div>
              <p className="text-sm text-muted">This is your permanent identifier. It never changes.</p>
              {user?.username && <p className="text-sm text-white font-medium">@{user.username}</p>}
            </div>
          </div>
        </Card>
      </section>

      {/* Summary grid */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white font-syne">Your account</h2>
          <p className="text-sm text-muted">Manage how SAMKIEL ID represents you across our products.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const isComingSoon = card.comingSoon;
            const inner = (
              <Card className="h-full hover:border-accent/40 hover:bg-surface/70 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-background border border-border flex items-center justify-center text-muted group-hover:text-accent group-hover:border-accent/30 transition-colors">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{card.title}</h3>
                        {isComingSoon && (
                          <span className="text-[10px] uppercase tracking-wider text-muted border border-border rounded px-1.5 py-0.5">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted">{card.description}</p>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-border group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                    aria-hidden="true"
                  />
                </div>
              </Card>
            );

            return isComingSoon ? (
              <div key={card.title} aria-disabled="true" className="opacity-70 cursor-not-allowed">
                {inner}
              </div>
            ) : (
              <Link key={card.href} href={card.href} className="block">
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Danger section */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white font-syne">More options</h2>
        </div>
        <Link href="/delete-account" className="block">
          <Card className="hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center text-red-500 group-hover:border-red-500/30 transition-colors">
                  <Trash2 size={18} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Delete account</h3>
                  <p className="text-sm text-muted">Permanently remove your SAMKIEL ID and all data.</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-border group-hover:text-red-500 transition-colors" aria-hidden="true" />
            </div>
          </Card>
        </Link>
      </section>
    </div>
  );
}
