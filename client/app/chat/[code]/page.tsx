'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users, Menu, X, Wifi, WifiOff, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { ParticipantList } from '@/components/ParticipantList';
import { CopyButton } from '@/components/CopyButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useUserStore, useChatStore } from '@/lib/store';
import { getSocket, disconnectSocket, Message } from '@/lib/socket';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const roomCode = (params.code as string)?.toUpperCase();
  const { name, loadUser } = useUserStore();
  const {
    messages,
    participants,
    typingUsers,
    isConnected,
    setMessages,
    addMessage,
    setParticipants,
    setTypingUser,
    setConnected,
    reset,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
  }, [roomCode]);

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

    socket.on('connect_error', (error) => {
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

    socket.on('participants-update', (newParticipants: string[]) => {
      setParticipants(newParticipants);
    });

    socket.on('user-joined', ({ name: joinedName }: { name: string }) => {
      if (joinedName !== userName) {
        toast({
          title: 'User Joined',
          description: `${joinedName} joined the classroom`,
        });
      }
    });

    socket.on('user-left', ({ name: leftName }: { name: string }) => {
      toast({
        title: 'User Left',
        description: `${leftName} left the classroom`,
      });
    });

    socket.on('user-typing', ({ name: typingName, isTyping }: { name: string; isTyping: boolean }) => {
      if (typingName !== userName) {
        setTypingUser(typingName, isTyping);
      }
    });

    socket.on('error', ({ message }: { message: string }) => {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    });
  };

  const handleSendMessage = (message: string) => {
    if (!socketRef.current || !name) return;

    socketRef.current.emit('send-message', {
      roomCode,
      name,
      message,
    });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Joining classroom..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-purple-500/5" />
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50" />
      {/* Header */}
      <header className="relative z-10 glass-dark border-slate-700/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-300 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Classroom Chat</h1>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="font-mono text-teal-400">{roomCode}</span>
                <CopyButton text={roomCode} label="Copy" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-1 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-teal-400 animate-pulse-glow" />
                  <span className="hidden sm:inline text-slate-300">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="hidden sm:inline text-red-400">Disconnected</span>
                </>
              )}
            </div>

            {/* Participant Count */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 rounded-full">
              <Users className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-slate-200">{participants.length}</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-slate-800 text-slate-300 hover:text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div className="text-slate-400">
                  <div className="glass-dark p-8 rounded-2xl border border-slate-700/50 max-w-sm">
                    <MessageSquare className="h-16 w-16 text-teal-400 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2 text-slate-300">No messages yet</p>
                    <p className="text-sm text-slate-500">Be the first to send a message!</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={message.name === name}
                  />
                ))}
              </>
            )}
            
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="text-sm text-slate-400 italic px-2 animate-pulse">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            disabled={!isConnected}
          />
        </div>

        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-80 glass-dark border-l border-slate-700/50">
          <ParticipantList participants={participants} currentUserName={name || ''} />
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 glass-dark shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="font-semibold text-slate-200">Participants</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="hover:bg-slate-800 text-slate-300">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ParticipantList participants={participants} currentUserName={name || ''} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
