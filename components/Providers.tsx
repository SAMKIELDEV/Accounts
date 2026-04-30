'use client';

import { AuthProvider } from "@samkiel/authsdk/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider baseUrl={process.env.NEXT_PUBLIC_AUTH_URL || 'https://id.samkiel.tech'}>
      {children}
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}
