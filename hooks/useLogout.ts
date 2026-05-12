'use client';

import { useCallback } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { toast } from 'sonner';

export function useLogout() {
  const { logout } = useAuth();

  return useCallback(async () => {
    try {
      await logout();
      document.cookie = 'sk_access_token=; path=/; domain=.samkiel.tech; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'sk_refresh_token=; path=/; domain=.samkiel.tech; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, [logout]);
}
