'use client';

import { format } from 'date-fns';
import { Message } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { name: currentUserName } = useUserStore();
  const isOwn = message.name === currentUserName;
  
  // Get initials for avatar
  const initials = message.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  // Generate a consistent color for each user based on their name
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
    <div
      className={cn(
        'flex mb-6 group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar for other users */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-4 mt-1">
          <div className={`w-12 h-12 bg-gradient-to-br ${getUserColor(message.name)} rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white dark:ring-slate-800`}>
            {initials}
          </div>
        </div>
      )}
      
      <div className="flex flex-col max-w-[75%] sm:max-w-lg">
        {!isOwn && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 ml-4 font-semibold">{message.name}</p>
        )}
        <div
          className={cn(
            'rounded-3xl px-6 py-4 shadow-lg transition-all duration-200 group-hover:shadow-xl relative',
            isOwn
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/50'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-slate-200 dark:shadow-slate-900/50'
          )}
        >
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed">
            {message.message}
          </p>
          <p
            className={cn(
              'text-xs mt-3 font-medium',
              isOwn ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {format(new Date(message.timestamp), 'h:mm a')}
          </p>
        </div>
      </div>
      
      {/* Avatar for own messages */}
      {isOwn && (
        <div className="flex-shrink-0 ml-4 mt-1">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white dark:ring-slate-800">
            {initials}
          </div>
        </div>
      )}
    </div>
  );
}
