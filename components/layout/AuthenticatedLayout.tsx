'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Sidebar />
      <TopBar />
      
      <main className="lg:ml-[260px] pt-16 lg:pt-0">
        <div className="max-w-3xl mx-auto px-6 py-10 lg:py-16">
          {children}
        </div>
      </main>
    </div>
  );
};
