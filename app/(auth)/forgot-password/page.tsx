'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AUTH_URL } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch(`${AUTH_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      // Always show the generic success message regardless of response status.
      setSubmitted(true);
      toast.success('If an account matches, a reset link has been sent.');
    } catch (error) {
      // Even on network error, follow the same generic-message pattern.
      setSubmitted(true);
      toast.success('If an account matches, a reset link has been sent.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-accent font-syne mb-2">
            SAMKIEL
          </h1>
          <p className="text-2xl font-semibold text-white">Reset your password.</p>
          <p className="text-muted mt-2">Enter your email, username, or SAMKIEL ID and we'll send a reset link to your email.</p>
        </div>

        <Card className="p-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email, Username, or SAMKIEL ID"
                type="text"
                placeholder="e.g. musa, SKL-A4X9K2, or you@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
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
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-white text-sm">
                  If an account matches, we've sent a recovery link to its email address.
                  Please check your inbox.
                </p>
              </div>
              <Button variant="ghost" fullWidth asChild>
                <Link href="/login">Return to login</Link>
              </Button>
            </div>
          )}

          {!submitted && (
            <div className="mt-8 pt-6 border-t border-border text-center">
              <Link 
                href="/login" 
                className="text-muted hover:text-white text-sm transition-colors"
              >
                Back to login
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
