'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    
    // Typing indicator logic
    if (onTyping && e.target.value.trim()) {
      onTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping();
        }
      }, 2000);
    } else if (onStopTyping && !e.target.value.trim()) {
      onStopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="flex gap-4 items-end max-w-4xl mx-auto">
        <div className="flex-1 bg-white border-2 border-gray-300 focus-within:border-red-600 focus-within:ring-4 focus-within:ring-red-100 transition-all duration-200 rounded-2xl">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            disabled={disabled}
            className="min-h-[60px] max-h-[150px] resize-none bg-transparent border-0 text-gray-900 placeholder:text-gray-500 focus:ring-0 focus:outline-none text-lg p-4"
            rows={1}
            aria-label="Message input"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-[60px] w-[60px] shrink-0 bg-red-600 hover:bg-red-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:hover:scale-100 disabled:opacity-30 rounded-2xl"
          aria-label="Send message"
        >
          <Send className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
