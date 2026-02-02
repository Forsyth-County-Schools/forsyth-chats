'use client';

import { useState, useMemo } from 'react';
import React from 'react';
import { Settings, Users, UserX, Crown, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore, useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface HostSettingsPanelProps {
  className?: string;
  roomCode: string;
}

const HostSettingsPanel = React.memo(function HostSettingsPanel({ className, roomCode }: HostSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { participants, socket, isHost } = useChatStore();
  const { name: currentUserName } = useUserStore();

  // Memoize the kick handler to prevent unnecessary re-renders
  const handleKickUser = useMemo(() => async (targetUserName: string) => {
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
  }, [socket, currentUserName, roomCode]);

  // Memoize utility functions to prevent unnecessary re-renders
  const getInitials = useMemo(() => (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, []);

  const getUserColor = useMemo(() => (name: string) => {
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
  }, []);

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

      {/* Sidebar Panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-80 bg-gray-900 border-l border-gray-800 transform transition-transform duration-300 ease-in-out",
        "rounded-l-3xl shadow-2xl",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Panel Content */}
        <div className="h-full flex flex-col rounded-l-3xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 rounded-tl-3xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Host Settings</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Room Info */}
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-white">You are the host</span>
              </div>
              <p className="text-xs text-gray-400">
                As the host, you can remove participants from this room.
              </p>
            </div>

            {/* Participants List */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                Participants ({participants.length})
              </div>
              
              <div className="space-y-2">
                {participants.map((participant) => {
                  const isCurrentUser = participant === currentUserName;
                  
                  return (
                    <div
                      key={participant}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 backdrop-blur-sm",
                        "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:shadow-lg",
                        isCurrentUser && "bg-blue-900/20 border-blue-700/50 shadow-blue-500/20"
                      )}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg",
                          "ring-2 ring-gray-900 ring-offset-2 ring-offset-gray-900",
                          isCurrentUser
                            ? "bg-gradient-to-br from-yellow-500 to-orange-600 shadow-yellow-500/50"
                            : `bg-gradient-to-br ${getUserColor(participant)} shadow-lg`
                        )}>
                          {getInitials(participant)}
                        </div>
                        
                        {isCurrentUser && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <Crown className="w-2.5 h-2.5 text-white" />
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
                            <>
                              <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded-full">
                                You
                              </span>
                              <span className="text-xs text-yellow-400 font-medium bg-yellow-500/10 px-2 py-1 rounded-full">
                                Host
                              </span>
                            </>
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
                          className="p-2 h-9 w-9 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}

                {participants.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-sm">No participants in room</p>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-xs text-yellow-400">
                  <p className="font-medium mb-2 text-white">Host Responsibilities:</p>
                  <ul className="space-y-1 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Only kick users who violate chat rules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Kicked users cannot rejoin the room</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Use this feature responsibly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default HostSettingsPanel;
