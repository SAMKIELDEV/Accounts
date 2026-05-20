'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  /** Accessible label for the button. */
  label?: string;
  className?: string;
}

/** Small icon button that copies `value` to the clipboard with toast feedback. */
export function CopyButton({ value, label = 'Copy to clipboard', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted hover:text-accent hover:border-accent/30 transition-colors focus:outline-none focus:ring-1 focus:ring-accent',
        className,
      )}
    >
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
    </button>
  );
}
