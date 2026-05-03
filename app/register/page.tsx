'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@samkiel/authsdk/react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
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
      // Adjusted to match SDK signature (email, password)
      await register(email, password);
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0A]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-[#E8FF47] font-syne mb-2">
            SAMKIEL
          </h1>
          <p className="text-2xl font-semibold text-white">Create your SAMKIEL ID.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              hint="Must be at least 8 characters"
            />

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              className="mt-2"
            >
              Create Account
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
              Already have an account?{' '}
              <Link 
                href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"} 
                className="text-[#E8FF47] hover:underline font-medium"
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