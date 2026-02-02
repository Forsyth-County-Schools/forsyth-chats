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
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function JoinPage() {
  const { user } = useUser();
  const { profile } = useUserStore();
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [schoolInfo, setSchoolInfo] = useState<{ name: string; category: string } | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUserStore();

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
    
    setIsJoining(true);
    
    try {
      const response = await api.joinRoom({
        roomCode: roomCode.trim(),
        name: name.trim(),
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
      <SignedIn>
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 relative">
        {/* Modern gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.03)_25%,rgba(147,51,234,0.03)_50%,transparent_50%,transparent_75%,rgba(147,51,234,0.03)_75%)] dark:bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.08)_25%,rgba(147,51,234,0.08)_50%,transparent_50%,transparent_75%,rgba(147,51,234,0.08)_75%)] bg-[length:20px_20px]" />
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/20 dark:border-slate-700/50 p-1 shadow-lg">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-16 max-w-2xl relative z-10">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 mb-8 transition-all duration-200 group">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-lg group-hover:shadow-xl transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
            <div className="text-center space-y-6 mb-8">
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-6 rounded-3xl shadow-2xl relative group">
                  <LogIn className="h-12 w-12 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Join Classroom
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Enter the secure room code to join the discussion 💬
                </p>
              </div>
            </div>
            {/* Room Code Form */}
            {roomExists === null && (
              <form onSubmit={handleCheckRoom} className="space-y-8">
                <div className="space-y-5">
                  <label htmlFor="roomCode" className="text-xl font-semibold block text-center text-slate-900 dark:text-white">
                    🔐 Enter Room Code
                  </label>
                  <div className="relative group">
                    <Input
                      id="roomCode"
                      type="text"
                      value={roomCode}
                      onChange={(e) => {
                        setRoomCode(e.target.value.toUpperCase());
                        setCodeError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && roomCode.trim() && !isChecking) {
                          handleCheckRoom(e as any);
                        }
                      }}
                      placeholder="ABC-123DEF"
                      maxLength={10}
                      autoComplete="off"
                      className="w-full text-2xl py-6 px-6 text-center tracking-wider font-bold border-2 border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 group-hover:shadow-lg focus:shadow-xl"
                      disabled={isChecking}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {codeError && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                      <p className="text-red-600 dark:text-red-400 text-sm font-semibold text-center flex items-center justify-center gap-2">
                        <span>⚠️</span> {codeError}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-xl py-6 font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all duration-300"
                  disabled={isChecking || !roomCode.trim()}
                >
                  {isChecking ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀 Check Room</span>
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Join Form (shown when room exists) */}
            {roomExists === true && (
              <div className="space-y-8 slide-up">
                <div className="relative">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 relative overflow-hidden">
                    {/* Success animation background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse" />
                    <div className="relative z-10 text-center">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="text-green-700 dark:text-green-400 font-bold text-lg mb-2">
                        ✅ Classroom Found!
                      </p>
                      {schoolInfo && (
                        <div className="bg-white dark:bg-gray-900/50 rounded-xl p-3 border border-green-200 dark:border-green-700">
                          <p className="font-semibold text-green-800 dark:text-green-300">
                            📚 {schoolInfo.name}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 capitalize">
                            {schoolInfo.category} School
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleJoinRoom} className="space-y-6">
                  <div className="space-y-4">
                    <label htmlFor="name" className="text-xl font-black block text-center" style={{color: 'var(--foreground)'}}>
                      👤 Your Name
                    </label>
                    <div className="relative group">
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && name.trim() && agreedToPolicy && !isJoining) {
                            handleJoinRoom(e as any);
                          }
                        }}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        className="modern-input text-xl py-6 text-center border-2 rounded-2xl transition-all duration-300 group-hover:shadow-lg focus:shadow-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                        style={{
                          backgroundColor: 'var(--input-background)',
                          borderColor: nameError ? '#EF4444' : 'var(--input-border)',
                          color: 'var(--foreground)'
                        }}
                        disabled={isJoining}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
                    </div>
                    {nameError && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-shake">
                        <p className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">⚠️ {nameError}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-6">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          id="policy"
                          checked={agreedToPolicy}
                          onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
                          disabled={isJoining}
                          className="mt-1 h-6 w-6 rounded border-2 border-gray-400 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 cursor-pointer focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setAgreedToPolicy(!agreedToPolicy);
                            }
                          }}
                        />
                        <label 
                          htmlFor="policy" 
                          className="text-base leading-relaxed cursor-pointer flex-1 select-none" 
                          style={{color: 'var(--foreground)'}}
                          onClick={() => setAgreedToPolicy(!agreedToPolicy)}
                        >
                          <span className="font-bold text-blue-700 dark:text-blue-300">📋 I agree to:</span><br/>
                          Keep the classroom chat respectful and appropriate for educational purposes. 
                          I understand that all conversations may be monitored and inappropriate 
                          behavior will result in immediate removal.
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRoomExists(null);
                        setName('');
                        setNameError('');
                        setAgreedToPolicy(false);
                      }}
                      disabled={isJoining}
                      className="py-4 text-lg font-semibold border-2 border-red-200 hover:border-red-300 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      ↩️ Change Code
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-green-500/25"
                      disabled={isJoining || !name.trim() || !agreedToPolicy}
                    >
                      {isJoining ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        '🚀 Join Classroom'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Room Not Found */}
            {roomExists === false && (
              <div className="space-y-6 slide-up">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-rose-400/10 animate-pulse" />
                  <div className="relative z-10">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-3">
                      Room Not Found
                    </h3>
                    <p className="text-red-600 dark:text-red-300 mb-6 leading-relaxed">
                      The room code might be incorrect, expired, or the classroom may have ended.
                      Please double-check the code with your teacher.
                    </p>
                    <div className="bg-white dark:bg-gray-900/50 rounded-xl p-4 border border-red-200 dark:border-red-700">
                      <p className="text-sm text-red-500 dark:text-red-400">
                        💡 <strong>Tip:</strong> Room codes are case-sensitive and usually in ABC-123DEF format
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setRoomExists(null);
                    setRoomCode('');
                    setCodeError('');
                  }}
                  className="w-full py-6 text-lg font-bold border-2 border-red-200 hover:border-red-300 rounded-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 hover:shadow-xl"
                >
                  🔄 Try Another Code
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      </SignedIn>
      
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 relative">
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-purple-200 dark:border-purple-800 rounded-3xl p-8 shadow-2xl max-w-md w-full">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🔒</div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Authentication Required
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Please sign in to join a classroom chat room.
                </p>
              </div>
              
              <div className="space-y-4">
                <SignInButton mode="modal">
                  <Button className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg">
                    🚪 Sign In
                  </Button>
                </SignInButton>
                
                <SignUpButton mode="modal">
                  <Button variant="outline" className="w-full py-6 text-lg font-bold border-2 border-purple-200 hover:border-purple-300 rounded-2xl transition-all duration-300 hover:scale-[1.02]">
                    ✨ Create Account
                  </Button>
                </SignUpButton>
                
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/'}
                  className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ← Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </GeoBlockWrapper>
  );
}
