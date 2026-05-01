'use client';

import React, { useState, useEffect } from 'react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Monitor, Smartphone, Globe, LogOut, Trash2, ShieldCheck } from 'lucide-react';

interface Session {
  id: string;
  deviceInfo: string;
  createdAt: string;
  isCurrent?: boolean;
}

export default function SecurityPage() {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsSessionsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('samkiel_access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // The backend returns sessions: Session[] where each has id and deviceInfo
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('samkiel_access_token')}`
        },
        body: JSON.stringify({ 
          currentPassword: passwords.current,
          newPassword: passwords.new 
        }),
      });

      if (response.ok) {
        toast.success('Password updated.');
        setPasswords({ current: '', new: '', confirm: '' });
      } else if (response.status === 401) {
        toast.error('Current password is incorrect.');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Could not update password.');
      }
    } catch (error) {
      toast.error('An error occurred while updating your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('samkiel_access_token')}`
        }
      });

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        toast.success('Session revoked.');
      } else {
        toast.error('Failed to revoke session.');
      }
    } catch (error) {
      toast.error('An error occurred while revoking the session.');
    }
  };

  const handleSignOutOtherDevices = async () => {
    setIsRevokingAll(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/sessions`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('samkiel_access_token')}`
        }
      });

      if (response.ok) {
        await fetchSessions();
        toast.success('All other sessions signed out.');
      } else {
        toast.error('Failed to sign out other devices.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsRevokingAll(false);
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) return <Smartphone className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-10 pb-20">
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Active Sessions</h2>
            {sessions.length > 1 && (
              <Button 
                variant="ghost" 
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9"
                onClick={handleSignOutOtherDevices}
                isLoading={isRevokingAll}
              >
                Sign out all other devices
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {isSessionsLoading ? (
              [1, 2].map((i) => (
                <Card key={i} className="animate-pulse flex items-center justify-between py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1F1F1F]" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-[#1F1F1F] rounded" />
                      <div className="w-24 h-3 bg-[#1F1F1F] rounded" />
                    </div>
                  </div>
                  <div className="w-20 h-9 bg-[#1F1F1F] rounded" />
                </Card>
              ))
            ) : sessions.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
                <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center mb-4 text-[#888888]">
                  <Globe className="w-6 h-6" />
                </div>
                <p className="text-[#888888] font-medium">No active sessions found.</p>
                <p className="text-sm text-[#888888]/60 mt-1">Wait, you shouldn't be seeing this if you're logged in!</p>
              </Card>
            ) : (
              sessions.map((session) => (
                <Card key={session.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[#888888] group-hover:text-white transition-colors">
                      {getDeviceIcon(session.deviceInfo)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white line-clamp-1 max-w-[200px] sm:max-w-md">
                          {session.deviceInfo || 'Unknown Device'}
                        </span>
                        {/* Note: Backend currently doesn't flag current session, we show revoke for all for now or we could compare with cookie if possible */}
                      </div>
                      <p className="text-sm text-[#888888] flex items-center gap-2 mt-0.5">
                        <span>{formatDate(session.createdAt)}</span>
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Revoke
                  </Button>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
