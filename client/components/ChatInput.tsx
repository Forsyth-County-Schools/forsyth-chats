'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X, Reply, AlertTriangle, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Message, Attachment } from '@/lib/socket';
import { validateContentRealtime } from '@/lib/contentFilter';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Attachment[], replyTo?: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  roomCode?: string;
}

export function ChatInput({ 
  onSendMessage, 
  onTyping, 
  onStopTyping, 
  disabled = false,
  replyingTo,
  onCancelReply,
  roomCode
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [contentWarning, setContentWarning] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Auto-focus on mount
    textareaRef.current?.focus();
  }, []);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    
    // You'll need to get the room code from somewhere (props or store)
    formData.append('roomCode', roomCode || 'DEFAULT_ROOM'); // Replace with actual room code
    
    try {
      const response = await fetch('https://forsyth-chats.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        setAttachments(prev => [...prev, ...result.attachments]);
      } else {
        console.error('Upload failed:', result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if ((trimmedMessage || attachments.length > 0) && !disabled && !uploading) {
      // Validate content before sending
      const validation = validateContentRealtime(trimmedMessage);
      
      if (!validation.isValid) {
        setContentWarning(validation.warning || 'Message contains inappropriate content');
        return;
      }
      
      onSendMessage(trimmedMessage, attachments, replyingTo?._id);
      setMessage('');
      setAttachments([]);
      setContentWarning(null);
      
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
    
    // Real-time content validation
    if (newMessage.trim()) {
      const validation = validateContentRealtime(newMessage.trim());
      if (!validation.isValid) {
        setContentWarning(validation.warning || 'Message contains inappropriate content');
      } else if (validation.warning) {
        setContentWarning(validation.warning);
      } else {
        setContentWarning(null);
      }
    } else {
      setContentWarning(null);
    }
    
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
    <div className="space-y-3">
      {/* Content Warning */}
      {contentWarning && (
        <div className="flex items-center gap-3 p-3 bg-amber-50/90 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl transition-all duration-200 backdrop-blur-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-pulse" />
          <p className="text-sm text-amber-800 dark:text-amber-200">{contentWarning}</p>
          <button
            onClick={() => setContentWarning(null)}
            className="ml-auto text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 rounded-r-2xl transition-all duration-200 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30">
          <Reply className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-semibold">
              Replying to {replyingTo.name}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 truncate">
              {replyingTo.message}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="p-1 h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 transition-all duration-200 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 rounded-2xl transition-all duration-200 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-800/80 dark:hover:to-slate-900/80 border border-slate-200/50 dark:border-slate-700/50">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.type === 'image' ? (
                <div className="relative">
                  <img
                    src={`https://forsyth-chats.onrender.com${attachment.url}`}
                    alt={attachment.originalName}
                    className="w-16 h-16 object-cover rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="relative flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-700/90 border dark:border-slate-600 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-lg flex items-center justify-center text-xs font-bold">
                    📄
                  </div>
                  <span className="text-xs font-medium truncate max-w-20">
                    {attachment.originalName}
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="w-4 h-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-3">
        <div className="flex-1 relative group">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Connection lost...' : 'Type your message...'}
            disabled={disabled || uploading}
            className={cn(
              'min-h-[52px] max-h-[120px] resize-none rounded-2xl border-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm transition-all duration-200 focus:ring-4 pr-24 py-4 px-5 text-base shadow-sm',
              disabled || uploading
                ? 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md'
            )}
          />
          
          {/* Enhanced action buttons */}
          <div className="absolute right-3 top-3 flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              className="p-2 h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 group/btn"
              title="Attach files"
            >
              <Paperclip className={cn(
                'w-4 h-4 transition-colors',
                uploading ? 'text-blue-500 animate-pulse' : 'text-slate-400 group-hover/btn:text-slate-600 dark:group-hover/btn:text-slate-300'
              )} />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 group/btn"
              disabled={disabled}
              title="Add emoji"
            >
              <Smile className="w-4 h-4 text-slate-400 group-hover/btn:text-slate-600 dark:group-hover/btn:text-slate-300" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 group/btn"
              disabled={disabled}
              title="Voice message"
            >
              <Mic className="w-4 h-4 text-slate-400 group-hover/btn:text-slate-600 dark:group-hover/btn:text-slate-300" />
            </Button>
          </div>
          
          {/* Enhanced hover effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
        </div>
        
        <Button
          type="submit"
          disabled={(!message.trim() && attachments.length === 0) || disabled || uploading}
          className={cn(
            'h-[52px] w-[52px] rounded-2xl shadow-lg transition-all duration-200 relative overflow-hidden group',
            (!message.trim() && attachments.length === 0) || disabled || uploading
              ? 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 shadow-blue-200/50 dark:shadow-blue-900/30 hover:shadow-xl transform hover:scale-105 active:scale-95'
          )}
        >
          <Send className="w-5 h-5 text-white relative z-10" />
          
          {/* Enhanced hover effect */}
          {(!disabled && !uploading && (message.trim() || attachments.length > 0)) && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          )}
        </Button>
      </form>
    </div>
  );
}
