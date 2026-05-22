'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import { Monitor, Smartphone, Globe, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/datetime';

interface Session {
  id: string;
  deviceInfo: string;
  ipAddress?: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

function isMobile(ua: string): boolean {
  const u = ua.toLowerCase();
  return u.includes('mobile') || u.includes('android') || u.includes('iphone') || u.includes('ipad');
}

function getDeviceIcon(deviceInfo: string) {
  return isMobile(deviceInfo)
    ? <Smartphone className="w-5 h-5" aria-hidden="true" />
    : <Monitor className="w-5 h-5" aria-hidden="true" />;
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
  if (/chrome/i.test(ua) && !/edg\//i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  return 'Browser';
}

function parseOS(ua: string): string {
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/linux/i.test(ua)) return 'Linux';
  return 'device';
}

function formatDevice(ua: string | undefined): string {
  if (!ua) return 'Unknown device';
  return `${parseBrowser(ua)} on ${parseOS(ua)}`;
}

function formatIP(ip?: string): string {
  if (!ip || ip === 'unknown' || ip === '::1' || ip === '127.0.0.1') return 'Local network';
  return ip;
}

function formatDate(dateString: string) {
  return formatDateTime(dateString);
}

export default function SecurityPage() {
  const { updatePassword, getSessions, revokeSession, revokeAllSessions, logout } = useAuth();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const fetchSessions = useCallback(async () => {
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
  }, [getSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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

    setIsSavingPassword(true);
    try {
      await updatePassword(passwords.current, passwords.new);
      toast.success('Password updated successfully.');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not update password.';
      if (message.toLowerCase().includes('current password')) {
        toast.error('Current password is incorrect.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      const sessionToRevoke = sessions.find((s) => s.id === sessionId);
      if (sessionToRevoke?.isCurrent) {
        toast.success('Current session revoked. Logging out...');
        await logout();
        window.location.href = '/login';
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success('Session revoked.');
    } catch {
      toast.error('An error occurred while revoking the session.');
    }
  };

  const handleSignOutOtherDevices = async () => {
    setIsRevokingAll(true);
    try {
      await revokeAllSessions();
      await fetchSessions();
      toast.success('All other sessions signed out.');
    } catch {
      toast.error('An error occurred while revoking sessions.');
    } finally {
      setIsRevokingAll(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-syne">Security</h1>
        <p className="text-muted mt-1.5">Manage your password and active sessions.</p>
      </header>

      {/* Password section */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white font-syne">Password</h2>
          <p className="text-sm text-muted">Use a strong password you don't reuse anywhere else.</p>
        </div>
        <Card>
          <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
            <Input
              label="Current password"
              type="password"
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              required
              disabled={isSavingPassword}
              autoComplete="current-password"
            />
            <Input
              label="New password"
              type="password"
              placeholder="••••••••"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              required
              disabled={isSavingPassword}
              hint="Minimum 6 characters"
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
              disabled={isSavingPassword}
              autoComplete="new-password"
              error={
                passwords.confirm && passwords.new !== passwords.confirm ? 'Passwords do not match' : undefined
              }
            />
            <Button type="submit" isLoading={isSavingPassword}>
              Update password
            </Button>
          </form>
        </Card>
      </section>

      {/* Sessions section */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white font-syne">Active sessions</h2>
          <p className="text-sm text-muted">Devices currently signed in to your SAMKIEL ID.</p>
        </div>

        <div className="space-y-4">
          {isSessionsLoading ? (
            [1, 2].map((i) => (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-9 rounded-lg" />
                </div>
              </Card>
            ))
          ) : sessions.length === 0 ? (
            <Card className="border-dashed">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-4 text-muted">
                  <Globe className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-muted font-medium">No active sessions found.</p>
              </div>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-muted shrink-0">
                      {getDeviceIcon(session.deviceInfo)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white truncate">
                          {formatDevice(session.deviceInfo)}
                        </span>
                        {session.isCurrent && (
                          <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-semibold border border-green-500/20">
                            This device
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted flex items-center gap-2 mt-0.5 flex-wrap">
                        <span>{formatIP(session.ipAddress)}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>Last active {formatDate(session.lastActiveAt)}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                    onClick={() => handleRevokeSession(session.id)}
                    aria-label={`Revoke session on ${formatDevice(session.deviceInfo)}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Revoke
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {sessions.length > 1 && (
          <Card className="border-red-500/20 bg-red-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">Sign out everywhere else</h3>
                <p className="text-sm text-muted mt-0.5">Revoke every session except this one. Useful if you suspect unauthorized access.</p>
              </div>
              <Button
                variant="danger"
                onClick={handleSignOutOtherDevices}
                isLoading={isRevokingAll}
                className="shrink-0"
              >
                Sign out other devices
              </Button>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
