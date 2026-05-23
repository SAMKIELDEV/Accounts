'use client';

import { AuthProvider } from "@samkiel/authsdk/react";
import { tokenStorage } from "@samkiel/authsdk";
import { Toaster } from "sonner";

// Helper to get payload from JWT token
function getPayloadFromToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
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
    const payload = getPayloadFromToken(initialAccessToken);
    const exp = payload?.exp;
    const expiresIn = exp ? Math.max(0, exp - Math.floor(Date.now() / 1000)) : 900;

    tokenStorage.setTokens({
      accessToken: initialAccessToken,
      refreshToken: initialRefreshToken,
      expiresIn,
    });

    if (payload?.userId) {
      tokenStorage.setUser({
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      });
    }
  }

  return (
    <AuthProvider baseUrl={process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech'}>
      {children}
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}
