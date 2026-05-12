'use client';

import React, { useRef, useState } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type UserWithAvatar = NonNullable<ReturnType<typeof useAuth>['user']> & { avatar?: string };

function getAccessToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith('sk_access_token='))
    ?.split('=')[1];
}

function formatJoinDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

export default function PersonalInfoPage() {
  const { user, isLoading: authLoading, refresh } = useAuth();
  const u = user as UserWithAvatar | null;

  const [name, setName] = useState(user?.name ?? '');
  const [isSavingName, setIsSavingName] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep local name in sync when user loads
  React.useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user?.name, name]);

  if (authLoading) {
    return (
      <div className="space-y-12">
        <header className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-72 rounded-2xl" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === user?.name) return;

    setIsSavingName(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update name');
      toast.success('Name updated.');
      await refresh();
    } catch {
      toast.error('Could not update your name. Please try again.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !currentPassword) return;

    setIsSavingEmail(true);
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/email`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
          toast.error(data.message || data.error || 'Could not update email.');
        }
      }
    } catch {
      toast.error('An error occurred while updating your email.');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) {
      toast.error('Please choose a PNG, JPG, WEBP or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller.');
      return;
    }

    setIsUploading(true);
    try {
      const token = getAccessToken();
      const form = new FormData();
      form.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/user/avatar`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: form,
      });

      if (!response.ok) throw new Error('Upload failed');
      toast.success('Profile picture updated.');
      await refresh();
    } catch {
      toast.error('Could not upload your photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-syne">Personal Info</h1>
        <p className="text-muted mt-1.5">Your name, email, and profile picture across SAMKIEL.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: identity summary */}
        <Card className="h-fit space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar src={u?.avatar} name={user?.name} email={user?.email} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Change profile picture"
                className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-accent text-black flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Camera size={16} aria-hidden="true" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                aria-label="Upload profile picture"
                title="Upload profile picture"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">{user?.name || 'Unnamed user'}</h2>
              <p className="text-sm text-muted truncate">{user?.email}</p>
            </div>
            <Badge variant={user?.emailVerified ? 'success' : 'warning'}>
              {user?.emailVerified ? 'Email verified' : 'Email unverified'}
            </Badge>
          </div>
          <div className="pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Role</span>
              <span className="text-white capitalize">{user?.role || 'user'}</span>
            </div>
            {formatJoinDate(user?.createdAt) && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Member since</span>
                <span className="text-white">{formatJoinDate(user?.createdAt)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT: edit forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white font-syne">Display name</h2>
              <p className="text-sm text-muted mt-0.5">How your name appears across SAMKIEL products.</p>
            </div>
            <form onSubmit={handleUpdateName} className="space-y-5 max-w-md">
              <Input
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                disabled={isSavingName}
              />
              <Button
                type="submit"
                isLoading={isSavingName}
                disabled={!name.trim() || name.trim() === user?.name}
              >
                Save name
              </Button>
            </form>
          </Card>

          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white font-syne">Email address</h2>
              <p className="text-sm text-muted mt-0.5">
                Current email: <span className="text-white">{user?.email}</span>. We'll send a verification link to your new address.
              </p>
            </div>
            <form onSubmit={handleUpdateEmail} className="space-y-5 max-w-md">
              <Input
                label="New email"
                type="email"
                placeholder="new-email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                disabled={isSavingEmail}
                autoComplete="email"
              />
              <Input
                label="Current password"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isSavingEmail}
                autoComplete="current-password"
                hint="Required to confirm it's you."
              />
              <Button
                type="submit"
                isLoading={isSavingEmail}
                disabled={!newEmail || !currentPassword}
              >
                Send verification
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
