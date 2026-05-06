'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@samkiel/authsdk/react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function RegisterContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, user, signInWithProvider } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Adjusted to match SDK signature (name, email, password)
      await register(name, email, password);
      toast.success('Account created. Check your email to verify.');

    } catch (error: any) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('409') || errorMessage.includes('exists')) {
        toast.error('An account with this email already exists.');
      } else {
        toast.error('We couldn\'t create your account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0A] relative overflow-hidden pt-32 pb-20">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E8FF47]/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#E8FF47]/5 blur-[120px]" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white font-syne">
            Create account.
          </h2>
          <p className="text-[#888888]">
            Get your SAMKIEL ID to access all our products.
          </p>
        </div>

        <Card className="p-8 bg-[#111111]/50 backdrop-blur-xl border-[#1F1F1F] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="bg-[#0A0A0A]/50"
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-[#0A0A0A]/50"
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
              className="bg-[#0A0A0A]/50"
            />

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              className="h-12 text-base font-bold bg-[#E8FF47] text-black hover:bg-[#d4eb3a] transition-all duration-300 shadow-[0_0_20px_rgba(232,255,71,0.15)] hover:shadow-[0_0_25px_rgba(232,255,71,0.25)] mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1F1F1F]"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-[#111111] px-3 text-[#52525B] font-medium">Or</span>
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                fullWidth
                onClick={() => signInWithProvider('google', redirect || undefined)}
                className="h-12 bg-transparent border-[#1F1F1F] text-white hover:bg-white/5 transition-all duration-300 gap-3"
              >
                <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-[#1F1F1F] text-center">
            <p className="text-[#888888] text-sm">
              Already have an account?{' '}
              <Link 
                href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"} 
                className="text-[#E8FF47] hover:underline font-bold transition-all"
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
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="animate-pulse text-[#E8FF47] font-syne text-xl">Loading...</div>
      </div>
    }>
      <RegisterContent />
    </React.Suspense>
  );
}