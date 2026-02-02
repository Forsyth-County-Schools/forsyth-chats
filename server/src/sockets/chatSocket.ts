import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import Filter from 'bad-words';
import { Room } from '../models/Room';
import { Message } from '../models/Message';

// Validation schemas
const joinRoomSchema = z.object({
  code: z.string().length(10).toUpperCase(),
  name: z.string().trim().min(2).max(30),
});

const sendMessageSchema = z.object({
  roomCode: z.string().length(10).toUpperCase(),
  name: z.string().trim().min(2).max(30),
  message: z.string().trim().min(1).max(2000),
});

const typingSchema = z.object({
  roomCode: z.string().length(10),
  name: z.string().trim().min(2).max(30),
});

// Store active participants per room
// Map<roomCode, Set<userName>>
const roomParticipants = new Map<string, Set<string>>();

// Map socket ID to user info for cleanup on disconnect
const socketToUser = new Map<string, { roomCode: string; name: string }>();

// Profanity filter
const profanityFilter = new (Filter as unknown as { new (): { isProfane: (text: string) => boolean; clean: (text: string) => string } })();

// Helper function to sanitize HTML
const sanitizeMessage = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Helper to get participants list
const getParticipants = (roomCode: string): string[] => {
  const participants = roomParticipants.get(roomCode);
  return participants ? Array.from(participants) : [];
};

// Helper to add participant
const addParticipant = (roomCode: string, name: string): void => {
  if (!roomParticipants.has(roomCode)) {
    roomParticipants.set(roomCode, new Set());
  }
  roomParticipants.get(roomCode)!.add(name);
};

// Helper to remove participant
const removeParticipant = (roomCode: string, name: string): void => {
  const participants = roomParticipants.get(roomCode);
  if (participants) {
    participants.delete(name);
    if (participants.size === 0) {
      roomParticipants.delete(roomCode);
    }
  }
};

export const setupSocketHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle join-room event
    socket.on('join-room', async (data) => {
      try {
        // Validate input
        const validated = joinRoomSchema.parse(data);
        const { code, name } = validated;

        if (profanityFilter.isProfane(name)) {
          socket.emit('error', {
            message: 'Please choose an appropriate name for school use',
          });
          return;
        }

        // Check if room exists
        const room = await Room.findOne({ code });
        if (!room) {
          socket.emit('error', {
            message: 'Room not found',
            type: 'room-not-found',
          });
          return;
        }

        // Join the socket room
        socket.join(code);

        // Store user info for this socket
        socketToUser.set(socket.id, { roomCode: code, name });

        // Add to participants
        addParticipant(code, name);

        console.log(`👤 ${name} joined room ${code}`);

        // Fetch chat history
        const messages = await Message.find({ roomCode: code })
          .sort({ timestamp: 1 })
          .limit(100)
          .lean();

        // Send chat history to the joining user
        socket.emit('chat-history', messages);

        // Broadcast updated participant list to all in room
        const participants = getParticipants(code);
        io.to(code).emit('participants-update', participants);

        // Notify others that someone joined
        socket.to(code).emit('user-joined', {
          name,
          timestamp: new Date(),
        });

      } catch (error) {
        if (error instanceof z.ZodError) {
          socket.emit('error', {
            message: 'Invalid data provided',
            errors: error.errors,
          });
        } else {
          console.error('Error in join-room:', error);
          socket.emit('error', {
            message: 'Failed to join room',
          });
        }
      }
    });

    // Handle send-message event
    socket.on('send-message', async (data) => {
      try {
        // Validate input
        const validated = sendMessageSchema.parse(data);
        const { roomCode, name, message } = validated;

        // Sanitize message content
        const sanitizedMessage = sanitizeMessage(message);
        const filteredMessage = profanityFilter.clean(sanitizedMessage);

        // Create and save message
        const newMessage = new Message({
          roomCode,
          name,
          message: filteredMessage,
          timestamp: new Date(),
        });

        await newMessage.save();

        // Broadcast message to all clients in the room
        io.to(roomCode).emit('new-message', {
          _id: newMessage._id,
          roomCode: newMessage.roomCode,
          name: newMessage.name,
          message: newMessage.message,
          timestamp: newMessage.timestamp,
        });

        console.log(`💬 Message in ${roomCode} from ${name}`);

      } catch (error) {
        if (error instanceof z.ZodError) {
          socket.emit('error', {
            message: 'Invalid message data',
            errors: error.errors,
          });
        } else {
          console.error('Error in send-message:', error);
          socket.emit('error', {
            message: 'Failed to send message',
          });
        }
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      try {
        const validated = typingSchema.parse(data);
        const { roomCode, name } = validated;

        // Broadcast typing indicator to others in room (not to sender)
        socket.to(roomCode).emit('user-typing', {
          name,
          isTyping: true,
        });

      } catch (error) {
        // Silently fail for typing indicators
        console.error('Error in typing event:', error);
      }
    });

    // Handle stop-typing indicator
    socket.on('stop-typing', (data) => {
      try {
        const validated = typingSchema.parse(data);
        const { roomCode, name } = validated;

        socket.to(roomCode).emit('user-typing', {
          name,
          isTyping: false,
        });

      } catch (error) {
        console.error('Error in stop-typing event:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const userInfo = socketToUser.get(socket.id);

      if (userInfo) {
        const { roomCode, name } = userInfo;

        // Remove from participants
        removeParticipant(roomCode, name);

        // Broadcast updated participant list
        const participants = getParticipants(roomCode);
        io.to(roomCode).emit('participants-update', participants);

        // Notify others that someone left
        socket.to(roomCode).emit('user-left', {
          name,
          timestamp: new Date(),
        });

        // Clean up
        socketToUser.delete(socket.id);

        console.log(`👋 ${name} left room ${roomCode}`);
      }

      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.io handlers initialized');
};
