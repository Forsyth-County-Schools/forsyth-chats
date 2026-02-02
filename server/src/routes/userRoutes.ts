import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  displayName: z.string().trim().min(2).max(50),
  profileImageUrl: z.string().url().or(z.literal('')).optional().nullable(),
});

const updateUserSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  profileImageUrl: z.string().url().or(z.literal('')).optional().nullable(),
});

// POST /api/users - Create or update user from Clerk webhook
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = createUserSchema.parse(req.body);
    const { clerkId, email, displayName, profileImageUrl } = validated;

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId });
    
    if (existingUser) {
      // Update existing user
      existingUser.email = email;
      existingUser.displayName = displayName;
      if (profileImageUrl) {
        existingUser.profileImageUrl = profileImageUrl;
      }
      
      await existingUser.save();
      
      res.status(200).json({
        success: true,
        user: existingUser,
      });
      return;
    }

    // Create new user
    const newUser = new User({
      clerkId,
      email,
      displayName,
      profileImageUrl,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      user: newUser,
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
        errors: error.errors,
      });
      return;
    }

    // Handle duplicate key errors (race condition where user created between check and insert)
    if (error.code === 11000) {
      try {
        // User was created in between - try to find and return it
        const retrievedUser = await User.findOne({ clerkId: req.body.clerkId });
        if (retrievedUser) {
          res.status(200).json({
            success: true,
            user: retrievedUser,
          });
          return;
        }
      } catch (retryError) {
        console.error('Error retrieving user after duplicate key error:', retryError);
      }
    }

    console.error('Error creating/updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/update user',
    });
  }
});

// GET /api/users/:clerkId - Get user by Clerk ID
router.get('/users/:clerkId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerkId } = req.params;

    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
});

// PUT /api/users/:clerkId - Update user profile
router.put('/users/:clerkId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerkId } = req.params;
    const validated = updateUserSchema.parse(req.body);

    const user = await User.findOne({ clerkId });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update fields
    if (validated.displayName) {
      user.displayName = validated.displayName;
    }
    
    if (validated.profileImageUrl !== undefined) {
      user.profileImageUrl = validated.profileImageUrl || undefined;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid update data',
        errors: error.errors,
      });
      return;
    }

    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
});

export default router;