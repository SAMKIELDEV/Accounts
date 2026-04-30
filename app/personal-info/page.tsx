'use client';

import React, { useState } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function PersonalInfoPage() {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setIsLoading(true);
    console.log('--- Process: Update Email ---');
    console.log('Target URL:', `${process.env.NEXT_PUBLIC_AUTH_URL}/user/email`);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/email`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('samkiel_at')}` // Assuming SDK stores it here or handles it
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (response.ok) {
        console.log('Email update request successful');
        toast.success('Verification email sent to your new address.');
        setNewEmail('');
      } else {
        const data = await response.json();
        console.error('Email update failed:', data);
        toast.error(data.message || 'Failed to update email.');
      }
    } catch (error) {
      console.error('Process error:', error);
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
                value={user?.name || ''}
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
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  disabled={!newEmail}
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
