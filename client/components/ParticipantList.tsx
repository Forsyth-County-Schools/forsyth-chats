'use client';

import { Users } from 'lucide-react';

interface ParticipantListProps {
  participants: string[];
  currentUserName: string;
}

export function ParticipantList({ participants, currentUserName }: ParticipantListProps) {
  return (
    <div className="h-full transition-colors duration-300" style={{backgroundColor: 'var(--card-background)'}}>
      <div className="p-6 border-b transition-colors duration-300" style={{borderColor: 'var(--border)'}}>
        <div className="flex items-center gap-3">
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl">
            <Users className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold transition-colors duration-300" style={{color: 'var(--foreground)'}}>Participants</h2>
            <p className="text-sm transition-colors duration-300" style={{color: 'var(--foreground-secondary)'}}>{participants.length} online</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">{participants.map((name, index) => {
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const isCurrentUser = name === currentUserName;
            
            return (
              <div
                key={`${name}-${index}`}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
              >
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                  isCurrentUser 
                    ? 'bg-gray-700' 
                    : 'bg-red-600'
                }`}>
                  {initials}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                </div>
                <div className="flex-1">
                  <span className="text-base font-semibold transition-colors duration-300" style={{color: 'var(--foreground)'}}>
                    {name}
                    {isCurrentUser && (
                      <span className="text-sm text-red-600 ml-2 font-medium">(You)</span>
                    )}
                  </span>
                  <p className="text-sm text-green-600 font-medium">Online</p>
                </div>
              </div>
            );
          })}
          {participants.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border transition-colors duration-300" style={{borderColor: 'var(--border)'}}>
                <Users className="h-16 w-16 mx-auto mb-4 transition-colors duration-300" style={{color: 'var(--foreground-secondary)'}} />
                <p className="text-lg font-semibold mb-2 transition-colors duration-300" style={{color: 'var(--foreground)'}}>No participants yet</p>
                <p className="text-sm transition-colors duration-300" style={{color: 'var(--foreground-secondary)'}}>Waiting for others to join...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
