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
      <div className="page-container">
        <LoadingSpinner size="lg" text="Joining classroom..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Classroom Chat</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-mono text-red-600 font-bold text-lg">{roomCode}</span>
                <CopyButton text={roomCode} label="Copy" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span className="hidden sm:inline text-green-600 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <span className="hidden sm:inline text-red-600 font-medium">Disconnected</span>
                </>
              )}
            </div>

            {/* Participant Count */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
              <Users className="h-5 w-5 text-red-600" />
              <span className="text-sm font-semibold text-red-700">{participants.length}</span>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div className="card-modern p-12 max-w-md">
                  <div className="bg-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No messages yet</h3>
                  <p className="text-gray-600 text-lg">Be the first to send a message!</p>
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
              <div className="text-sm text-gray-500 italic px-4 animate-pulse font-medium">
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
        <aside className="hidden md:block w-80 bg-white border-l border-gray-200 shadow-sm">
          <ParticipantList participants={participants} currentUserName={name || ''} />
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl animate-slide-up">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-bold text-xl text-gray-900">Participants</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="hover:bg-gray-100 text-gray-600">
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
