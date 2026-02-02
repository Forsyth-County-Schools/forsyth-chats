'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useUserStore } from '@/lib/store';
import { nameSchema, roomCodeSchema } from '@/lib/validations';
import { ThemeToggle } from '@/components/ThemeToggle';
import { parseSchoolCode } from '@/lib/schools';
import { validateUserName } from '@/lib/security';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function JoinPage() {
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [schoolInfo, setSchoolInfo] = useState<{ name: string; category: string } | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUserStore();

  useEffect(() => {
    // Handle Turnstile callback
    const handleTurnstileSuccess = (event: any) => {
      setTurnstileToken(event.detail);
    };
    
    window.addEventListener('turnstileSuccess', handleTurnstileSuccess);
    return () => window.removeEventListener('turnstileSuccess', handleTurnstileSuccess);
  }, []);

  const handleCheckRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setCodeError('');
    setRoomExists(null);
    
    // Validate room code and extract school information
    const validation = roomCodeSchema.safeParse({ code: roomCode.trim() });
    if (!validation.success) {
      setCodeError(validation.error.errors[0].message);
      return;
    }
    
    // Parse school information from code
    const { school } = parseSchoolCode(roomCode.trim());
    if (school) {
      setSchoolInfo({ name: school.name, category: school.category });
    }
    
    setIsChecking(true);
    
    try {
      const response = await api.checkRoom(roomCode.trim());
      
      if (response.exists) {
        setRoomExists(true);
        toast({
          title: 'Room Found!',
          description: 'Enter your name to join the classroom',
        });
      } else {
        setRoomExists(false);
        setCodeError('Room not found. Please check the code and try again.');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to check room',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setNameError('');
    
    // Validate name with enhanced security
    const nameValidation = validateUserName(name.trim());
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error!);
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
        title: 'Security Verification Required',
        description: 'Please complete the security verification',
        variant: 'destructive',
      });
      return;
    }
    
    setIsJoining(true);
    
    try {
      const response = await api.joinRoom({
        roomCode: roomCode.trim(),
        name: name.trim(),
        turnstileToken,
      });
      
      // Set user in store
      setUser(response.user.name, roomCode.trim());
      
      // Navigate to chat
      router.push(`/chat/${roomCode.trim()}`);
    } catch (error) {
      toast({
        title: 'Failed to Join',
        description: error instanceof Error ? error.message : 'An error occurred while joining the room',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <GeoBlockWrapper>
      <main className="min-h-screen transition-colors duration-300" style={{backgroundColor: 'var(--background)'}}>
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <Card className="card-modern">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-red-600 p-6 rounded-2xl modern-shadow">
                  <LogIn className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold" style={{color: 'var(--foreground)'}}>
                Join Forsyth County Classroom
              </CardTitle>
              <CardDescription className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                Enter your teacher's room code to join the secure classroom chat
              </CardDescription>
            </CardHeader>

          <CardContent className="space-y-8">
            {/* Room Code Form */}
            {roomExists === null && (
              <form onSubmit={handleCheckRoom} className="space-y-6 animate-slide-up">
                <div className="space-y-3">
                  <label htmlFor="roomCode" className="text-lg font-semibold block" style={{color: 'var(--foreground)'}}>
                    Room Code
                  </label>
                  <Input
                    id="roomCode"
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      setCodeError('');
                    }}
                    placeholder="Enter 10-character room code"
                    maxLength={10}
                    autoComplete="off"
                    className="modern-input text-lg py-4 text-center tracking-wider font-mono"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--foreground)'
                    }}
                    disabled={isChecking}
                  />
                  {codeError && (
                    <p className="text-red-600 text-sm font-medium">{codeError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="btn-red-primary w-full text-lg py-4 font-semibold"
                  disabled={isChecking || !roomCode.trim()}
                >
                  {isChecking ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Checking...</span>
                    </>
                  ) : (
                    'Check Room'
                  )}
                </Button>
              </form>
            )}

            {/* Join Form (shown when room exists) */}
            {roomExists === true && (
              <div className="space-y-6 animate-slide-up">
                <div className="success-box">
                  <p className="text-green-700 dark:text-green-400 font-semibold text-lg">
                    ✓ Room found! {schoolInfo && (
                      <span className="block text-sm mt-1">
                        {schoolInfo.name} ({schoolInfo.category.charAt(0).toUpperCase() + schoolInfo.category.slice(1)})
                      </span>
                    )}
                  </p>
                </div>

                <form onSubmit={handleJoinRoom} className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="name" className="text-lg font-semibold block" style={{color: 'var(--foreground)'}}>
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
                      autoComplete="name"
                      className="modern-input text-lg py-4"
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--foreground)'
                      }}
                      disabled={isJoining}
                    />
                    {nameError && (
                      <p className="text-red-600 text-sm font-medium">{nameError}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="policy"
                        checked={agreedToPolicy}
                        onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
                        disabled={isJoining}
                      />
                      <label htmlFor="policy" className="text-sm leading-relaxed cursor-pointer" style={{color: 'var(--foreground-secondary)'}}>
                        I agree to keep the chat respectful and appropriate for a classroom environment. 
                        I understand that inappropriate behavior may result in removal from the chat.
                      </label>
                    </div>
                  </div>

                  {/* Cloudflare Turnstile */}
                  <div className="flex justify-center">
                    <div 
                      className="cf-turnstile" 
                      data-sitekey="0x4AAAAAACW20p-WO0bwShk2"
                      data-callback="onTurnstileSuccess"
                    ></div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRoomExists(null);
                        setName('');
                        setNameError('');
                        setAgreedToPolicy(false);
                        setTurnstileToken('');
                      }}
                      disabled={isJoining}
                      className="btn-red-outline flex-1 py-4"
                    >
                      Change Code
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="btn-red-primary flex-2 text-lg py-4 font-bold"
                      disabled={isJoining || !name.trim() || !agreedToPolicy || !turnstileToken}
                    >
                      {isJoining ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Joining...</span>
                        </>
                      ) : (
                        'Join Classroom'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Room Not Found */}
            {roomExists === false && (
              <div className="space-y-6 animate-slide-up">
                <div className="success-box">
                  <p className="text-red-600 font-semibold text-lg">
                    ✗ Room not found. The code might be incorrect or the room may have expired.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setRoomExists(null);
                    setRoomCode('');
                    setCodeError('');
                  }}
                  className="btn-red-outline w-full py-4 text-lg font-semibold"
                >
                  Try Another Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Turnstile Success Handler Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.onTurnstileSuccess = function(token) {
            window.dispatchEvent(new CustomEvent('turnstileSuccess', { detail: token }));
          };
        `
      }} />
    </main>
    </GeoBlockWrapper>
  );
}
