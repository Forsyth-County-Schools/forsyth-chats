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
      <main className="min-h-screen transition-colors duration-300 relative overflow-hidden" style={{backgroundColor: 'var(--background)'}}>
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-red-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}} />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-red-400/25 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}} />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 py-16 max-w-6xl">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <Card className="card-glass border-0 shadow-2xl relative overflow-hidden animate-fade-in rounded-3xl w-full">
            {/* Animated background pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-purple-500/5 to-red-600/5 animate-shimmer" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 animate-shimmer" />
            </div>
            
            <CardHeader className="text-center space-y-6 relative z-10">
              <div className="flex justify-center mb-2">
                <div className="relative group">
                  <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8 rounded-3xl shadow-2xl relative z-10 transform group-hover:scale-105 transition-all duration-300">
                    <LogIn className="h-16 w-16 text-white drop-shadow-lg" />
                  </div>
                  {/* Enhanced floating effects */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20 rounded-full blur-xl animate-ping" />
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 via-red-700/30 to-red-600/30 rounded-full blur-lg animate-pulse" />
                  <div className="absolute -inset-2 bg-red-500/40 rounded-full blur-sm animate-pulse" style={{animationDelay: '0.5s'}} />
                </div>
              </div>
              <div className="space-y-4">
                <CardTitle className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent drop-shadow-sm">
                  Join Forsyth County Classroom
                </CardTitle>
                <CardDescription className="text-xl leading-relaxed max-w-md mx-auto" style={{color: 'var(--foreground-secondary)'}}>
                  Enter the secure room code to join the discussion 💬
                </CardDescription>
                {/* Animated decorative line */}
                <div className="flex items-center justify-center space-x-3 pt-4">
                  <div className="h-1.5 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse" />
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                  <div className="h-2 w-2 bg-red-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  <div className="h-2 w-2 bg-red-700 rounded-full animate-bounce" style={{animationDelay: '0.3s'}} />
                  <div className="h-1.5 w-12 bg-gradient-to-l from-red-500 to-red-600 rounded-full animate-pulse" />
                </div>
              </div>
            </CardHeader>

          <CardContent className="space-y-8 px-8 lg:px-12 py-10">
            {/* Room Code Form */}
            {roomExists === null && (
              <form onSubmit={handleCheckRoom} className="space-y-8 animate-slide-up">
                <div className="space-y-5">
                  <label htmlFor="roomCode" className="text-xl font-black block text-center bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
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
                      placeholder="ABC-123DEF"
                      maxLength={10}
                      autoComplete="off"
                      className="modern-input text-2xl py-6 text-center tracking-[0.3em] font-bold border-2 rounded-2xl transition-all duration-300 group-hover:shadow-lg focus:shadow-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: codeError ? '#EF4444' : 'var(--input-border)',
                        color: 'var(--foreground)',
                        letterSpacing: '0.1em'
                      }}
                      disabled={isChecking}
                    />
                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
                  </div>
                  {codeError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-shake">
                      <p className="text-red-600 dark:text-red-400 text-sm font-semibold text-center">⚠️ {codeError}</p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-xl py-6 font-bold rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-500/25"
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          id="policy"
                          checked={agreedToPolicy}
                          onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
                          disabled={isJoining}
                          className="mt-1 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                        />
                        <label htmlFor="policy" className="text-sm leading-relaxed cursor-pointer flex-1" style={{color: 'var(--foreground-secondary)'}}>
                          <span className="font-semibold text-blue-700 dark:text-blue-300">📋 I agree to:</span><br/>
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
          </CardContent>
        </Card>
      </div>

        </div>
      </main>
    </GeoBlockWrapper>
  );
}
