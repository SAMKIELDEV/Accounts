'use client';

import React, { useState } from 'react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function SecurityPage() {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    console.log('--- Process: Update Password ---');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('samkiel_at')}`
        },
        body: JSON.stringify({ 
          currentPassword: passwords.current,
          newPassword: passwords.new 
        }),
      });

      if (response.ok) {
        console.log('Password update successful');
        toast.success('Password updated successfully.');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        const data = await response.json();
        console.error('Password update failed:', data);
        toast.error(data.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error('Process error:', error);
      toast.error('An error occurred while updating your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Security</h1>
          <p className="text-[#888888] mt-1">Manage your password and active sessions.</p>
        </header>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white">Change Password</h2>
          <Card>
            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                required
                disabled={isLoading}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                required
                disabled={isLoading}
                hint="Minimum 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                required
                disabled={isLoading}
              />
              <Button type="submit" isLoading={isLoading}>
                Update Password
              </Button>
            </form>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white">Sessions</h2>
          <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
            <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center mb-4 text-[#888888]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#888888] font-medium">Session management coming soon</p>
            <p className="text-sm text-[#888888]/60 mt-1">You will be able to see and revoke active logins here.</p>
          </Card>
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
