'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@samkiel/authsdk/react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
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
  const { logout } = useAuth();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/account`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('samkiel_at')}`
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        await logout();
        router.push('https://samkiel.tech?deleted=true');
      } else if (response.status === 401) {
        toast.error('Your session has expired. Please sign in again.');
      } else {
        const data = await response.json();
        toast.error(data.message || 'We could not delete your account at this time. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-red-500">Delete Account</h1>
          <p className="text-[#888888] mt-1">Permanently remove your account and all associated data.</p>
        </header>

        <div className="max-w-xl">
          {step === 1 && (
            <Card className="border-red-500/20 bg-red-500/5 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">This is permanent.</h3>
                  <p className="text-sm text-[#D4D4D4] leading-relaxed">
                    Deleting your SAMKIEL account will result in the permanent loss of all data 
                    associated with your profile across all our products. All active sessions 
                    will be revoked immediately. This action cannot be undone.
                  </p>
                </div>
              </div>
              <Button 
                variant="danger" 
                fullWidth 
                onClick={() => setStep(2)}
              >
                I understand, continue
              </Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
                <p className="text-sm text-[#888888]">
                  Please type <span className="text-white font-mono font-bold">DELETE</span> to confirm you want to proceed.
                </p>
              </div>
              <Input
                placeholder="Type DELETE here"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-[2]" 
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
                <h3 className="text-lg font-bold text-white">Final Security Check</h3>
                <p className="text-sm text-[#888888]">
                  Enter your password to authorize the permanent deletion of your account.
                </p>
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
                />
                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setStep(2)} disabled={isLoading}>
                    Back
                  </Button>
                  <Button 
                    variant="danger" 
                    type="submit"
                    className="flex-[2]" 
                    isLoading={isLoading}
                  >
                    Delete My Account
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
