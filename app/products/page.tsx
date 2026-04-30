'use client';

import React from 'react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from 'lucide-react';

const products = [
  {
    name: 'BreezrChat',
    description: 'Real-time chat platform for seamless communication.',
    url: 'https://breezrchat.samkiel.tech',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    )
  },
  {
    name: 'SKDL',
    description: 'Blazing fast content downloader for all your media needs.',
    url: 'https://skdl.samkiel.tech',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-[#E8FF47]/10 flex items-center justify-center text-[#E8FF47]">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
    )
  }
];

export default function ProductsPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Connected Products</h1>
          <p className="text-[#888888] mt-1">Access your SAMKIEL ecosystem from one place.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <Card key={product.name} className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                {product.icon}
                <h3 className="text-xl font-bold text-white">{product.name}</h3>
              </div>
              <p className="text-[#888888] text-sm mb-8 flex-1">
                {product.description}
              </p>
              <Button 
                variant="ghost" 
                fullWidth 
                className="group"
                onClick={() => window.open(product.url, '_blank')}
              >
                Open
                <ExternalLink size={16} className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Card>
          ))}
        </div>

        <div className="pt-8 border-t border-[#1F1F1F]">
          <p className="text-sm text-[#888888] text-center">
            Full session management per product coming soon.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
