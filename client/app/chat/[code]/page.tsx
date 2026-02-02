'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users, Wifi, WifiOff, MessageSquare, Search, Settings, Hash } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { TypingIndicator } from '@/components/TypingIndicator';
import { CopyButton } from '@/components/CopyButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WarningNotification } from '@/components/WarningNotification';
import { useUserModeration } from '@/lib/userModeration';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useUserStore, useChatStore } from '@/lib/store';
import { getSocket, disconnectSocket, Message, Attachment, Reaction } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { sanitizeMessage } from '@/lib/security';
import { cn } from '@/lib/utils';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isMuted } = useUserModeration();
  
  const roomCode = (params.code as string)?.toUpperCase();
  const { name, loadUser } = useUserStore();
  const {
    messages,
    participants,
    typingUsers,
    isConnected,
    setMessages,
    addMessage,
    updateMessage,
    setParticipants,
    setTypingUser,
    setTypingUsers,
    setConnected,
    reset,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Create a lookup map for messages (for replies)
  const messagesMap = messages.reduce((acc, msg) => {
    acc[msg._id] = msg;
    return acc;
  }, {} as Record<string, Message>);
  
  // No rate limiting - unlimited messaging

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user should see jump to bottom button
  const checkScrollPosition = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowJumpToBottom(!isAtBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectToSocket = (userName: string) => {
    const socket = getSocket();
    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      
      // Join room
      socket.emit('join-room', {
        code: roomCode,
        name: userName,
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to server. Retrying...',
        variant: 'destructive',
      });
    });

    // Chat events
    socket.on('chat-history', (history: Message[]) => {
      setMessages(history);
    });

    socket.on('new-message', (message: Message) => {
      addMessage(message);
    });

    socket.on('reaction-updated', ({ messageId, reactions }: { messageId: string; reactions: Reaction[] }) => {
      // Update the specific message with new reactions
      updateMessage(messageId, { reactions });
    });

    socket.on('participants-update', (newParticipants: string[]) => {
      setParticipants(newParticipants);
    });

    socket.on('user-joined', ({ name: joinedName }: { name: string }) => {
      if (joinedName !== userName) {
        toast({
          title: 'User Joined',
          description: `${joinedName} joined the room`,
        });
      }
    });

    socket.on('user-left', ({ name: leftName }: { name: string }) => {
      toast({
        title: 'User Left',
        description: `${leftName} left the room`,
      });
    });

    socket.on('typing-users', (users: string[]) => {
      setTypingUsers(new Set(users));
    });

    socket.on('error', ({ message }: { message: string }) => {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    });
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  // Initialize and validate
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load user from localStorage
        loadUser();

        // Validate room code
        if (!roomCode || roomCode.length !== 10) {
          toast({
            title: 'Invalid Room Code',
            description: 'Please enter a valid room code',
            variant: 'destructive',
          });
          router.push('/join');
          return;
        }

        // Check if room exists
        const roomResponse = await api.checkRoom(roomCode);
        if (!roomResponse.exists) {
          toast({
            title: 'Room Not Found',
            description: 'This room does not exist or has expired',
            variant: 'destructive',
          });
          router.push('/join');
          return;
        }

        // Check if user has name
        const storedUser = localStorage.getItem('chatUser');
        if (!storedUser) {
          router.push(`/join`);
          return;
        }

        const { name: storedName, roomCode: storedRoomCode } = JSON.parse(storedUser);
        
        if (!storedName || storedRoomCode !== roomCode) {
          router.push(`/join`);
          return;
        }

        // Connect to socket
        connectToSocket(storedName);

      } catch (error) {
        console.error('Initialization error:', error);
        toast({
          title: 'Error',
          description: 'Failed to join room',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        disconnectSocket();
        reset();
      }
    };
  }, [roomCode, connectToSocket, loadUser, reset, router, toast]);

  const handleSendMessage = (message: string, attachments?: Attachment[], replyToId?: string) => {
    if (!socketRef.current || !name) return;

    const sanitizedMessage = sanitizeMessage(message);
    if (!sanitizedMessage.trim() && (!attachments || attachments.length === 0)) return;

    socketRef.current.emit('send-message', {
      roomCode,
      name,
      message: sanitizedMessage,
      replyTo: replyToId,
      attachments: attachments || [],
    });

    // Clear reply state after sending
    if (replyingTo) {
      setReplyingTo(null);
    }
  };

  const handleTyping = () => {
    if (!socketRef.current || !name) return;
    
    socketRef.current.emit('typing', {
      roomCode,
      name,
    });
  };

  const handleStopTyping = () => {
    if (!socketRef.current || !name) return;
    
    socketRef.current.emit('stop-typing', {
      roomCode,
      name,
    });
  };

  if (isLoading) {
    return (
      <GeoBlockWrapper>
        <div className="h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <LoadingSpinner size="lg" text="Joining classroom..." />
          </div>
        </div>
      </GeoBlockWrapper>
    );
  }

  return (
    <GeoBlockWrapper>
      <div className="h-screen flex bg-black overflow-hidden">
        {/* Main Chat Area - Full Width */}
        <div className="flex-1 flex flex-col bg-gray-950">
          {/* Modern Header */}
          <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Back Button */}
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Room Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Student Chat</h1>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                        {roomCode}
                      </span>
                      <CopyButton text={roomCode} label="Copy" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Connection Status */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50">
                  {isConnected ? (
                    <>
                      <div className="relative">
                        <Wifi className="h-4 w-4 text-green-500" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                      <span className="text-xs text-green-500 font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-500 font-medium">Disconnected</span>
                    </>
                  )}
                </div>

                {/* Participant Count */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium text-gray-300">{participants.length}</span>
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Messages Area - Expanded */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-950 to-black"
          >
            <div className="max-w-6xl mx-auto px-4 py-6">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center py-20">
                  <div className="bg-gray-900/50 backdrop-blur-sm p-12 rounded-3xl border border-gray-800 max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No messages yet</h3>
                    <p className="text-gray-400 text-lg">Be the first to send a message!</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Date Separator */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-800" />
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Today</span>
                    <div className="flex-1 h-px bg-gray-800" />
                  </div>

                  {/* Messages */}
                  {messages.map((message) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      onReply={(msg) => setReplyingTo(msg)}
                      replyToMessage={message.replyTo ? messagesMap[message.replyTo] : null}
                    />
                  ))}
                </>
              )}
              
              {/* Typing Indicator */}
              <TypingIndicator typingUsers={typingUsers} />
              
              <div ref={messagesEndRef} />
            </div>

            {/* Jump to Bottom Button */}
            {showJumpToBottom && (
              <Button
                onClick={scrollToBottom}
                className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 shadow-lg z-10 animate-fade-in"
              >
                <ArrowLeft className="w-4 h-4 mr-2 rotate-90" />
                Jump to bottom
              </Button>
            )}
          </div>

          {/* Chat Input */}
          <div className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-4">
            <div className="max-w-6xl mx-auto">
              <ChatInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
                disabled={!isConnected || isMuted}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                roomCode={roomCode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warning Notification */}
      <WarningNotification />
    </GeoBlockWrapper>
  );
}
