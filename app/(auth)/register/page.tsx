'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@samkiel/authsdk/react';
import { toast } from 'sonner';
import { Check, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function RegisterContent() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Live username validation/availability state.
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const { register, user, signInWithProvider, checkUsernameAvailability, suggestUsername } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  // Combined name used to seed username suggestions.
  const fullName = `${fname} ${lname}`.trim();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Validate format instantly, then debounce the availability check by 400ms.
  useEffect(() => {
    setUsernameAvailable(false);
    if (!username) {
      setUsernameError(null);
      return;
    }
    if (/[^a-z0-9_]/.test(username)) {
      setUsernameError('Letters, numbers, and underscores only.');
      return;
    }
    if (username.length < 3) {
      setUsernameError('Must be at least 3 characters.');
      return;
    }
    if (username.length > 20) {
      setUsernameError('Must be 20 characters or fewer.');
      return;
    }
    setUsernameError(null);
    setCheckingUsername(true);

    const timer = setTimeout(async () => {
      try {
        const { available, error } = await checkUsernameAvailability(username);
        setUsernameAvailable(available);
        setUsernameError(available ? null : error || 'That username is taken.');
      } catch {
        // Ignore transient network errors for the live check.
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  // Suggest a handle from the name (debounced) while the username is untouched.
  useEffect(() => {
    if (!fullName) {
      setSuggestion('');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await suggestUsername(fullName);
        setSuggestion(res.suggestion);
      } catch {
        // Suggestions are best-effort.
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [fullName, suggestUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameError || (!usernameAvailable && username.length > 0)) {
      toast.error('Please choose a valid, available username.');
      return;
    }

    setIsLoading(true);

    try {
      await register({ fname: fname.trim(), lname: lname.trim(), email, password, username });
      toast.success('Account created. Check your email to verify.');
      // Registration doesn't sign the user in, so send them to the login page
      // (with a confirmation flag) rather than leaving them stuck on this form.
      router.push(
        redirect
          ? `/login?registered=true&redirect=${encodeURIComponent(redirect)}`
          : '/login?registered=true',
      );
    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.toLowerCase().includes('username')) {
        toast.error(errorMessage);
      } else if (errorMessage.includes('409') || errorMessage.toLowerCase().includes('exists')) {
        toast.error('An account with this email already exists.');
      } else {
        toast.error("We couldn't create your account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden pt-32 pb-20">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white font-syne">
            Create account.
          </h2>
          <p className="text-muted">
            Get your SAMKIEL ID to access all our products.
          </p>
        </div>

        <Card className="p-8 bg-surface/50 backdrop-blur-xl border-border shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                placeholder="John"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="given-name"
                className="bg-background/50"
              />
              <Input
                label="Last Name"
                type="text"
                placeholder="Doe"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="family-name"
                className="bg-background/50"
              />
            </div>

            {/* Username — lowercase, @ prefix (UI only), live availability check */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium text-text">Username</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted select-none pointer-events-none">@</span>
                <input
                  type="text"
                  placeholder="e.g. musa_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  disabled={isLoading}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-invalid={usernameError ? 'true' : 'false'}
                  className={cn(
                    'flex h-11 w-full rounded-lg border border-border bg-background/50 pl-8 pr-11 py-2 text-base text-white placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
                    usernameError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                    usernameAvailable && 'border-green-500 focus:border-green-500 focus:ring-green-500',
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername ? (
                    <Loader2 size={18} className="animate-spin text-muted" aria-label="Checking" />
                  ) : usernameAvailable ? (
                    <Check size={18} className="text-green-500" aria-label="Available" />
                  ) : usernameError ? (
                    <X size={18} className="text-red-500" aria-label="Unavailable" />
                  ) : null}
                </span>
              </div>
              {usernameError ? (
                <span className="text-xs text-red-500">{usernameError}</span>
              ) : (
                <span className="text-xs text-muted">
                  3-20 characters. Letters, numbers, and underscores only.
                </span>
              )}
              {suggestion && !username && (
                <button
                  type="button"
                  onClick={() => setUsername(suggestion)}
                  className="text-xs text-accent hover:underline self-start"
                >
                  Suggestion: @{suggestion}
                </button>
              )}
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background/50"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              hint="Minimum 6 characters"
              className="bg-background/50"
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="h-12 text-base font-bold hover:brightness-110 transition-all duration-300 mt-2"
            >
              Create Account
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
              Already have an account?{' '}
              <Link
                href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
                className="text-accent hover:underline font-bold transition-all"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div role="status" aria-label="Loading" className="animate-pulse text-accent font-syne text-xl">
          Loading...
        </div>
      </div>
    }>
      <RegisterContent />
    </React.Suspense>
  );
}
