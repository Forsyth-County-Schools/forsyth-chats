'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  onTyping, 
  onStopTyping, 
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Auto-focus on mount
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Clear typing indicator
      if (onStopTyping) {
        onStopTyping();
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
    
    // Handle typing indicators
    if (onTyping && newMessage.trim()) {
      onTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping();
        }
      }, 2000);
    } else if (!newMessage.trim() && onStopTyping) {
      onStopTyping();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-3">
      <div className="flex-1 relative group">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Connection lost...' : 'Type your message... (Enter to send, Shift+Enter for new line)'}
          disabled={disabled}
          className={cn(
            'min-h-[52px] max-h-[120px] resize-none rounded-2xl border-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm transition-all duration-200 focus:ring-4 pr-12 py-4 px-6',
            disabled 
              ? 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500' 
              : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
          )}
        />
        
        {/* Emoji button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 p-2 h-8 w-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
          disabled={disabled}
        >
          <Smile className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
        </Button>
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        className={cn(
          'h-[52px] w-[52px] rounded-2xl shadow-lg transition-all duration-200 relative overflow-hidden group',
          !message.trim() || disabled
            ? 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-not-allowed'
            : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200 dark:shadow-blue-900/50 hover:shadow-xl transform hover:scale-105'
        )}
      >
        <Send className="w-5 h-5 text-white relative z-10" />
        
        {/* Hover effect */}
        {(!disabled && message.trim()) && (
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        )}
      </Button>
    </form>
  );
}
