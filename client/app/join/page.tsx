'use client';

import { useState } from 'react';
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

export default function JoinPage() {
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUserStore();

  const handleCheckRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setCodeError('');
    setRoomExists(null);
    
    // Validate room code
    const validation = roomCodeSchema.safeParse({ code: roomCode.trim() });
    if (!validation.success) {
      setCodeError(validation.error.errors[0].message);
      return;
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
    
    setIsJoining(true);
    
    // Save user info and navigate to chat
    setUser(name.trim(), roomCode.toUpperCase());
    router.push(`/chat/${roomCode.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-teal-500/10" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-slate-300 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="glass-dark border-slate-700/50 shadow-2xl animate-slide-up">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3 text-slate-100">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2 rounded-lg">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
                Join a Classroom
              </CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Enter the room code provided by your teacher
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Code Entry */}
              {roomExists === null && (
                <form onSubmit={handleCheckRoom} className="space-y-4">
                  <div>
                    <label htmlFor="roomCode" className="block text-sm font-medium mb-2 text-slate-300">
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
                      placeholder="Enter 10-character code"
                      className={`font-mono text-lg tracking-wider bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 ${codeError ? 'border-red-500' : ''}`}
                      maxLength={10}
                      disabled={isChecking}
                      required
                    />
                    {codeError && (
                      <p className="text-sm text-red-400 mt-1">{codeError}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                    disabled={isChecking || roomCode.length !== 10}
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

              {/* Name Entry (shown after room is found) */}
              {roomExists && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 p-4 rounded-xl backdrop-blur-sm glow-teal">
                    <p className="text-sm text-emerald-300">
                      ✓ Room <span className="font-mono font-bold text-emerald-100">{roomCode}</span> found!
                    </p>
                  </div>

                  <form onSubmit={handleJoinRoom} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-slate-300">
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
                        className={`bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 ${nameError ? 'border-red-500' : ''}`}
                        disabled={isJoining}
                        required
                      />
                      {nameError && (
                        <p className="text-sm text-red-400 mt-1">{nameError}</p>
                      )}
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="policy"
                        checked={agreedToPolicy}
                        onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
                        disabled={isJoining}
                        className="border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                      />
                      <label
                        htmlFor="policy"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                      >
                        I agree to keep the chat respectful and appropriate
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setRoomExists(null);
                          setRoomCode('');
                          setName('');
                          setAgreedToPolicy(false);
                        }}
                        disabled={isJoining}
                        className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      >
                        Change Code
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300"
                        disabled={isJoining || !name.trim() || !agreedToPolicy}
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
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-sm text-red-300">
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
                    className="w-full bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Try Another Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
