import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';

const router = Router();

// Clerk webhook secret for verification
const CLERK_WEBHOOK_SECRET = 'whsec_jiezJxMGvdo2sIGN/3klKumR72RU5D2Q';

// POST /api/webhooks/clerk - Handle Clerk webhooks
router.post('/webhooks/clerk', async (req: Request, res: Response): Promise<void> => {
  try {
    // Verify webhook signature
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      res.status(400).json({
        success: false,
        message: 'Missing webhook headers',
      });
      return;
    }

    // Get the raw body for signature verification
    const payload = req.body;
    const eventType = payload.type;

    console.log(`Clerk webhook received: ${eventType}`);

    // Handle different webhook events
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(payload.data);
        break;
      case 'user.updated':
        await handleUserUpdated(payload.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(payload.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
});

// Helper functions for webhook events
async function handleUserCreated(data: any) {
  const userData = {
    clerkId: data.id,
    email: data.email_addresses[0]?.email_address || '',
    displayName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'User',
    profileImageUrl: data.image_url,
  };

  // Check if user already exists (shouldn't happen for user.created)
  const existingUser = await User.findOne({ clerkId: userData.clerkId });
  
  if (existingUser) {
    console.log(`User ${userData.clerkId} already exists, updating...`);
    existingUser.email = userData.email;
    existingUser.displayName = userData.displayName;
    existingUser.profileImageUrl = userData.profileImageUrl;
    await existingUser.save();
  } else {
    const newUser = new User(userData);
    await newUser.save();
    console.log(`Created new user: ${userData.clerkId}`);
  }
}

async function handleUserUpdated(data: any) {
  const userData = {
    clerkId: data.id,
    email: data.email_addresses[0]?.email_address || '',
    displayName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'User',
    profileImageUrl: data.image_url,
  };

  const user = await User.findOne({ clerkId: userData.clerkId });
  
  if (user) {
    user.email = userData.email;
    user.displayName = userData.displayName;
    user.profileImageUrl = userData.profileImageUrl;
    await user.save();
    console.log(`Updated user: ${userData.clerkId}`);
  } else {
    // User doesn't exist, create them
    const newUser = new User(userData);
    await newUser.save();
    console.log(`Created missing user on update: ${userData.clerkId}`);
  }
}

async function handleUserDeleted(data: any) {
  const clerkId = data.id;
  
  const result = await User.deleteOne({ clerkId });
  
  if (result.deletedCount > 0) {
    console.log(`Deleted user: ${clerkId}`);
  } else {
    console.log(`User not found for deletion: ${clerkId}`);
  }
}

// Validation schemas
const createUserSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  displayName: z.string().trim().min(2).max(50),
  profileImageUrl: z.string().url().optional(),
});

const updateUserSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  profileImageUrl: z.string().url().optional().nullable(),
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

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
        errors: error.errors,
      });
      return;
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
