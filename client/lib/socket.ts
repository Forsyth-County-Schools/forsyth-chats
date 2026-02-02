import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://forsyth-chats.onrender.com';

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Attachment {
  type: 'image' | 'file';
  filename: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain: string;
}

export interface Message {
  _id: string;
  roomCode: string;
  name: string;
  message: string;
  timestamp: Date;
  replyTo?: string;
  reactions: Reaction[];
  attachments: Attachment[];
  linkPreviews: LinkPreview[];
  edited?: boolean;
  editedAt?: Date;
  read?: boolean;
}

export interface SocketEvents {
  // Client emits
  'join-room': (data: { code: string; name: string }) => void;
  'send-message': (data: { 
    roomCode: string; 
    name: string; 
    message: string; 
    replyTo?: string;
    attachments?: Attachment[];
  }) => void;
  'add-reaction': (data: { messageId: string; roomCode: string; name: string; emoji: string }) => void;
  'typing': (data: { roomCode: string; name: string }) => void;
  'stop-typing': (data: { roomCode: string; name: string }) => void;

  // Server emits
  'chat-history': (messages: Message[]) => void;
  'new-message': (message: Message) => void;
  'reaction-updated': (data: { messageId: string; reactions: Reaction[] }) => void;
  'participants-update': (participants: string[]) => void;
  'user-joined': (data: { name: string; timestamp: Date }) => void;
  'user-left': (data: { name: string; timestamp: Date }) => void;
  'user-typing': (data: { name: string; isTyping: boolean }) => void;
  'error': (error: { message: string; type?: string }) => void;
}

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
