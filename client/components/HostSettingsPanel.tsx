'use client';

import { useState } from 'react';
import { Settings, Users, UserX, Crown, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore, useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface HostSettingsPanelProps {
  className?: string;
  roomCode: string;
}

export function HostSettingsPanel({ className, roomCode }: HostSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { participants, socket, isHost } = useChatStore();
  const { name: currentUserName } = useUserStore();

  const handleKickUser = async (targetUserName: string) => {
    if (!socket || !currentUserName) return;

    try {
      socket.emit('kick-user', {
        roomCode,
        hostName: currentUserName,
        targetUserName,
      });
    } catch (error) {
      console.error('Error kicking user:', error);
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
      'from-indigo-500 to-indigo-800'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!isHost) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn("text-gray-400 hover:text-white hover:bg-gray-800", className)}
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/80 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Content */}
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-white">Host Settings</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Manage participants in your chat room
            </p>

            <div className="space-y-4">
              {/* Room Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-white">You are the host</span>
                </div>
                <p className="text-xs text-gray-400">
                  As the host, you can remove participants from this room.
                </p>
              </div>

              {/* Participants List */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Users className="w-4 h-4" />
                  Participants ({participants.length})
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {participants.map((participant) => {
                    const isCurrentUser = participant === currentUserName;
                    
                    return (
                      <div
                        key={participant}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                          "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50",
                          isCurrentUser && "bg-blue-900/20 border-blue-700/50"
                        )}
                      >
                        {/* Avatar */}
                        <div className="relative">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold",
                            isCurrentUser
                              ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                              : `bg-gradient-to-br ${getUserColor(participant)}`
                          )}>
                            {getInitials(participant)}
                          </div>
                          
                          {isCurrentUser && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Crown className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white truncate">
                              {participant}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="text-xs text-yellow-400 font-medium bg-yellow-500/10 px-2 py-0.5 rounded-full">
                                Host
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {!isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to kick ${participant} from the room?`)) {
                                handleKickUser(participant);
                              }
                            }}
                            className="p-1.5 h-8 w-8 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}

                  {participants.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No participants in room</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-400">
                    <p className="font-medium mb-1">Host Responsibilities:</p>
                    <ul className="space-y-0.5 text-gray-400">
                      <li>• Only kick users who violate chat rules</li>
                      <li>• Kicked users cannot rejoin the room</li>
                      <li>• Use this feature responsibly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
