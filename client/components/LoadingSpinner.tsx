'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-teal-400`} />
        <div className={`${sizeClasses[size]} absolute inset-0 animate-ping text-teal-400/30`}>
          <Loader2 className={sizeClasses[size]} />
        </div>
      </div>
      {text && <p className="text-sm text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
}
