'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@samkiel/authsdk/react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, refresh, signInWithProvider, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  // Helper to handle redirection safely
  const performRedirect = (targetUrl: string | null) => {
    if (!targetUrl) {
      router.push('/');
      return;
    }

    try {
      // Normalize URL (handle case where redirect=kiv.samkiel.tech/app)
      const normalized = targetUrl.includes('://') ? targetUrl : `https://${targetUrl}`;
      const parsed = new URL(normalized);
      
      // Check if it's a valid samkiel.tech subdomain or the root domain
      const isSamkielDomain = parsed.hostname === 'samkiel.tech' || parsed.hostname.endsWith('.samkiel.tech');
      
      if (isSamkielDomain) {
        window.location.href = normalized;
        return;
      }
      
      // Fallback for internal paths
      if (targetUrl.startsWith('/') && !targetUrl.startsWith('//')) {
        router.push(targetUrl);
        return;
      }
    } catch (e) {
      // If URL parsing fails, check if it's an internal path
      if (targetUrl.startsWith('/') && !targetUrl.startsWith('//')) {
        router.push(targetUrl);
        return;
      }
    }

    // Default fallback
    router.push('/');
  };

  useEffect(() => {
    if (user && !authLoading) {
      performRedirect(redirect);
    }
  }, [user, authLoading, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
        toast.error(data.error || 'Invalid credentials');
        return;
      }

      // Store tokens in cookies so middleware and SDK can pick them up
      document.cookie = `sk_access_token=${data.accessToken}; path=/; domain=.samkiel.tech; max-age=900; SameSite=Lax; Secure`;
      document.cookie = `sk_refresh_token=${data.refreshToken}; path=/; domain=.samkiel.tech; max-age=604800; SameSite=Lax; Secure`;

      toast.success('Welcome back!');
      
      // Fetch user data into context before redirecting
      await refresh();
      performRedirect(redirect);
    } catch (error: unknown) {
      toast.error('We couldn\'t sign you in. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0A]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-[#E8FF47] font-syne mb-2">
            SAMKIEL ID
          </h1>
          <p className="text-2xl font-semibold text-white">Welcome back.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#D4D4D4]">Password</label>
                <Link 
                  href={redirect ? `/forgot-password?redirect=${encodeURIComponent(redirect)}` : "/forgot-password"} 
                  className="text-xs text-[#888888] hover:text-[#E8FF47] transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1F1F1F]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#111111] px-2 text-[#888888]">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => signInWithProvider('google', redirect || undefined)}
                className="bg-transparent border-[#1F1F1F] text-white hover:bg-[#1F1F1F]"
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1F1F1F] text-center">
            <p className="text-[#888888] text-sm">
              Don't have an account?{' '}
              <Link 
                href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"} 
                className="text-[#E8FF47] hover:underline font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="animate-pulse text-[#E8FF47] font-syne text-xl">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}