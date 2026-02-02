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
        'flex mb-6 animate-slide-up group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar for other users */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-4 mt-1">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
            {initials}
          </div>
        </div>
      )}
      
      <div className="flex flex-col max-w-[75%] sm:max-w-lg">
        {!isOwn && (
          <p className="text-sm text-gray-500 mb-2 ml-4 font-medium">{message.name}</p>
        )}
        <div
          className={cn(
            'rounded-2xl px-6 py-4 shadow-lg transition-all duration-200 group-hover:scale-[1.01] animate-fade-in',
            isOwn
              ? 'bg-red-600 text-white shadow-red-200'
              : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300'
          )}
        >
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed">
            {message.message}
          </p>
          <p
            className={cn(
              'text-xs mt-3 font-medium',
              isOwn ? 'text-red-100' : 'text-gray-500'
            )}
          >
            {format(new Date(message.timestamp), 'h:mm a')}
          </p>
        </div>
      </div>
      
      {/* Avatar for own messages */}
      {isOwn && (
        <div className="flex-shrink-0 ml-4 mt-1">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
            {initials}
          </div>
        </div>
      )}
    </div>
  );
}
