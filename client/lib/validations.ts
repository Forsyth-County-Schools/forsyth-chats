import { z } from 'zod';

export const nameSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(30, 'Name must be less than 30 characters'),
});

export const roomCodeSchema = z.object({
  code: z.string().length(10, 'Room code must be exactly 10 characters').toUpperCase(),
});

export const messageSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
});

export type NameInput = z.infer<typeof nameSchema>;
export type RoomCodeInput = z.infer<typeof roomCodeSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
