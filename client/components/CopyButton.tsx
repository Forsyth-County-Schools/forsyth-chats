'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Room code copied to clipboard',
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="gap-2 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600"
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--border)',
        color: 'var(--foreground-secondary)'
      }}
      aria-label={label}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
