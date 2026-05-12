import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="lg:ml-[260px] pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 lg:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
