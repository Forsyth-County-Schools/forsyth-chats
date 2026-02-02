'use client';

import { Users, Search, Plus } from 'lucide-react';
import { useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Participant {
  name: string;
  isOnline?: boolean;
  isCurrentUser?: boolean;
  role?: 'student' | 'teacher' | 'admin';
  lastSeen?: Date;
}

interface ParticipantListProps {
  participants: string[];
  className?: string;
}

export function ParticipantList({ participants, className }: ParticipantListProps) {
  const { name: currentUserName } = useUserStore();
  
  // Transform participants string array into participant objects
  const participantObjects: Participant[] = participants.map(name => ({
    name,
    isOnline: true, // Assuming all participants in the list are online
    isCurrentUser: name === currentUserName,
    role: name.includes('Teacher') ? 'teacher' : 'student' // Simple role detection
  }));

  // Sort: current user first, then online users
  const sortedParticipants = [...participantObjects].sort((a, b) => {
    if (a.isCurrentUser) return -1;
    if (b.isCurrentUser) return 1;
    return a.name.localeCompare(b.name);
  });

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'teacher':
        return (
          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
            Teacher
          </span>
        );
      case 'admin':
        return (
          <span className="text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
            Admin
          </span>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserColor = (name: string) => {
    const colors = [
      'from-red-500 to-red-600',
      'from-blue-500 to-blue-600', 
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={cn("h-full flex flex-col bg-slate-900", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Participants</h2>
              <p className="text-xs text-slate-400">
                {participants.length} {participants.length === 1 ? 'member' : 'members'} online
              </p>
            </div>
          </div>
          
          {/* Invite Button */}
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Invite
          </Button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search participants..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>
      
      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sortedParticipants.map((participant) => (
            <div
              key={participant.name}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                "hover:bg-slate-800/50 border border-transparent hover:border-slate-700",
                participant.isCurrentUser && "bg-slate-800/30 border-slate-700/50"
              )}
            >
              {/* Avatar */}
              <div className="relative">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold",
                  "shadow-sm transition-all duration-200 group-hover:shadow-md",
                  "ring-2 ring-slate-800",
                  participant.isCurrentUser
                    ? "bg-gradient-to-br from-slate-600 to-slate-700" 
                    : `bg-gradient-to-br ${getUserColor(participant.name)}`
                )}>
                  {getInitials(participant.name)}
                </div>
                
                {/* Online Indicator */}
                {participant.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900 transition-all duration-200 group-hover:scale-110" />
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white truncate">
                    {participant.name}
                  </span>
                  {participant.isCurrentUser && (
                    <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                  {getRoleBadge(participant.role)}
                </div>
                
                <div className="flex items-center gap-2">
                  <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
          
          {participants.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-white font-semibold mb-2">No participants yet</h3>
              <p className="text-slate-400 text-sm">Waiting for others to join...</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-center">
          <p className="text-xs text-slate-500">
            {participants.length} {participants.length === 1 ? 'person' : 'people'} in this room
          </p>
        </div>
      </div>
    </div>
  );
}
