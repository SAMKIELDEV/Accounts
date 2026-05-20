'use client';

import { useEffect } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { tokenStorage } from '@samkiel/authsdk';
import { authClient } from '@/lib/auth';

/**
 * Re-syncs the cached session user with the server once when the account
 * section mounts. The SDK's getSession() returns the user object stored at
 * login while the access token is valid, so fields that change afterward
 * (e.g. emailVerified after clicking a verification link in another tab) would
 * otherwise stay stale until the next full re-login. This fetches the canonical
 * /user/me, updates the cache, and refreshes the provider so every page reflects
 * current status. Renders nothing.
 */
export function SessionRefresher() {
  const { refresh } = useAuth();

  useEffect(() => {
    let active = true;
    authClient
      .getUser()
      .then((fresh) => {
        if (!active) return;
        tokenStorage.setUser(fresh);
        return refresh();
      })
      .catch(() => {
        // Best-effort — a transient failure just leaves the cached user in place.
      });
    return () => {
      active = false;
    };
    // Run once on mount; `refresh` identity is not stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
