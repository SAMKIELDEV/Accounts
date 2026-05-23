'use client';

import { AuthProvider } from "@samkiel/authsdk/react";
import { tokenStorage } from "@samkiel/authsdk";
import { Toaster } from "sonner";

// Helper to decode JWT exp and return seconds left
function getExpiresInFromToken(token: string): number {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 900;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.exp === 'number') {
      const secondsLeft = payload.exp - Math.floor(Date.now() / 1000);
      return Math.max(0, secondsLeft);
    }
    return 900;
  } catch {
    return 900;
  }
}

export function Providers({ 
  children,
  initialAccessToken,
  initialRefreshToken,
}: { 
  children: React.ReactNode;
  initialAccessToken?: string;
  initialRefreshToken?: string;
}) {
  // Sync server cookies to client localStorage synchronously during render
  if (typeof window !== 'undefined' && initialAccessToken && initialRefreshToken) {
    const expiresIn = getExpiresInFromToken(initialAccessToken);
    tokenStorage.setTokens({
      accessToken: initialAccessToken,
      refreshToken: initialRefreshToken,
      expiresIn,
    });
  }

  return (
    <AuthProvider baseUrl={process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech'}>
      {children}
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}
