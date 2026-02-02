import { Router, Request, Response } from 'express';
import { customAlphabet } from 'nanoid';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// Validation schema for joining room
const joinRoomSchema = z.object({
  roomCode: z.string().trim().length(10),
  name: z.string().trim().min(2).max(30),
});

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Max 5 files per upload
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error('File type not allowed') as any;
      cb(error, false);
    }
  }
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

// POST /api/join-room - Join an existing room
router.post('/join-room', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = joinRoomSchema.parse(req.body);
    const { roomCode, name } = validatedData;

    // Check for profanity in name
    if (profanityFilter.isProfane(name)) {
      return res.status(400).json({
        success: false,
        message: 'Please choose an appropriate name for school use',
      });
    }

    // Check if room exists
    const room = await Room.findOne({ code: roomCode.toUpperCase() });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or has expired',
      });
    }

    // Generate a simple user ID (in production, you might want something more sophisticated)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return res.status(200).json({
      success: true,
      user: {
        id: userId,
        name: name.trim(),
      },
      room: {
        code: room.code,
        createdAt: room.createdAt,
      },
      message: 'Successfully joined room',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Error joining room:', error);
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

// POST /api/upload - File upload endpoint
router.post('/upload', upload.array('files', 5), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { roomCode } = req.body;

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
      return;
    }

    if (!roomCode || roomCode.length !== 10) {
      // Clean up uploaded files if room code is invalid
      files.forEach(file => {
        fs.unlink(file.path, () => {});
      });
      
      res.status(400).json({
        success: false,
        message: 'Invalid room code',
      });
      return;
    }

    // Verify room exists
    const room = await Room.findOne({ code: roomCode.toUpperCase() });
    if (!room) {
      // Clean up uploaded files if room doesn't exist
      files.forEach(file => {
        fs.unlink(file.path, () => {});
      });
      
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    // Process uploaded files
    const attachments = files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 'file' as 'image' | 'file',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/api/file/${file.filename}`,
      mimeType: file.mimetype,
    }));

    res.status(200).json({
      success: true,
      attachments,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up files on error
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => {
        fs.unlink(file.path, () => {});
      });
    }

    res.status(500).json({
      success: false,
      message: 'Upload failed',
    });
  }
});

// GET /api/file/:filename - Serve uploaded files
router.get('/file/:filename', (req: Request, res: Response): void => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      success: false,
      message: 'File not found',
    });
    return;
  }

  // Send file
  res.sendFile(filePath);
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
