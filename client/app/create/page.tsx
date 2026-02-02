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

export default function CreatePage() {
  const [roomCode, setRoomCode] = useState<string>('');
  const [name, setName] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nameError, setNameError] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUserStore();

  useEffect(() => {
    createRoom();
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
    
    setIsCreating(true);
    
    // Save user info and navigate to chat
    setUser(name.trim(), roomCode);
    router.push(`/chat/${roomCode}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Creating your classroom..." />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-purple-500/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
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
              <CardTitle className="text-3xl text-slate-100 flex items-center gap-3">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-500 p-2 rounded-lg">
                  <span className="text-2xl">🎉</span>
                </div>
                Classroom Created!
              </CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Share this code with your students to let them join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Code Display */}
              <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 p-6 rounded-xl border border-teal-500/30 backdrop-blur-sm glow-teal">
                <p className="text-sm text-teal-300 mb-2 font-medium">Your Room Code</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-4xl font-bold font-mono tracking-wider text-teal-100 animate-pulse-glow">
                      {roomCode}
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="lg"
                    className="gap-2 bg-slate-800 border-teal-500 text-teal-400 hover:bg-teal-600 hover:text-white hover:border-teal-400 transition-all duration-300"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Join Form */}
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
                    disabled={isCreating}
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
                    disabled={isCreating}
                    className="border-slate-600 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                  />
                  <label
                    htmlFor="policy"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                  >
                    I agree to keep the chat respectful and appropriate
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300"
                  disabled={isCreating || !name.trim() || !agreedToPolicy}
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

              <div className="glass-dark p-4 rounded-xl border border-slate-700/50">
                <p className="text-sm text-slate-400">
                  💡 <strong className="text-slate-300">Tip:</strong> This room will be automatically deleted after 24 hours.
                  Make sure to save any important information before then.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
