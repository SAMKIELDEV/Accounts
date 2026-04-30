'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const verifyEmail = useCallback(async () => {
    if (!token) {
      setStatus('error');
      return;
    }

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
    verifyEmail();
  }, [verifyEmail]);

  const handleResend = async () => {
    toast.info('Please sign in to resend the verification link.');
    // In a real app, you might have a dedicated resend endpoint that takes an email
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
                <Button fullWidth onClick={handleResend} variant="ghost">
                  Resend Verification
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
        </Card>
      </div>
    </div>
  );
}
