import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { Room } from '../models/Room';
import { Message } from '../models/Message';

// Import bad-words with require for CommonJS compatibility
const Filter = require('bad-words');

// Validation schemas
const joinRoomSchema = z.object({
  code: z.string().length(10).toUpperCase(),
  name: z.string().trim().min(2).max(30),
});

const sendMessageSchema = z.object({
  roomCode: z.string().length(10).toUpperCase(),
  name: z.string().trim().min(2).max(30),
  message: z.string().trim().min(1).max(2000),
  replyTo: z.string().optional(), // Message ID being replied to
  attachments: z.array(z.object({
    type: z.enum(['image', 'file']),
    filename: z.string(),
    originalName: z.string(),
    size: z.number(),
    url: z.string(),
    mimeType: z.string(),
  })).default([]),
});

const reactionSchema = z.object({
  messageId: z.string(),
  roomCode: z.string().length(10).toUpperCase(),
  name: z.string().trim().min(2).max(30),
  emoji: z.string().min(1).max(10),
});

const typingSchema = z.object({
  roomCode: z.string().length(10),
  name: z.string().trim().min(2).max(30),
});

const kickUserSchema = z.object({
  roomCode: z.string().length(10).toUpperCase(),
  hostName: z.string().trim().min(2).max(30),
  targetUserName: z.string().trim().min(2).max(30),
});

// Store active participants per room
// Map<roomCode, Set<userName>>
const roomParticipants = new Map<string, Set<string>>();

// Map socket ID to user info for cleanup on disconnect
const socketToUser = new Map<string, { roomCode: string; name: string }>();

// Profanity filter
const profanityFilter = new Filter();

// Helper function to extract and process links
const extractLinks = (text: string): Array<{ url: string; domain: string }> => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  
  return matches.map(url => {
    try {
      const urlObj = new URL(url);
      return {
        url: url,
        domain: urlObj.hostname
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as Array<{ url: string; domain: string }>;
};

// Helper function to sanitize HTML
const sanitizeMessage = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
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

// Helper to add participant - returns true if participant was newly added
const addParticipant = (roomCode: string, name: string): boolean => {
  if (!roomParticipants.has(roomCode)) {
    roomParticipants.set(roomCode, new Set());
  }
  const participants = roomParticipants.get(roomCode)!;
  if (participants.has(name)) {
    return false; // Participant already exists
  }
  participants.add(name);
  return true; // Participant was newly added
};

// Helper to remove participant and cleanup room if empty
const removeParticipant = async (roomCode: string, name: string): Promise<boolean> => {
  const participants = roomParticipants.get(roomCode);
  if (participants) {
    participants.delete(name);
    if (participants.size === 0) {
      roomParticipants.delete(roomCode);
      
      // Room is now empty, clean up all data
      try {
        // Delete all messages for this room
        await Message.deleteMany({ roomCode });
        console.log(`🗑️ Deleted all messages for empty room ${roomCode}`);
        
        // Delete the room itself
        await Room.deleteOne({ code: roomCode });
        console.log(`🗑️ Deleted empty room ${roomCode}`);
        
        return true; // Room was deleted
      } catch (error) {
        console.error(`❌ Error cleaning up room ${roomCode}:`, error);
        return false;
      }
    }
  }
  return false; // Room not deleted
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

        // Add to participants - only notify if newly added
        const isNewParticipant = addParticipant(code, name);

        console.log(`👤 ${name} ${isNewParticipant ? 'joined' : 'reconnected to'} room ${code}`);

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

        // Send room info to the joining user
        socket.emit('room-info', {
          creatorName: room.creatorName,
        });

        // Notify others that someone joined (only if new participant)
        if (isNewParticipant) {
          socket.to(code).emit('user-joined', {
            name,
            timestamp: new Date(),
          });
        }

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
        const { roomCode, name, message, replyTo, attachments } = validated;

        // Ensure message is not null or undefined
        if (!message || typeof message !== 'string') {
          socket.emit('error', {
            message: 'Invalid message content',
          });
          return;
        }

        // Sanitize message content
        const sanitizedMessage = sanitizeMessage(message);
        const filteredMessage = profanityFilter.clean(sanitizedMessage || '');

        // Extract and process links
        const linkPreviews = extractLinks(filteredMessage);

        // Validate reply target if provided
        let replyToMessage = null;
        if (replyTo) {
          replyToMessage = await Message.findById(replyTo);
          if (!replyToMessage || replyToMessage.roomCode !== roomCode) {
            socket.emit('error', {
              message: 'Invalid reply target',
            });
            return;
          }
        }

        // Create and save message
        const newMessage = new Message({
          roomCode,
          name,
          message: filteredMessage,
          replyTo: replyTo || undefined,
          attachments,
          linkPreviews,
          timestamp: new Date(),
        });

        await newMessage.save();

        // Broadcast message to all clients in the room
        io.to(roomCode).emit('new-message', {
          _id: newMessage._id,
          roomCode: newMessage.roomCode,
          name: newMessage.name,
          message: newMessage.message,
          replyTo: newMessage.replyTo,
          reactions: newMessage.reactions,
          attachments: newMessage.attachments,
          linkPreviews: newMessage.linkPreviews,
          timestamp: newMessage.timestamp,
          edited: newMessage.edited,
        });

        console.log(`💬 Message in ${roomCode} from ${name}${replyTo ? ' (reply)' : ''}${attachments.length ? ` with ${attachments.length} attachment(s)` : ''}`);

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

    // Handle reaction event
    socket.on('add-reaction', async (data) => {
      try {
        const validated = reactionSchema.parse(data);
        const { messageId, roomCode, name, emoji } = validated;

        // Find the message
        const message = await Message.findById(messageId);
        if (!message || message.roomCode !== roomCode) {
          socket.emit('error', {
            message: 'Message not found',
          });
          return;
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(name)) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(u => u !== name);
            existingReaction.count = existingReaction.users.length;
            
            if (existingReaction.count === 0) {
              message.reactions = message.reactions.filter(r => r.emoji !== emoji);
            }
          } else {
            // Add reaction
            existingReaction.users.push(name);
            existingReaction.count = existingReaction.users.length;
          }
        } else {
          // New reaction
          message.reactions.push({
            emoji,
            users: [name],
            count: 1
          });
        }

        await message.save();

        // Broadcast reaction update to all clients in the room
        io.to(roomCode).emit('reaction-updated', {
          messageId: message._id,
          reactions: message.reactions,
        });

        console.log(`👍 Reaction ${emoji} by ${name} on message in ${roomCode}`);

      } catch (error) {
        if (error instanceof z.ZodError) {
          socket.emit('error', {
            message: 'Invalid reaction data',
            errors: error.errors,
          });
        } else {
          console.error('Error in add-reaction:', error);
          socket.emit('error', {
            message: 'Failed to add reaction',
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

    // Handle kick user event
    socket.on('kick-user', async (data) => {
      try {
        const validated = kickUserSchema.parse(data);
        const { roomCode, hostName, targetUserName } = validated;

        // Verify room exists and get room info
        const room = await Room.findOne({ code: roomCode });
        if (!room) {
          socket.emit('error', {
            message: 'Room not found',
          });
          return;
        }

        // Verify the requester is the host
        if (room.creatorName !== hostName) {
          socket.emit('error', {
            message: 'Only the room host can kick users',
          });
          return;
        }

        // Find the target user's socket
        let targetSocketId: string | null = null;
        for (const [socketId, userInfo] of socketToUser.entries()) {
          if (userInfo.roomCode === roomCode && userInfo.name === targetUserName) {
            targetSocketId = socketId;
            break;
          }
        }

        if (!targetSocketId) {
          socket.emit('error', {
            message: 'User not found in room',
          });
          return;
        }

        // Cannot kick the host
        if (targetUserName === hostName) {
          socket.emit('error', {
            message: 'Cannot kick the room host',
          });
          return;
        }

        // Get the target socket and disconnect them
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          // Remove from participants
          await removeParticipant(roomCode, targetUserName);
          
          // Notify everyone that user was kicked
          io.to(roomCode).emit('user-kicked', {
            name: targetUserName,
            kickedBy: hostName,
            timestamp: new Date(),
          });

          // Send updated participants list
          const participants = getParticipants(roomCode);
          io.to(roomCode).emit('participants-update', participants);

          // Disconnect the kicked user
          targetSocket.emit('kicked-from-room', {
            message: `You have been kicked from the room by ${hostName}`,
            roomCode,
          });
          
          targetSocket.disconnect(true);
          
          console.log(`👢 ${hostName} kicked ${targetUserName} from room ${roomCode}`);
        }

      } catch (error) {
        if (error instanceof z.ZodError) {
          socket.emit('error', {
            message: 'Invalid kick data',
            errors: error.errors,
          });
        } else {
          console.error('Error in kick-user:', error);
          socket.emit('error', {
            message: 'Failed to kick user',
          });
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const userInfo = socketToUser.get(socket.id);

      if (userInfo) {
        const { roomCode, name } = userInfo;

        // Remove from participants and check if room should be cleaned up
        const roomDeleted = await removeParticipant(roomCode, name);

        if (!roomDeleted) {
          // Room still has participants, send updates
          const participants = getParticipants(roomCode);
          io.to(roomCode).emit('participants-update', participants);

          // Notify others that someone left
          socket.to(roomCode).emit('user-left', {
            name,
            timestamp: new Date(),
          });
        }

        // Clean up
        socketToUser.delete(socket.id);

        console.log(`👋 ${name} left room ${roomCode}`);
      }

      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.io handlers initialized');
};
