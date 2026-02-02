'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useUserStore } from '@/lib/store';
import { nameSchema } from '@/lib/validations';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function CreatePage() {
  const [roomCode, setRoomCode] = useState<string>('');
  const [name, setName] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nameError, setNameError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUserStore();

  useEffect(() => {
    createRoom();
    
    // Handle Turnstile callback
    const handleTurnstileSuccess = (event: any) => {
      setTurnstileToken(event.detail);
    };
    
    window.addEventListener('turnstileSuccess', handleTurnstileSuccess);
    return () => window.removeEventListener('turnstileSuccess', handleTurnstileSuccess);
  }, []);

  const createRoom = async () => {
    try {
      setIsLoading(true);
      const response = await api.createRoom();
      
      if (response.success && response.code) {
        setRoomCode(response.code);
      } else {
        throw new Error(response.message || 'Failed to create room');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create room',
        variant: 'destructive',
      });
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Room code copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setNameError('');
    
    // Validate name
    const validation = nameSchema.safeParse({ name: name.trim() });
    if (!validation.success) {
      setNameError(validation.error.errors[0].message);
      return;
    }
    
    if (!agreedToPolicy) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to keep the chat respectful',
        variant: 'destructive',
      });
      return;
    }
    
    if (!turnstileToken) {
      toast({
        title: 'Verification Required',
        description: 'Please complete the security verification',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreating(true);
    
    // Save user info and navigate to chat
    setUser(name.trim(), roomCode);
    router.push(`/chat/${roomCode}`);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="lg" text="Creating your classroom..." />
      </div>
    );
  }

  return (
    <main className="page-container">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-2xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 transition-colors duration-300" style={{color: 'var(--foreground-secondary)'}}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="card-modern p-8 animate-scale-in">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="bg-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-soft modern-shadow">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-4xl font-black mb-3" style={{color: 'var(--foreground)'}}>Classroom Created!</h1>
            <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
              Share this code with your students to let them join
            </p>
          </div>

          {/* Room Code Display */}
          <div className="success-box mb-8 animate-slide-up">
            <p className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wider">Your Room Code</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-5xl font-black font-mono tracking-wider text-red-600">
                {roomCode}
              </div>
              <Button
                onClick={handleCopyCode}
                className={copied ? "btn-red-primary" : "btn-red-outline"}
                size="lg"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-lg font-semibold mb-3" style={{color: 'var(--foreground)'}}>
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                placeholder="Enter your name"
                className={`modern-input text-lg py-4 ${nameError ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isCreating}
                required
              />
              {nameError && (
                <p className="text-sm text-red-600 mt-2 font-medium">{nameError}</p>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="policy"
                checked={agreedToPolicy}
                onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
                disabled={isCreating}
                className="mt-1 border-gray-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <label
                htmlFor="policy"
                className="text-base leading-relaxed font-medium" style={{color: 'var(--foreground-secondary)'}}
              >
                I agree to keep the chat respectful and appropriate
              </label>
            </div>

            {/* Turnstile Widget */}
            <div className="flex justify-center">
              <div
                className="cf-turnstile"
                data-sitekey="0x4AAAAAACW20p-WO0bwShk2"
                data-callback="onTurnstileSuccess"
                data-theme="auto"
              ></div>
            </div>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.onTurnstileSuccess = function(token) {
                    window.turnstileToken = token;
                    const event = new CustomEvent('turnstileSuccess', { detail: token });
                    window.dispatchEvent(event);
                  };
                `,
              }}
            />

            <Button
              type="submit"
              size="lg"
              className="btn-red-primary w-full text-lg py-4 font-bold"
              disabled={isCreating || !name.trim() || !agreedToPolicy || !turnstileToken}
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Joining...</span>
                </>
              ) : (
                'Join Classroom'
              )}
            </Button>
          </form>

          <div className="success-box mt-8">
            <p style={{color: 'var(--foreground-secondary)'}}>
              💡 <strong style={{color: 'var(--foreground)'}}>Tip:</strong> This room will be automatically deleted after 24 hours.
              Make sure to save any important information before then.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
