'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@samkiel/authsdk/react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user, router]);

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
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days for refresh token
      
      document.cookie = `sk_access_token=${data.accessToken}; path=/; max-age=3600; SameSite=Lax; Secure`;
      document.cookie = `sk_refresh_token=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
      
      // Also store in localStorage if SDK expects it there
      localStorage.setItem('samkiel_at', data.accessToken);
      localStorage.setItem('samkiel_rt', data.refreshToken);

      toast.success('Welcome back!');
      window.location.href = '/';
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
            SAMKIEL
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
                  href="/forgot-password" 
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

          <div className="mt-8 pt-6 border-t border-[#1F1F1F] text-center">
            <p className="text-[#888888] text-sm">
              Don't have an account?{' '}
              <Link 
                href="/register" 
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