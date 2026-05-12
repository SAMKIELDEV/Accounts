'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type VerifyStatus = 'loading' | 'success' | 'error' | 'needs-verification' | 'invalid';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState<VerifyStatus>(() => {
    if (token) return 'loading';
    if (email) return 'needs-verification';
    return 'invalid';
  });
  const [isResending, setIsResending] = useState(false);

  const verifyEmail = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token, verifyEmail]);

  const handleResend = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Verification email sent. Check your inbox.');
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      toast.error('An error occurred while resending the verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0A]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-[#E8FF47] font-syne mb-2">
            SAMKIEL
          </h1>
        </div>

        <Card className="p-8 text-center">
          {status === 'loading' && (
            <div className="py-10 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8FF47] mx-auto"></div>
              <p className="text-white font-medium">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Email verified.</h2>
                <p className="text-[#888888]">You're all set. You can now access all features.</p>
              </div>
              <Button fullWidth asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}

          {status === 'needs-verification' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#E8FF47]/10 border border-[#E8FF47]/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-[#E8FF47]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Please verify your email.</h2>
                <p className="text-[#888888]">
                  We sent a verification link to <span className="text-white font-medium">{email}</span>. Check your inbox to continue.
                </p>
              </div>
              <div className="space-y-3">
                <Button fullWidth onClick={handleResend} isLoading={isResending}>
                  Resend Verification Email
                </Button>
                <Link 
                  href="/login" 
                  className="block text-sm text-[#888888] hover:text-white"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Verification failed.</h2>
                <p className="text-[#888888]">The link may have expired or is invalid.</p>
              </div>
              <div className="space-y-3">
                <Button fullWidth onClick={handleResend} isLoading={isResending} variant="ghost">
                  Resend Verification Email
                </Button>
                <Link 
                  href="/login" 
                  className="block text-sm text-[#888888] hover:text-white"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}

          {status === 'invalid' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Invalid link.</h2>
                <p className="text-[#888888]">The verification link is missing or malformed.</p>
              </div>
              <Button fullWidth asChild variant="ghost">
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8FF47]"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
