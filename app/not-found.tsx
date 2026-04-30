'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0A]">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold font-syne text-transparent bg-clip-text bg-gradient-to-b from-[#E8FF47] to-[#E8FF47]/20">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Lost in space?
          </h2>
          <p className="text-[#888888] text-lg leading-relaxed">
            The page you're looking for doesn't exist or has been moved to another dimension.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild className="px-8">
            <Link href="/">
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild className="px-8">
            <Link href="https://samkiel.tech">
              Visit SAMKIEL
            </Link>
          </Button>
        </div>

        <div className="pt-12">
          <div className="w-1 h-12 bg-gradient-to-b from-[#E8FF47] to-transparent mx-auto opacity-20"></div>
        </div>
      </div>
    </div>
  );
}
