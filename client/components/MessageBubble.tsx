'use client';

import { format } from 'date-fns';
import { Message, Attachment } from '@/lib/socket';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store';
import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { Download, ExternalLink, Reply, Smile, MoreVertical, Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  onReply?: (message: Message) => void;
  replyToMessage?: Message | null;
  userProfiles?: Record<string, { displayName: string; profileImageUrl?: string }>;
  showMessageMenu?: boolean;
}

export function MessageBubble({ message, onReply, replyToMessage, userProfiles, showMessageMenu = true }: MessageBubbleProps) {
  const { name: currentUserName, roomCode } = useUserStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const isOwn = message.name === currentUserName;
  
  // Get initials for avatar
  const initials = message.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  // Get user profile data
  const userProfile = userProfiles?.[message.name];
  const profileImage = userProfile?.profileImageUrl;
  
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

  const handleReaction = (emoji: string) => {
    const socket = getSocket();
    if (socket && roomCode && currentUserName) {
      socket.emit('add-reaction', {
        messageId: message._id,
        roomCode,
        name: currentUserName,
        emoji
      });
    }
    setShowEmojiPicker(false);
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const response = await fetch(`https://forsyth-chats.onrender.com${attachment.url}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderLinkPreviews = () => {
    if (!message.linkPreviews?.length) return null;

    return (
      <div className="mt-3 space-y-2">
        {message.linkPreviews.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'block rounded-2xl border overflow-hidden hover:scale-[1.02] transition-all duration-200',
              isOwn
                ? 'border-blue-300 bg-blue-50/20'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
            )}
          >
            {link.image && (
              <Image
                src={link.image}
                alt={link.title || 'Link preview'}
                width={400}
                height={128}
                className="w-full h-32 object-cover"
              />
            )}
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <ExternalLink className="w-3 h-3" />
                {link.domain}
              </div>
              {link.title && (
                <h4 className={cn(
                  'font-semibold text-sm mb-1',
                  isOwn ? 'text-blue-100' : 'text-slate-900 dark:text-white'
                )}>
                  {link.title}
                </h4>
              )}
              {link.description && (
                <p className={cn(
                  'text-xs line-clamp-2',
                  isOwn ? 'text-blue-200' : 'text-slate-600 dark:text-slate-300'
                )}>
                  {link.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  };

  const renderAttachments = () => {
    if (!message.attachments?.length) return null;

    return (
      <div className="mt-3 space-y-2">
        {message.attachments.map((attachment, index) => (
          <div key={index}>
            {attachment.type === 'image' ? (
              <Image
                src={`https://forsyth-chats.onrender.com${attachment.url}`}
                alt={attachment.originalName}
                width={320}
                height={256}
                className="rounded-xl max-w-sm max-h-64 object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(`https://forsyth-chats.onrender.com${attachment.url}`, '_blank')}
              />
            ) : (
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-xl border',
                isOwn
                  ? 'border-blue-300 bg-blue-50/20'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
              )}>
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold',
                  isOwn
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                )}>
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium text-sm truncate',
                    isOwn ? 'text-blue-100' : 'text-slate-900 dark:text-white'
                  )}>
                    {attachment.originalName}
                  </p>
                  <p className={cn(
                    'text-xs',
                    isOwn ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'
                  )}>
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(attachment)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isOwn
                      ? 'hover:bg-blue-400/20 text-blue-100'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400'
                  )}
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderReactions = () => {
    if (!message.reactions?.length) return null;

    return (
      <div className="flex flex-row gap-1.5 mt-2 items-center">
        {message.reactions.map((reaction, index) => {
          const hasUserReacted = currentUserName ? reaction.users.includes(currentUserName) : false;
          return (
            <button
              key={index}
              onClick={() => handleReaction(reaction.emoji)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95',
                hasUserReacted
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-2 ring-blue-300 dark:ring-blue-700 shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              )}
            >
              <span className="text-sm">{reaction.emoji}</span>
              <span className="font-semibold">{reaction.count}</span>
            </button>
          );
        })}
      </div>
    );
  };
  
  return (
    <div
      className={cn(
        'flex mb-4 group animate-fade-in',
        isOwn ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => showMessageMenu && setShowMessageActions(true)}
      onMouseLeave={() => showMessageMenu && setShowMessageActions(false)}
    >
      {/* Avatar for other users */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-3 mt-1">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={message.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-white dark:ring-slate-800 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            />
          ) : (
            <div className={`w-10 h-10 bg-gradient-to-br ${getUserColor(message.name)} rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white dark:ring-slate-800 transition-all duration-200 hover:scale-105 hover:shadow-lg`}>
              {initials}
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-col max-w-[70%] sm:max-w-xl">
        {!isOwn && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 ml-1 transition-colors duration-200">{message.name}</p>
        )}
        
        {/* Reply indicator */}
        {message.replyTo && replyToMessage && (
          <div className="ml-2 mb-2 p-3 border-l-3 border-blue-400 bg-slate-50 dark:bg-slate-800/60 rounded-r-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/80">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
              Replying to {replyToMessage.name}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {replyToMessage.message}
            </p>
          </div>
        )}
        
        <div className="relative">
          {/* Message bubble tail */}
          <div className={cn(
            "absolute top-0 w-3 h-3 transform rotate-45",
            isOwn ? "-right-1 bg-blue-500" : "-left-1 bg-white dark:bg-slate-800"
          )} />
          
          <div
            className={cn(
              'rounded-2xl px-5 py-3 shadow-lg transition-all duration-200 group-hover:shadow-xl relative backdrop-blur-sm border min-w-0',
              isOwn
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200/50 dark:shadow-blue-900/30 hover:from-blue-600 hover:to-blue-700 border-blue-400/20'
                : 'bg-white/95 dark:bg-slate-800/95 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white shadow-slate-200/50 dark:shadow-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
            )}
          >
            {message.message.trim() && (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {message.message}
              </p>
            )}
            
            {renderAttachments()}
            {renderLinkPreviews()}
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    'text-xs font-medium opacity-70 transition-opacity duration-200',
                    isOwn ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {format(new Date(message.timestamp), 'h:mm a')}
                </p>
                {message.edited && (
                  <span className={cn(
                    'text-xs opacity-60',
                    isOwn ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  )}>
                    edited
                  </span>
                )}
                {isOwn && (
                  <div className="flex items-center gap-1">
                    {message.read ? (
                      <CheckCheck className="w-3 h-3 text-blue-200" />
                    ) : (
                      <Check className="w-3 h-3 text-blue-200/70" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              {showMessageMenu && (
                <div className={cn(
                  'flex items-center gap-1 transition-all duration-200',
                  showMessageActions ? 'opacity-100' : 'opacity-0'
                )}>
                  <button
                    onClick={() => onReply?.(message)}
                    className={cn(
                      'p-1.5 rounded-lg transition-all duration-200 text-xs hover:scale-110',
                      isOwn
                        ? 'hover:bg-blue-400/25 text-blue-100 hover:text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={cn(
                        'p-1.5 rounded-lg transition-all duration-200 text-xs hover:scale-110',
                        isOwn
                          ? 'hover:bg-blue-400/25 text-blue-100 hover:text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      )}
                      title="Add reaction"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Enhanced emoji picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-8 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border dark:border-slate-700 rounded-xl shadow-xl p-2 grid grid-cols-6 gap-1 z-20 animate-scale-in">
                        {['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '🙌', '💯', '🚀'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-lg transition-all duration-200 hover:scale-110"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className={cn(
                      'p-1.5 rounded-lg transition-all duration-200 text-xs hover:scale-110',
                      isOwn
                        ? 'hover:bg-blue-400/25 text-blue-100 hover:text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                    title="More options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {renderReactions()}
        </div>
      </div>
      
      {/* Avatar for own messages */}
      {isOwn && (
        <div className="flex-shrink-0 ml-3 mt-1">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={message.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-white dark:ring-slate-800 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white dark:ring-slate-800 transition-all duration-200 hover:scale-105 hover:shadow-lg">
              {initials}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
