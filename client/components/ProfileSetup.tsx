'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { api, UserProfile } from '@/lib/api';
import { useUserStore } from '@/lib/store';
import { Upload, User, Save } from 'lucide-react';

interface ProfileSetupProps {
  onComplete?: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user } = useUser();
  const { profile, setProfile, updateProfile } = useUserStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  useEffect(() => {
    const loadUserProfile = async (retryCount = 0) => {
      if (!user) return;

      try {
        // First check if user exists in our database
        const response = await api.getUser(user.id);
        
        if (response.success && response.user) {
          setProfile(response.user);
          setDisplayName(response.user.displayName);
          setProfileImageUrl(response.user.profileImageUrl || '');
          setInitialLoading(false);
          return;
        }
      } catch (error) {
        console.warn('Error checking existing user:', error);
        // Continue to create user if lookup fails
      }

      // User doesn't exist or lookup failed - create new user
      try {
        const newUserData = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          displayName: user.fullName || user.firstName || 'User',
          profileImageUrl: user.imageUrl,
        };

        const createResponse = await api.createOrUpdateUser(newUserData);
        if (createResponse.success && createResponse.user) {
          setProfile(createResponse.user);
          setDisplayName(createResponse.user.displayName);
          setProfileImageUrl(createResponse.user.profileImageUrl || '');
          setInitialLoading(false);
          setRetryAttempt(0); // Reset retry count on success
        } else {
          throw new Error('Failed to create user profile');
        }
      } catch (error) {
        console.error('Error creating user profile:', error);
        
        // Retry logic with exponential backoff (max 3 retries)
        // Delays: attempt 1=1s, attempt 2=2s, attempt 3=4s
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying user creation in ${delay}ms (attempt ${retryCount + 1}/3)...`);
          setRetryAttempt(retryCount + 1);
          setTimeout(() => loadUserProfile(retryCount + 1), delay);
        } else {
          // Max retries reached - show error to user
          setLoadError(true);
          toast({
            title: 'Error Creating Profile',
            description: 'Unable to create your profile automatically. Please try again or contact support.',
            variant: 'destructive',
          });
          setInitialLoading(false);
          setRetryAttempt(0);
        }
      }
    };

    loadUserProfile();
  }, [user, setProfile, toast, retryTrigger]);

  const handleManualRetry = () => {
    setLoadError(false);
    setInitialLoading(true);
    setRetryAttempt(0);
    // Trigger useEffect to re-run by updating retryTrigger
    setRetryTrigger(prev => prev + 1);
  };

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
        <LoadingSpinner 
          size="lg" 
          text={retryAttempt > 0 
            ? `Setting up profile... (retry ${retryAttempt}/3)` 
            : "Loading profile..."}
        />
      </div>
    );
  }

  // Show error state with retry button if profile loading failed
  if (loadError) {
    return (
      <Card className="p-8 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Profile Setup Error
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We couldn't automatically create your profile. This might be a temporary connection issue.
          </p>
          <Button
            onClick={handleManualRetry}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            Try Again
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            If this problem persists, please contact support.
          </p>
        </div>
      </Card>
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
              <img
                src={profileImageUrl}
                alt="Profile preview"
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