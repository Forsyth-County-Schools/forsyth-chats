'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/lib/store';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Image from 'next/image';
import { User, Save } from 'lucide-react';

interface ProfileSetupProps {
  onComplete?: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user } = useUser();
  const { setProfile, updateProfile } = useUserStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        // First check if user exists in our database
        const response = await api.getUser(user.id);
        
        if (response.success && response.user) {
          // User exists, load their profile
          setProfile(response.user);
          setDisplayName(response.user.displayName);
          setProfileImageUrl(response.user.profileImageUrl || '');
        } else {
          // User doesn't exist, create them from Clerk data
          console.log('User not found in database, creating profile...');
          const newUserData = {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            displayName: user.fullName || user.firstName || user.username || 'User',
            profileImageUrl: user.imageUrl,
          };

          try {
            const createResponse = await api.createOrUpdateUser(newUserData);
            if (createResponse.success && createResponse.user) {
              setProfile(createResponse.user);
              setDisplayName(createResponse.user.displayName);
              setProfileImageUrl(createResponse.user.profileImageUrl || '');
              toast({
                title: 'Profile Created',
                description: 'Your profile has been set up successfully!',
              });
            } else {
              throw new Error('Failed to create user profile');
            }
          } catch (createError) {
            console.error('Error creating user profile:', createError);
            
            // Fallback: create a temporary profile locally
            const fallbackProfile = {
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              displayName: user.fullName || user.firstName || user.username || 'User',
              profileImageUrl: user.imageUrl,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            setProfile(fallbackProfile);
            setDisplayName(fallbackProfile.displayName);
            setProfileImageUrl(fallbackProfile.profileImageUrl || '');
            
            toast({
              title: 'Profile Setup',
              description: 'Please complete your profile information to continue',
              variant: 'default',
            });
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        
        // Fallback: Create a basic profile from Clerk data
        const fallbackProfile = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          displayName: user.fullName || user.firstName || user.username || 'User',
          profileImageUrl: user.imageUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setProfile(fallbackProfile);
        setDisplayName(fallbackProfile.displayName);
        setProfileImageUrl(fallbackProfile.profileImageUrl || '');
        
        toast({
          title: 'Profile Setup',
          description: 'Please complete your profile information to continue',
          variant: 'default',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserProfile();
  }, [user, setProfile, toast]);

  const handleSave = async () => {
    if (!user || !displayName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a display name',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const updates = {
        displayName: displayName.trim(),
        profileImageUrl: profileImageUrl || null,
      };

      const response = await api.updateUser(user.id, updates);

      if (response.success && response.user) {
        updateProfile(response.user);
        toast({
          title: 'Success',
          description: 'Profile updated successfully!',
        });
        onComplete?.();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Setup Your Profile
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Customize your display name and profile picture
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Profile Picture URL (optional)
          </label>
          <div className="flex items-center gap-4">
            {profileImageUrl && (
              <Image
                src={profileImageUrl}
                alt="Profile preview"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover"
              />
            )}
            <Input
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="rounded-2xl"
            />
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Display Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="rounded-2xl"
            maxLength={50}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            This is how your name will appear in chat rooms
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={loading || !displayName.trim()}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}