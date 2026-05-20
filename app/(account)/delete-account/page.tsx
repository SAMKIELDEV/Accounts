'use client';

import React, { useState } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

export default function DeleteAccountPage() {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { deleteAccount } = useAuth();

  const handleDeleteAccount = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await deleteAccount(password);
      toast.success('Account deleted.');
      // The login page lives on this (account) app, not the API host.
      window.location.href = `/login?deleted=true`;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      const status = (error as { status?: number } | null)?.status;
      if (message?.includes('Invalid password') || status === 401) {
        toast.error('Incorrect password.');
      } else {
        toast.error('Something went wrong. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-red-500 font-syne">Delete account</h1>
        <p className="text-muted mt-1.5">Permanently remove your SAMKIEL ID and all associated data.</p>
      </header>

      <div className="max-w-xl">
        {step === 1 && (
          <Card className="border-red-500/20 bg-red-500/5 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500 shrink-0">
                <AlertTriangle size={24} aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">This is permanent.</h2>
                <p className="text-sm text-text leading-relaxed">
                  Deleting your SAMKIEL account will permanently remove all data associated with your profile across
                  every SAMKIEL product. All active sessions will be revoked immediately. This action cannot be undone.
                </p>
              </div>
            </div>
            <Button variant="danger" fullWidth onClick={() => setStep(2)}>
              I understand, continue
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Confirm deletion</h2>
              <p className="text-sm text-muted">
                Please type <span className="text-white font-mono font-bold">DELETE</span> to confirm you want to proceed.
              </p>
            </div>
            <Input
              aria-label="Type DELETE to confirm"
              placeholder="Type DELETE here"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setConfirmText('');
                  setStep(1);
                }}
              >
                Back
              </Button>
              <Button
                variant="danger"
                className="flex-2"
                disabled={confirmText !== 'DELETE'}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Final security check</h2>
              <p className="text-sm text-muted">Enter your password to authorize the permanent deletion of your account.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              className="space-y-6"
            >
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                autoComplete="current-password"
              />
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setPassword('');
                    setStep(2);
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button variant="danger" type="submit" className="flex-2" isLoading={isLoading}>
                  Delete my account
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
