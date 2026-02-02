'use client';

import { useState } from 'react';
import { Plus, Hash, Search, Users, Crown, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Room {
  id: string;
  name: string;
  code: string;
  participantCount: number;
  isPrivate?: boolean;
  isAdmin?: boolean;
  lastMessage?: {
    content: string;
    timestamp: Date;
    sender: string;
  };
  unreadCount?: number;
}

interface RoomSidebarProps {
  currentRoomCode: string;
  onRoomSelect: (roomCode: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function RoomSidebar({ 
  currentRoomCode, 
  onRoomSelect, 
  onCreateRoom, 
  onJoinRoom,
  isOpen,
  onToggle
}: RoomSidebarProps) {
  const { name: currentUserName } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock data - replace with actual room data from your backend
  const mockRooms: Room[] = [
    {
      id: '1',
      name: 'Math Study Group',
      code: 'V9ZRPMV391',
      participantCount: 12,
      isAdmin: true,
      lastMessage: {
        content: 'Can someone help with calculus?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        sender: 'Alice'
      },
      unreadCount: 3
    },
    {
      id: '2',
      name: 'Physics Lab',
      code: 'ABC123DEF4',
      participantCount: 8,
      isPrivate: true,
      lastMessage: {
        content: 'Lab report due tomorrow',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        sender: 'Bob'
      }
    },
    {
      id: '3',
      name: 'English Literature',
      code: 'XYZ789GHI5',
      participantCount: 15,
      lastMessage: {
        content: 'Great discussion today!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        sender: 'Carol'
      }
    }
  ];

  const filteredRooms = mockRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out",
        "flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Rooms</h2>
                <p className="text-xs text-slate-400">Student Chat</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="md:hidden text-slate-400 hover:text-white"
            >
              ×
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onCreateRoom}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
            <Button
              onClick={onJoinRoom}
              variant="outline"
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              size="sm"
            >
              <Hash className="w-4 h-4 mr-2" />
              Join
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredRooms.map((room) => {
            const isActive = room.code === currentRoomCode;
            
            return (
              <button
                key={room.id}
                onClick={() => {
                  onRoomSelect(room.code);
                  onToggle();
                }}
                className={cn(
                  "w-full p-3 rounded-xl transition-all duration-200 text-left group",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30"
                    : "bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isActive
                        ? "bg-gradient-to-br from-blue-500 to-purple-600"
                        : "bg-gradient-to-br from-slate-700 to-slate-800"
                    )}>
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    {room.isPrivate && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {room.isAdmin && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn(
                        "font-semibold truncate",
                        isActive ? "text-white" : "text-slate-200"
                      )}>
                        {room.name}
                      </h3>
                      {room.code === currentRoomCode && (
                        <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Users className="w-3 h-3" />
                      <span>{room.participantCount} members</span>
                      <span>•</span>
                      <span className="font-mono">{room.code}</span>
                    </div>

                    {room.lastMessage && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-400 truncate flex-1">
                          <span className="font-medium text-slate-300">{room.lastMessage.sender}:</span> {room.lastMessage.content}
                        </p>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {formatTime(room.lastMessage.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>

                  {room.unreadCount && room.unreadCount > 0 && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {room.unreadCount > 9 ? '9+' : room.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filteredRooms.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-white font-semibold mb-2">No rooms found</h3>
              <p className="text-slate-400 text-sm">
                {searchQuery ? 'Try a different search term' : 'Create your first room to get started'}
              </p>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentUserName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{currentUserName}</p>
              <p className="text-slate-400 text-xs">Online</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
