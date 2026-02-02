'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, Shield } from 'lucide-react';
import { useUserModeration, formatMuteTimeRemaining } from '@/lib/userModeration';

interface WarningNotificationProps {
  onWarningAdded?: (warnings: number, isMuted: boolean) => void;
}

export function WarningNotification({ onWarningAdded }: WarningNotificationProps) {
  const { warnings, isMuted, muteTimeRemaining, warningsRemaining } = useUserModeration();
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    // Show notification when user gets muted
    if (isMuted) {
      setWarningMessage(`You have been muted for 24 hours due to repeated policy violations.`);
      setShowWarning(true);
      onWarningAdded?.(warnings, true);
    }
  }, [isMuted, warnings, onWarningAdded]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-up">
      <div className={cn(
        "p-4 rounded-2xl shadow-2xl border transition-all duration-300",
        isMuted 
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
          : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-xl flex-shrink-0",
            isMuted 
              ? "bg-red-100 dark:bg-red-900/30" 
              : "bg-amber-100 dark:bg-amber-900/30"
          )}>
            {isMuted ? (
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-sm mb-1",
              isMuted 
                ? "text-red-800 dark:text-red-200" 
                : "text-amber-800 dark:text-amber-200"
            )}>
              {isMuted ? 'Account Muted' : 'Content Warning'}
            </h3>
            
            <p className={cn(
              "text-sm mb-2",
              isMuted 
                ? "text-red-700 dark:text-red-300" 
                : "text-amber-700 dark:text-amber-300"
            )}>
              {warningMessage}
            </p>
            
            {isMuted && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <Clock className="h-4 w-4" />
                <span>Mute expires in: {formatMuteTimeRemaining(muteTimeRemaining)}</span>
              </div>
            )}
            
            {!isMuted && (
              <div className="text-sm text-amber-600 dark:text-amber-400">
                Warnings remaining before mute: {warningsRemaining}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowWarning(false)}
            className={cn(
              "p-1 rounded-lg transition-colors flex-shrink-0",
              isMuted 
                ? "hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400" 
                : "hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function for className merging
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
