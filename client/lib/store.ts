import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { Message } from './socket';

interface UserState {
  name: string | null;
  roomCode: string | null;
  setUser: (name: string, roomCode: string) => void;
  clearUser: () => void;
  loadUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: null,
  roomCode: null,
  setUser: (name: string, roomCode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatUser', JSON.stringify({ name, roomCode }));
    }
    set({ name, roomCode });
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatUser');
    }
    set({ name: null, roomCode: null });
  },
  loadUser: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chatUser');
      if (stored) {
        const { name, roomCode } = JSON.parse(stored);
        set({ name, roomCode });
      }
    }
  },
}));

interface ChatState {
  messages: Message[];
  participants: string[];
  typingUsers: Set<string>;
  socket: Socket | null;
  isConnected: boolean;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setParticipants: (participants: string[]) => void;
  setTypingUser: (name: string, isTyping: boolean) => void;
  setSocket: (socket: Socket | null) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  participants: [],
  typingUsers: new Set(),
  socket: null,
  isConnected: false,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setParticipants: (participants) => set({ participants }),
  setTypingUser: (name, isTyping) => set((state) => {
    const newTypingUsers = new Set(state.typingUsers);
    if (isTyping) {
      newTypingUsers.add(name);
    } else {
      newTypingUsers.delete(name);
    }
    return { typingUsers: newTypingUsers };
  }),
  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ isConnected: connected }),
  reset: () => set({
    messages: [],
    participants: [],
    typingUsers: new Set(),
    socket: null,
    isConnected: false,
  }),
}));
