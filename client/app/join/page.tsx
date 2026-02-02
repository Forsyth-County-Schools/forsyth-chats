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
    <main className="page-container">
      <div className="w-full max-w-2xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="card-modern p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 modern-shadow">
              <LogIn className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-3">Join a Classroom</h1>
            <p className="text-lg text-gray-600">
              Enter the room code provided by your teacher
            </p>
          </div>

          {/* Room Code Entry */}
          {roomExists === null && (
            <form onSubmit={handleCheckRoom} className="space-y-6">
              <div>
                <label htmlFor="roomCode" className="block text-lg font-semibold mb-3 text-gray-900">
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
                  className={`modern-input font-mono text-xl tracking-wider text-center py-4 ${codeError ? 'border-red-500 focus:border-red-500' : ''}`}
                  maxLength={10}
                  disabled={isChecking}
                  required
                />
                {codeError && (
                  <p className="text-sm text-red-600 mt-2 font-medium">{codeError}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="btn-red-primary w-full text-lg py-4 font-bold"
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
            <div className="space-y-6 animate-slide-up">
              <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
                <p className="text-green-800 font-semibold text-lg">
                  ✓ Room <span className="font-mono font-bold text-green-900">{roomCode}</span> found!
                </p>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-lg font-semibold mb-3 text-gray-900">
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
                    disabled={isJoining}
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
                    disabled={isJoining}
                    className="mt-1 border-gray-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <label
                    htmlFor="policy"
                    className="text-base leading-relaxed text-gray-700 font-medium"
                  >
                    I agree to keep the chat respectful and appropriate
                  </label>
                </div>

                <div className="flex gap-4">
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
                    className="btn-red-outline flex-1 py-4"
                  >
                    Change Code
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="btn-red-primary flex-2 text-lg py-4 font-bold"
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
            <div className="space-y-6 animate-slide-up">
              <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
                <p className="text-red-800 font-semibold text-lg">
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
        </div>
      </div>
    </main>
  );
}
