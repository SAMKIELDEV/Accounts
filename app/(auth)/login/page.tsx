'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
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
  const { user, login, signInWithProvider, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Honor both ?redirect=... (legacy) and ?callbackUrl=... (used by samkielMiddleware
  // and the proxy's root-protection branch). Prefer `redirect` for backward compat.
  const redirect = searchParams.get('redirect') ?? searchParams.get('callbackUrl');
  // One-time arrival notices: ?registered=true after sign-up, ?deleted=true after account deletion.
  const justRegistered = searchParams.get('registered') === 'true';
  const justDeleted = searchParams.get('deleted') === 'true';

  // Helper to handle redirection safely.
  //
  // Uses a hard navigation (window.location) rather than router.push: right
  // after login we mirror the auth tokens into first-party cookies, and the
  // destination is gated by the proxy middleware. A client-side router.push can
  // replay a cached *unauthenticated* RSC payload (and may not carry the
  // freshly-set cookie through the proxy), which intermittently bounced users
  // back to /login. A full navigation guarantees the cookie is sent and the
  // proxy re-evaluates auth from scratch.
  const performRedirect = useCallback((targetUrl: string | null) => {
    if (!targetUrl) {
      window.location.href = '/';
      return;
    }

    // Internal path on this accounts site — handle BEFORE URL parsing so
    // values like "/" don't get mangled into "https:///".
    if (targetUrl.startsWith('/') && !targetUrl.startsWith('//')) {
      window.location.href = targetUrl;
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
    } catch {
      // fall through to default
    }

    // Default fallback
    window.location.href = '/';
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      performRedirect(redirect);
    }
  }, [user, authLoading, redirect, performRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await login(email, password);

      // Chrome's third-party cookie phase-out can drop the cross-origin Set-Cookie
      // from id.samkiel.tech even though we're same-site. Mirror the tokens into
      // first-party cookies on this origin so the proxy middleware can read them.
      if (data.accessToken && data.refreshToken) {
        const accessMaxAge = data.expiresIn ?? 900;
        document.cookie = `sk_access_token=${data.accessToken}; path=/; domain=.samkiel.tech; max-age=${accessMaxAge}; SameSite=Lax; Secure`;
        document.cookie = `sk_refresh_token=${data.refreshToken}; path=/; domain=.samkiel.tech; max-age=604800; SameSite=Lax; Secure`;
      }

      toast.success('Welcome back!');
      performRedirect(redirect);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('EMAIL_NOT_VERIFIED')) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      const status = (error as { status?: number } | null)?.status;
      if (status === 401) {
        toast.error('Invalid credentials');
      } else {
        toast.error(message || "We couldn't sign you in. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden pt-32 pb-20">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white font-syne">
            Welcome back.
          </h2>
          <p className="text-muted">
            Sign in to your SAMKIEL account to continue.
          </p>
        </div>

        {justRegistered && (
          <div role="status" className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-sm text-green-500">
            Account created. Check your email to verify it, then sign in below.
          </div>
        )}
        {justDeleted && (
          <div role="status" className="rounded-xl border border-border bg-surface/50 p-4 text-sm text-muted">
            Your SAMKIEL ID has been permanently deleted.
          </div>
        )}

        <Card className="p-8 bg-surface/50 backdrop-blur-xl border-border shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email, Username, or SAMKIEL ID"
              type="text"
              placeholder="e.g. musa, SKL-A4X9K2, or you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="bg-background/50"
            />
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text">Password</label>
                <Link 
                  href={redirect ? `/forgot-password?redirect=${encodeURIComponent(redirect)}` : "/forgot-password"} 
                  className="text-xs text-muted hover:text-accent transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background/50"
              />
            </div>

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              className="h-12 text-base font-bold hover:brightness-110 transition-all duration-300"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-surface px-3 text-muted/70 font-medium">Or</span>
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                fullWidth
                onClick={() => signInWithProvider('google', redirect || undefined)}
                className="h-12 bg-transparent border-border text-white hover:bg-white/5 transition-all duration-300 gap-3"
              >
                <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-muted text-sm">
              New to SAMKIEL?{' '}
              <Link 
                href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"} 
                className="text-accent hover:underline font-bold transition-all"
              >
                Create an account
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div role="status" aria-label="Loading" className="animate-pulse text-accent font-syne text-xl">
          Loading...
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}