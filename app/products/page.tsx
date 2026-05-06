'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConnectedProduct } from '@samkiel/authsdk';

const productIcons: Record<string, React.ReactNode> = {
  'Kiv': (
    <div className="w-10 h-10 rounded-lg bg-[#E8FF47]/10 flex items-center justify-center text-[#E8FF47]">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  )
};

export default function ProductsPage() {
  const { getConnectedProducts } = useAuth();
  const [products, setProducts] = useState<ConnectedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getConnectedProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [getConnectedProducts]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Connected Products</h1>
          <p className="text-[#888888] mt-1">Access your SAMKIEL ecosystem from one place.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            [1, 2].map((i) => (
              <Card key={i} className="flex flex-col h-full space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-auto pt-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </Card>
            ))
          ) : products.length === 0 ? (
            <Card className="col-span-full flex flex-col items-center justify-center py-12 text-center border-dashed">
              <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center mb-4 text-[#888888]">
                <Globe className="w-6 h-6" />
              </div>
              <p className="text-[#888888] font-medium">No connected products found.</p>
              <p className="text-sm text-[#888888]/60 mt-1">You haven't connected any apps to your account yet.</p>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.name} className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {productIcons[product.name] || (
                      <div className="w-10 h-10 rounded-lg bg-[#1F1F1F] flex items-center justify-center text-[#888888]">
                        <Globe size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">{product.name}</h3>
                      <p className="text-xs text-[#888888]">
                        Connected on {formatDate(product.connectedAt)}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {product.status}
                  </div>
                </div>
                <p className="text-[#888888] text-sm mb-8 flex-1 leading-relaxed">
                  {product.description}
                </p>
                <Button 
                  variant="ghost" 
                  fullWidth 
                  className="group"
                  onClick={() => window.open(product.url, '_blank')}
                >
                  Open Product
                  <ExternalLink size={16} className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Card>
            ))
          )}
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
