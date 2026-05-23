'use client';

import React, { useRef, useState, useEffect } from 'react';
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
import { formatDate } from '@/lib/datetime';
import { AUTH_URL } from '@/lib/auth';
import Link from 'next/link';

// Simple cookie helper to read sk_access_token from browser
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const localeNames: Record<string, string> = {
  'en': 'English (US)',
  'en-GB': 'English (UK)',
  'fr': 'Français (French)',
  'de': 'Deutsch (German)',
  'es': 'Español (Spanish)',
  'pt': 'Português (Portuguese)',
};

function formatJoinDate(iso?: string) {
  return iso ? formatDate(iso) : null;
}

function formatFullDate(iso?: string) {
  return iso ? formatDate(iso) : 'a later date';
}

function formatPasswordChangedAt(dateStr?: string) {
  if (!dateStr) return 'Never changed';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Never changed';
  return `Last changed ${d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;
}

export default function PersonalInfoPage() {
  const { user, isLoading: authLoading, updateFullName, updateEmail, uploadAvatar, changeUsername, refresh } = useAuth();

  // Current first/last name, falling back to splitting `name` for legacy users
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

  // New Fields States
  const [phone, setPhone] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const [birthday, setBirthday] = useState('');
  const [isSavingBirthday, setIsSavingBirthday] = useState(false);

  const [locale, setLocale] = useState('en');
  const [isSavingLocale, setIsSavingLocale] = useState(false);

  // Hydrate name fields and new fields once when user first loads
  useEffect(() => {
    if (user) {
      if (!nameHydrated.current) {
        setFname(currentFname);
        setLname(currentLname);
        nameHydrated.current = true;
      }
      setPhone(user.phone || '');
      setBirthday(user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '');
      setLocale(user.locale || 'en');
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
      await refresh();
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
      await refresh();
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
      await refresh();
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
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not upload your photo.';
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Profile PATCH trigger
  const handleUpdateProfileField = async (fields: Record<string, any>, successMsg: string, setSaving: React.Dispatch<React.SetStateAction<boolean>>) => {
    setSaving(true);
    const token = getCookie('sk_access_token');
    try {
      const response = await fetch(`${AUTH_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(fields),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile.');
      }

      toast.success(successMsg);
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Phone PATCH trigger
  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPhone(true);
    const token = getCookie('sk_access_token');
    try {
      const response = await fetch(`${AUTH_URL}/user/phone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update phone.');
      }

      toast.success('Phone number updated.');
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(msg);
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleUpdateBirthday = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateProfileField({ birthday: birthday || null }, 'Birthday updated.', setIsSavingBirthday);
  };

  const handleUpdateLocale = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateProfileField({ locale }, 'Language preference updated.', setIsSavingLocale);
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
          {/* Display Name */}
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

          {/* Email address */}
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

          {/* Phone */}
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white font-syne flex items-center gap-2">
                <span>Phone number</span>
                {user?.phone ? (
                  <Badge variant={user.phoneVerified ? 'success' : 'warning'}>
                    {user.phoneVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                ) : null}
              </h2>
              <p className="text-sm text-muted mt-0.5">Your phone number for ecosystem notifications.</p>
            </div>
            <form onSubmit={handleUpdatePhone} className="space-y-5 max-w-md">
              <Input
                label="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
                disabled={isSavingPhone}
                hint="E.164 format: +[country code][number], 8-15 digits"
              />
              <Button
                type="submit"
                isLoading={isSavingPhone}
                disabled={phone === (user?.phone || '')}
              >
                Save phone
              </Button>
            </form>
          </Card>

          {/* Birthday */}
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white font-syne">Birthday</h2>
              <p className="text-sm text-muted mt-0.5">Info about your birth date.</p>
            </div>
            <form onSubmit={handleUpdateBirthday} className="space-y-5 max-w-md">
              <Input
                label="Birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                disabled={isSavingBirthday}
              />
              <Button
                type="submit"
                isLoading={isSavingBirthday}
                disabled={birthday === (user?.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '')}
              >
                Save birthday
              </Button>
            </form>
          </Card>

          {/* Language selection */}
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white font-syne">Language preference</h2>
              <p className="text-sm text-muted mt-0.5">Your preferred language for interface and alerts.</p>
            </div>
            <form onSubmit={handleUpdateLocale} className="space-y-5 max-w-md">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-text">Preferred Language</label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  disabled={isSavingLocale}
                  className="flex h-11 w-full rounded-lg border border-border bg-surface px-4 py-2 text-base text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Object.entries(localeNames).map(([code, name]) => (
                    <option key={code} value={code} className="bg-surface text-white">{name}</option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                className="mt-2"
                isLoading={isSavingLocale}
                disabled={locale === (user?.locale || 'en')}
              >
                Save language
              </Button>
            </form>
          </Card>

          {/* Password changed metadata */}
          <Card className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white font-syne">Password security</h2>
                <p className="text-sm text-muted mt-0.5">
                  {formatPasswordChangedAt(user?.passwordChangedAt)}
                </p>
              </div>
              <Link href="/security">
                <Button variant="outline" size="sm">
                  Change password
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
