'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Monitor, Smartphone, Globe, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface Session {
  id: string;
  deviceInfo: string;
  createdAt: string;
  isCurrent?: boolean;
}

export default function SecurityPage() {
  const { updatePassword, getSessions, revokeSession, revokeAllSessions, logout } = useAuth();
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
      const activeSessions = await getSessions();
      setSessions(activeSessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load active sessions.');
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

    if (passwords.new.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(passwords.current, passwords.new);
      toast.success('Password updated successfully.');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      const message = error.message || 'Could not update password.';
      if (message.includes('current password')) {
        toast.error('Current password is incorrect.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      
      const sessionToRevoke = sessions.find(s => s.id === sessionId);
      if (sessionToRevoke?.isCurrent) {
        toast.success('Current session revoked. Logging out...');
        await logout();
        window.location.href = '/login';
        return;
      }

      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session revoked.');
    } catch (error) {
      toast.error('An error occurred while revoking the session.');
    }
  };

  const handleSignOutOtherDevices = async () => {
    setIsRevokingAll(true);
    try {
      await revokeAllSessions();
      await fetchSessions();
      toast.success('All other sessions signed out.');
    } catch (error) {
      toast.error('An error occurred while revoking sessions.');
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
                hint="Minimum 6 characters"
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
                <Card key={i} className="flex items-center justify-between py-6 border-[#1F1F1F]">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[160px]" />
                      <Skeleton className="h-3 w-[120px]" />
                    </div>
                  </div>
                  <Skeleton className="w-[80px] h-9 rounded-lg" />
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
