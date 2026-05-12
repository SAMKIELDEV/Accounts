'use client';

import React, { useState } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/Skeleton';

export default function PersonalInfoPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (authLoading) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-10">
          <header className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[350px]" />
          </header>

          <section className="space-y-6">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
            </Card>
            
            <div className="space-y-4 pt-4">
              <Skeleton className="h-6 w-[150px]" />
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                  <Skeleton className="h-11 w-[180px]" />
                </div>
              </Card>
            </div>
          </section>
        </div>
      </AuthenticatedLayout>
    );
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !currentPassword) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/email`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('samkiel_access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ newEmail, currentPassword }),
      });

      if (response.ok) {
        toast.success('Verification email sent to your new address.');
        setNewEmail('');
        setCurrentPassword('');
      } else {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          toast.error('Incorrect password. Please try again.');
        } else {
          toast.error(data.message || data.error || 'An error occurred while updating your email.');
        }
      }
    } catch (error) {
      toast.error('An error occurred while updating your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Personal Info</h1>
          <p className="text-[#888888] mt-1">Manage your account identity and contact details.</p>
        </header>

        <section className="space-y-6">
          <Card className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                value={user?.email?.split('@')[0] || ''}
                readOnly
                className="opacity-70 cursor-not-allowed"
                hint="Contact support to change your name"
              />
              <Input
                label="Current Email"
                value={user?.email || ''}
                readOnly
                className="opacity-70 cursor-not-allowed"
              />
            </div>
          </Card>

          <div className="pt-4">
            <h2 className="text-xl font-bold mb-4 text-white">Change Email</h2>
            <Card>
              <form onSubmit={handleUpdateEmail} className="space-y-6">
                <Input
                  label="New Email Address"
                  type="email"
                  placeholder="new-email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  hint="You will need to verify the new email address."
                />
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  hint="Required to confirm it's you."
                />
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={!newEmail || !currentPassword}
                >
                  Send Verification
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
