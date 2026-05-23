'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="space-y-12 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-syne">Privacy</h1>
        <p className="text-muted mt-1.5">Manage your privacy settings and permissions across SAMKIEL.</p>
      </header>

      <Card className="flex flex-col items-center py-16 text-center bg-surface/40 space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-background border border-border flex items-center justify-center text-accent shadow-lg shadow-accent/5">
          <Eye size={28} />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-semibold text-white font-syne">Privacy settings coming soon</h2>
          <p className="text-sm text-muted">
            We are working on bringing granular privacy controls and data export settings to your SAMKIEL ID hub.
          </p>
        </div>
      </Card>
    </div>
  );
}
