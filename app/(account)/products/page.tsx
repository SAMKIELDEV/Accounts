'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@samkiel/authsdk/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ExternalLink, Globe } from 'lucide-react';
import { ConnectedProduct } from '@samkiel/authsdk';
import { formatDate as fmtDate, formatDateTime as fmtDateTime } from '@/lib/datetime';

const productIcons: Record<string, React.ReactNode> = {
  Kiv: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

function formatDate(dateString?: string) {
  return dateString ? fmtDate(dateString) : 'Not available';
}

// Date *and* time — used for "last active", which the user reads as the exact
// moment they last used the product, not just the day.
function formatDateTime(dateString?: string) {
  return dateString ? fmtDateTime(dateString) : 'Not available';
}

export default function ProductsPage() {
  const { getConnectedProducts, disconnectProduct } = useAuth();
  const [products, setProducts] = useState<ConnectedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingSlug, setRevokingSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getConnectedProducts();
      return data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return null;
    }
  }, [getConnectedProducts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await load();
      if (!cancelled) {
        if (data) setProducts(data);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleDisconnect = async (product: ConnectedProduct) => {
    if (!product.slug) return;
    const confirmed = window.confirm(
      `Disconnect ${product.name}? It will lose access to your SAMKIEL ID until you open it again.`,
    );
    if (!confirmed) return;

    setRevokingSlug(product.slug);
    try {
      await disconnectProduct(product.slug);
      const data = await load();
      if (data) setProducts(data);
    } catch (error) {
      console.error('Failed to disconnect product:', error);
    } finally {
      setRevokingSlug(null);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-syne">Connected products</h1>
        <p className="text-muted mt-1.5">Apps you've signed into using SAMKIEL ID.</p>
      </header>

      <section className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoading ? (
            [1, 2].map((i) => (
              <Card key={i}>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </Card>
            ))
          ) : products.length === 0 ? (
            <Card className="md:col-span-2 border-dashed">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-4 text-muted">
                  <Globe className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-white font-medium">No connected products yet.</p>
                <p className="text-sm text-muted mt-1">When you sign into a SAMKIEL app with this ID, it'll show up here.</p>
              </div>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.slug ?? product.name} className="flex flex-col h-full hover:border-accent/30 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                      {productIcons[product.name] || <Globe size={22} aria-hidden="true" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                      <p className="text-xs text-muted">
                        Connected {formatDate(product.connectedAt)}
                        {product.lastActiveAt && <> &middot; last active {formatDateTime(product.lastActiveAt)}</>}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      product.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                {product.description && (
                  <p className="text-sm text-muted leading-relaxed flex-1 mb-6">{product.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    className="group"
                    onClick={() => window.open(product.url, '_blank', 'noopener,noreferrer')}
                    aria-label={`Open ${product.name}`}
                  >
                    Open {product.name}
                    <ExternalLink
                      size={16}
                      className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnect(product)}
                    disabled={!product.slug || revokingSlug === product.slug}
                    aria-label={`Disconnect ${product.name}`}
                    className="text-red-500 hover:text-red-400 hover:border-red-500/30 shrink-0"
                  >
                    {revokingSlug === product.slug ? 'Disconnecting…' : 'Disconnect'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
