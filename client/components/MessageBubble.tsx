'use client';

import { format } from 'date-fns';
import { Message } from '@/lib/socket';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Get initials for avatar
  const initials = message.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div
      className={cn(
        'flex mb-4 animate-slide-up group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar for other users */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 opacity-80 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
            {initials}
          </div>
        </div>
      )}
      
      <div className="flex flex-col max-w-[70%] sm:max-w-md">
        {!isOwn && (
          <p className="text-xs text-slate-500 mb-1 ml-3">{message.name}</p>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 group-hover:scale-[1.02] animate-fade-in',
            isOwn
              ? 'bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-teal-500/20'
              : 'bg-slate-900 text-slate-300 border border-slate-700/50 hover:border-slate-600/70'
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.message}
          </p>
          <p
            className={cn(
              'text-xs mt-2 opacity-60',
              isOwn ? 'text-teal-200' : 'text-slate-500'
            )}
          >
            {format(new Date(message.timestamp), 'h:mm a')}
          </p>
        </div>
      </div>
      
      {/* Avatar for own messages */}
      {isOwn && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-700 to-cyan-700 opacity-90 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
            {initials}
          </div>
        </div>
      )}
    </div>
  );
}
