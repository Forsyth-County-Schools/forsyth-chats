import { Router, Request, Response } from 'express';
import { customAlphabet } from 'nanoid';
import { z } from 'zod';
import { Room } from '../models/Room';

// Import bad-words with require for CommonJS compatibility
const Filter = require('bad-words');

const router = Router();

// Create custom nanoid generator for room codes
// Using uppercase letters and numbers, length 10
const generateRoomCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

// Profanity filter
const profanityFilter = new Filter();

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, number>();

// Validation schema for room creation
const createRoomSchema = z.object({
  creatorName: z.string().trim().min(2).max(30).optional(),
});

// Rate limiting middleware for room creation
const rateLimitCreateRoom = (req: Request, res: Response, next: () => void) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const cooldownPeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  const lastCreated = rateLimitStore.get(clientIP);
  
  if (lastCreated && (now - lastCreated) < cooldownPeriod) {
    const timeLeft = Math.ceil((cooldownPeriod - (now - lastCreated)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Rate limit exceeded. Please wait ${Math.ceil(timeLeft / 60)} minutes before creating another room.`,
      timeLeftSeconds: timeLeft
    });
  }
  
  return next();
};

// POST /api/create-room - Create a new room
router.post('/create-room', rateLimitCreateRoom, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createRoomSchema.parse(req.body);

    if (validatedData.creatorName && profanityFilter.isProfane(validatedData.creatorName)) {
      return res.status(400).json({
        success: false,
        message: 'Please choose an appropriate name for school use',
      });
    }
    
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    let code: string;
    let attempts = 0;
    const maxAttempts = 5;
    
    // Generate unique code with retry logic
    while (attempts < maxAttempts) {
      code = generateRoomCode();
      
      // Check if code already exists
      const existingRoom = await Room.findOne({ code });
      
      if (!existingRoom) {
        // Create new room
        const room = new Room({
          code,
          creatorName: validatedData.creatorName,
        });
        
        await room.save();
        
        // Store rate limit timestamp
        rateLimitStore.set(clientIP, Date.now());
        
        return res.status(201).json({
          success: true,
          code,
          message: 'Room created successfully',
        });
      }
      
      attempts++;
    }
    
    // If we couldn't generate a unique code after max attempts
    return res.status(500).json({
      success: false,
      message: 'Failed to generate unique room code. Please try again.',
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Error creating room:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/room/:code - Check if room exists
router.get('/room/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    // Validate code format
    if (!code || code.length !== 10) {
      return res.status(400).json({
        success: false,
        exists: false,
        message: 'Invalid room code format',
      });
    }
    
    // Check if room exists
    const room = await Room.findOne({ code: code.toUpperCase() });
    
    if (room) {
      return res.status(200).json({
        success: true,
        exists: true,
        code: room.code,
        createdAt: room.createdAt,
      });
    } else {
      return res.status(404).json({
        success: false,
        exists: false,
        message: 'Room not found',
      });
    }
    
  } catch (error) {
    console.error('Error checking room:', error);
    return res.status(500).json({
      success: false,
      exists: false,
      message: 'Internal server error',
    });
  }
});

// GET /api/health - Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
