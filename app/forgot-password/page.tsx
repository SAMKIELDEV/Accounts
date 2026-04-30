'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Always show success message regardless of response status per prompt
      setSubmitted(true);
      toast.success('If this email exists, a reset link has been sent.');
    } catch (error) {
      // Even on network error, we follow the pattern of showing the standard message
      setSubmitted(true);
      toast.success('If this email exists, a reset link has been sent.');
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
          <p className="text-2xl font-semibold text-white">Reset your password.</p>
          <p className="text-[#888888] mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        <Card className="p-8">
          {!submitted ? (
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

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="p-4 bg-[#E8FF47]/5 border border-[#E8FF47]/20 rounded-lg">
                <p className="text-white text-sm">
                  We've sent a recovery link to <span className="font-medium text-[#E8FF47]">{email}</span>. 
                  Please check your inbox.
                </p>
              </div>
              <Button variant="ghost" fullWidth asChild>
                <Link href="/login">Return to login</Link>
              </Button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#1F1F1F] text-center">
            <Link 
              href="/login" 
              className="text-[#888888] hover:text-white text-sm transition-colors"
            >
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
