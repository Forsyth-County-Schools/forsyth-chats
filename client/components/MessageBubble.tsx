'use client';

import { format } from 'date-fns';
import { Message } from '@/lib/socket';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex mb-4 animate-in slide-in-from-bottom-2 duration-200',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] sm:max-w-md rounded-lg px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {!isOwn && (
          <p className="font-semibold text-sm mb-1">{message.name}</p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.message}
        </p>
        <p
          className={cn(
            'text-xs mt-1',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {format(new Date(message.timestamp), 'h:mm a')}
        </p>
      </div>
    </div>
  );
}
