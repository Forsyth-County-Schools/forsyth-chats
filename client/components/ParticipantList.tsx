'use client';

import { Users } from 'lucide-react';
import { useUserStore } from '@/lib/store';

interface ParticipantListProps {
  participants: string[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const { name: currentUserName } = useUserStore();
  return (
    <div className="h-full transition-all duration-300" style={{backgroundColor: 'var(--card-background)'}}>
      <div className="p-5 border-b transition-colors duration-300" style={{borderColor: 'var(--border)'}}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-xl shadow-sm">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold transition-colors duration-300" style={{color: 'var(--foreground)'}}>Participants</h2>
            <p className="text-xs font-medium transition-colors duration-300" style={{color: 'var(--foreground-secondary)'}}>{participants.length} online</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto">
        <div className="space-y-2">{participants.map((name, index) => {
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const isCurrentUser = name === currentUserName;
            
            return (
              <div
                key={`${name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group hover:scale-[1.02]"
              >
                <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm transition-all duration-200 group-hover:shadow-md ${
                  isCurrentUser 
                    ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
                    : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  {initials}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 transition-all duration-200 group-hover:scale-110" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate transition-colors duration-300" style={{color: 'var(--foreground)'}}>
                      {name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
            );
          })}
          {participants.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border transition-colors duration-300" style={{borderColor: 'var(--border)'}}>
                <Users className="h-12 w-12 mx-auto mb-3 transition-colors duration-300 opacity-50" style={{color: 'var(--foreground-secondary)'}} />
                <p className="text-sm font-semibold mb-1 transition-colors duration-300" style={{color: 'var(--foreground)'}}>No participants yet</p>
                <p className="text-xs transition-colors duration-300" style={{color: 'var(--foreground-secondary)'}}>Waiting for others to join...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
