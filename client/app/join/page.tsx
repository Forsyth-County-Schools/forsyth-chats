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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2">
                <LogIn className="h-8 w-8" />
                Join a Classroom
              </CardTitle>
              <CardDescription>
                Enter the room code provided by your teacher
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Code Entry */}
              {roomExists === null && (
                <form onSubmit={handleCheckRoom} className="space-y-4">
                  <div>
                    <label htmlFor="roomCode" className="block text-sm font-medium mb-2">
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
                      className={`font-mono text-lg tracking-wider ${codeError ? 'border-destructive' : ''}`}
                      maxLength={10}
                      disabled={isChecking}
                      required
                    />
                    {codeError && (
                      <p className="text-sm text-destructive mt-1">{codeError}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
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
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Room <span className="font-mono font-bold">{roomCode}</span> found!
                    </p>
                  </div>

                  <form onSubmit={handleJoinRoom} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
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
                        className={nameError ? 'border-destructive' : ''}
                        disabled={isJoining}
                        required
                      />
                      {nameError && (
                        <p className="text-sm text-destructive mt-1">{nameError}</p>
                      )}
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="policy"
                        checked={agreedToPolicy}
                        onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
                        disabled={isJoining}
                      />
                      <label
                        htmlFor="policy"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                      >
                        Change Code
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1"
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
                  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                    <p className="text-sm text-destructive">
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
                    className="w-full"
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
