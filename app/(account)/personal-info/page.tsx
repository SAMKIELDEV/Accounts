'use client';

import React, { useRef, useState } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { SamkielAuthError, UsernameChangeCooldownError } from '@samkiel/authsdk';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { CopyButton } from '@/components/ui/CopyButton';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function formatJoinDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

function formatFullDate(iso?: string) {
  if (!iso) return 'a later date';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return 'a later date';
  }
}

export default function PersonalInfoPage() {
  const { user, isLoading: authLoading, updateFullName, updateEmail, uploadAvatar, changeUsername } = useAuth();

  // Current first/last name, falling back to splitting `name` for legacy users
  // whose fname/lname haven't been backfilled yet (they backfill on next login).
  const currentFname = user?.fname ?? (user?.name ? user.name.trim().split(/\s+/)[0] : '');
  const currentLname = user?.lname ?? (user?.name ? user.name.trim().split(/\s+/).slice(1).join(' ') : '');

  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const nameHydrated = useRef(false);
  const [isSavingName, setIsSavingName] = useState(false);

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydrate the name fields once when the user first loads; leave them alone
  // afterwards so the user can freely edit (including clearing the last name).
  React.useEffect(() => {
    if (!nameHydrated.current && user) {
      setFname(currentFname);
      setLname(currentLname);
      nameHydrated.current = true;
    }
  }, [user, currentFname, currentLname]);

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

  const trimmedFname = fname.trim();
  const trimmedLname = lname.trim();
  const nameUnchanged = trimmedFname === currentFname && trimmedLname === currentLname;

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedFname || nameUnchanged) return;

    setIsSavingName(true);
    try {
      await updateFullName(trimmedFname, trimmedLname);
      toast.success('Name updated.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not update your name.';
      toast.error(msg);
    } finally {
      setIsSavingName(false);
    }
  };

  const startEditUsername = () => {
    setUsernameInput(user?.username ?? '');
    setEditingUsername(true);
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = usernameInput.trim().toLowerCase();
    if (!trimmed || trimmed === user?.username) {
      setEditingUsername(false);
      return;
    }

    setIsSavingUsername(true);
    try {
      await changeUsername(trimmed);
      toast.success('Username updated.');
      setEditingUsername(false);
    } catch (err) {
      if (err instanceof UsernameChangeCooldownError) {
        toast.error(`You can next change your username on ${formatFullDate(err.nextChangeAt)}.`);
      } else {
        const msg = err instanceof Error ? err.message : 'Could not update your username.';
        toast.error(msg);
      }
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !currentPassword) return;

    setIsSavingEmail(true);
    try {
      await updateEmail(newEmail, currentPassword);
      toast.success('Verification email sent to your new address.');
      setNewEmail('');
      setCurrentPassword('');
    } catch (err) {
      const status = err instanceof SamkielAuthError ? err.status : undefined;
      if (status === 401) {
        toast.error('Incorrect password. Please try again.');
      } else if (status === 409) {
        toast.error('That email is already in use.');
      } else {
        const msg = err instanceof Error ? err.message : 'Could not update email.';
        toast.error(msg);
      }
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
      await uploadAvatar(file);
      toast.success('Profile picture updated.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not upload your photo.';
      toast.error(msg);
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
              <Avatar src={user?.avatar} name={user?.name} email={user?.email} size="xl" />
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
          {formatJoinDate(user?.createdAt) && (
            <div className="pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Member since</span>
                <span className="text-white">{formatJoinDate(user?.createdAt)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* RIGHT: edit forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white font-syne">Display name</h2>
              <p className="text-sm text-muted mt-0.5">How your name appears across SAMKIEL products.</p>
            </div>
            <form onSubmit={handleUpdateName} className="space-y-5 max-w-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First name"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  placeholder="Jane"
                  required
                  disabled={isSavingName}
                  autoComplete="given-name"
                />
                <Input
                  label="Last name"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  placeholder="Doe"
                  disabled={isSavingName}
                  autoComplete="family-name"
                />
              </div>
              <Button
                type="submit"
                isLoading={isSavingName}
                disabled={!trimmedFname || nameUnchanged}
              >
                Save name
              </Button>
            </form>
          </Card>

          {/* Username */}
          <Card className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white font-syne">Username</h2>
                <p className="text-sm text-muted mt-0.5">
                  Your unique handle across SAMKIEL. Changeable once every 23 days.
                </p>
              </div>
              {!editingUsername && (
                <Button variant="outline" size="sm" className="shrink-0" onClick={startEditUsername}>
                  Change Username
                </Button>
              )}
            </div>
            {editingUsername ? (
              <form onSubmit={handleChangeUsername} className="space-y-5 max-w-md">
                <Input
                  label="New username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase())}
                  placeholder="musa_dev"
                  required
                  disabled={isSavingUsername}
                  hint="3-20 characters. Letters, numbers, and underscores only."
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    isLoading={isSavingUsername}
                    disabled={!usernameInput.trim() || usernameInput.trim() === user?.username}
                  >
                    Save username
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingUsername(false)}
                    disabled={isSavingUsername}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-xl font-semibold text-white">@{user?.username ?? '—'}</p>
            )}
          </Card>

          {/* SAMKIEL ID */}
          <Card className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-white font-syne">SAMKIEL ID</h2>
              <p className="text-sm text-muted mt-0.5">Cannot be changed.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-semibold text-accent tracking-wider">
                {user?.samkielId ?? '—'}
              </span>
              {user?.samkielId && <CopyButton value={user.samkielId} label="Copy SAMKIEL ID" />}
            </div>
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
