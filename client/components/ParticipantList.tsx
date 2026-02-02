'use client';

import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ParticipantListProps {
  participants: string[];
  currentUserName: string;
}

export function ParticipantList({ participants, currentUserName }: ParticipantListProps) {
  return (
    <Card className="h-full bg-transparent border-0 shadow-none">
      <CardHeader className="pb-4 border-b border-slate-700/50">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-200">
          <div className="bg-teal-500/20 p-2 rounded-lg">
            <Users className="h-5 w-5 text-teal-400" />
          </div>
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {participants.map((name, index) => {
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const isCurrentUser = name === currentUserName;
            
            return (
              <div
                key={`${name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-200 group border border-transparent hover:border-slate-700/50"
              >
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                  isCurrentUser 
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-400' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-400'
                }`}>
                  {initials}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse-glow" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-200">
                    {name}
                    {isCurrentUser && (
                      <span className="text-xs text-teal-400 ml-2 font-normal">(You)</span>
                    )}
                  </span>
                  <p className="text-xs text-slate-500">Online</p>
                </div>
              </div>
            );
          })}
          {participants.length === 0 && (
            <div className="text-center py-8">
              <div className="glass-dark p-6 rounded-xl border border-slate-700/50">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No participants yet</p>
                <p className="text-xs text-slate-500 mt-1">Waiting for others to join...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
