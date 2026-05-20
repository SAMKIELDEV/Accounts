'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@samkiel/authsdk/react';

/**
 * Client-side gate for the authenticated account area. When there's no session
 * (signed out, expired, or the account was just deleted) it redirects to /login
 * and shows a loader meanwhile — so the account shell never renders for an
 * unauthenticated user. Previously, with no guard, a logged-out/deleted user saw
 * an empty "Good morning, there." dashboard with a blank SAMKIEL ID.
 */
export function AccountGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      const next = `${window.location.pathname}${window.location.search}`;
      // Hard navigation: the destination is auth-gated by the proxy, and a
      // client router.push can replay a cached, unauthenticated payload.
      window.location.href = `/login?redirect=${encodeURIComponent(next)}`;
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div role="status" aria-label="Loading" className="animate-pulse text-accent font-syne text-xl">
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
