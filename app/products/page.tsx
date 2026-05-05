'use client';

import React from 'react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from 'lucide-react';

const products = [
  {
    name: 'Kiv',
    description: 'Daily check-in & micro-journaling platform.',
    url: 'https://kiv.samkiel.tech',
    icon: (
      <div className="w-10 h-10 rounded-lg bg-[#E8FF47]/10 flex items-center justify-center text-[#E8FF47]">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
