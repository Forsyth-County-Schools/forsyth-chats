import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { Message } from './socket';
import { UserProfile } from './api';

interface UserState {
  name: string | null;
  roomCode: string | null;
  profile: UserProfile | null;
  setUser: (name: string, roomCode: string) => void;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
  loadUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: null,
  roomCode: null,
  profile: null,
  setUser: (name: string, roomCode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatUser', JSON.stringify({ name, roomCode }));
    }
    set({ name, roomCode });
  },
  setProfile: (profile: UserProfile) => {
    set({ profile, name: profile.displayName });
  },
  updateProfile: (updates: Partial<UserProfile>) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
      name: updates.displayName || state.name,
    }));
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatUser');
    }
    set({ name: null, roomCode: null, profile: null });
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
  isHost: boolean;
  hostName: string | null;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setParticipants: (participants: string[]) => void;
  setTypingUser: (name: string, isTyping: boolean) => void;
  setTypingUsers: (users: Set<string>) => void;
  setSocket: (socket: Socket | null) => void;
  setConnected: (connected: boolean) => void;
  setHost: (isHost: boolean, hostName: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  participants: [],
  typingUsers: new Set(),
  socket: null,
  isConnected: false,
  isHost: false,
  hostName: null,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg._id === messageId ? { ...msg, ...updates } : msg
    )
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
  setTypingUsers: (users: Set<string>) => set({ typingUsers: new Set(users) }),
  setSocket: (socket) => set({ socket }),
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  setHost: (isHost: boolean, hostName: string | null) => set({ isHost, hostName }),
  reset: () => set({
    messages: [],
    participants: [],
    typingUsers: new Set(),
    socket: null,
    isConnected: false,
    isHost: false,
    hostName: null,
  }),
}));
