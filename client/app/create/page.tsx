'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Lock, Clock, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { useUserStore } from '@/lib/store';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';
import { toast } from '@/components/ui/use-toast';
import { useToast } from '@/components/ui/use-toast';
import { FORSYTH_SCHOOLS, SCHOOLS_BY_CATEGORY, generateSchoolCode } from '@/lib/schools';
import { validateUserName } from '@/lib/security';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Force dynamic rendering to avoid Clerk prerendering issues
export const dynamic = 'force-dynamic';

export default function CreatePage() {
  const { user, isSignedIn } = useUser();
  const { profile } = useUserStore();
  const [creatorName, setCreatorName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [agreedToDistrictPolicy, setAgreedToDistrictPolicy] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState('');
  const [schoolError, setSchoolError] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [createdSchoolName, setCreatedSchoolName] = useState('');
  
  // Rate limiting states
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUserStore();

  // Auto-populate name when user is signed in
  useEffect(() => {
    if (isSignedIn && (profile?.displayName || user?.fullName || user?.firstName || user?.username)) {
      const name = profile?.displayName || user?.fullName || user?.firstName || user?.username || '';
      setCreatorName(name);
    }
  }, [isSignedIn, profile, user]);

  // Check for existing cooldown on component mount
  useEffect(() => {
    const lastCreatedTime = localStorage.getItem('lastRoomCreatedTime');
    if (lastCreatedTime) {
      const timeSinceLastCreation = Date.now() - parseInt(lastCreatedTime);
      const cooldownDuration = 60 * 1000; // 60 seconds in milliseconds
      
      if (timeSinceLastCreation < cooldownDuration) {
        setIsOnCooldown(true);
        setCooldownTimeLeft(Math.ceil((cooldownDuration - timeSinceLastCreation) / 1000));
        
        // Start countdown timer
        const timer = setInterval(() => {
          setCooldownTimeLeft(prev => {
            if (prev <= 1) {
              setIsOnCooldown(false);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, []);

  const navigateToChat = () => {
    router.push(`/chat/${createdRoomCode}`);
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(createdRoomCode);
      toast({
        title: 'Room Code Copied!',
        description: 'Share this code with your friends to join the chat.',
      });
    } catch (error) {
      console.error('Failed to copy room code:', error);
      toast({
        title: 'Copy Failed',
        description: 'Please manually copy the room code.',
        variant: 'destructive',
      });
    }
  };

  const shareOnGoogleDocs = () => {
    const docContent = `
Forsyth County Schools Classroom Chat
=====================================

Room Code: ${createdRoomCode}
School: ${createdSchoolName}
Created by: ${creatorName}

How to Join:
1. Go to the classroom chat website
2. Click "Join Classroom"
3. Enter the room code: ${createdRoomCode}
4. Sign in with your school account

Important Notes:
- This room is only for Forsyth County Schools students
- Keep the room code private and only share with authorized friends
- Teacher supervision is required
- Follow all school district policies and guidelines

Created on: ${new Date().toLocaleDateString()}
    `.trim();

    const encodedContent = encodeURIComponent(docContent);
    const googleDocsUrl = `https://docs.google.com/document/create?title=Classroom_Room_${createdRoomCode}&content=${encodedContent}`;
    
    window.open(googleDocsUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting first
    if (isOnCooldown) {
      toast({
        title: 'Please Wait',
        description: `You can create another classroom in ${cooldownTimeLeft} seconds`,
        variant: 'destructive',
      });
      return;
    }
    
    // Reset errors
    setNameError('');
    setSchoolError('');
    
    // Validate name with enhanced security
    const nameValidation = validateUserName(creatorName.trim());
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error!);
      return;
    }
    
    // Validate school selection
    if (!selectedSchool) {
      setSchoolError('Please select your Forsyth County School');
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

    if (!agreedToDistrictPolicy) {
      toast({
        title: 'District Policy Required',
        description: 'Please agree to the Forsyth County Schools Acceptable Use Policy',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Find the selected school and generate school-aware code
      const school = FORSYTH_SCHOOLS.find(s => s.name === selectedSchool)!;
      const schoolCode = generateSchoolCode(school.abbreviation);
      
      // For now, use the existing API and store additional data client-side
      // TODO: Update backend API to accept school information
      const response = await api.createRoom(creatorName.trim());
      
      if (response.success && response.code) {
        // Set user in store
        setUser(creatorName.trim(), response.code);
        
        // Store school information in localStorage for this room
        // In production, this should be stored server-side
        if (typeof window !== 'undefined') {
          const roomData = {
            code: response.code,
            school: selectedSchool,
            schoolAbbrev: school.abbreviation,
            creator: creatorName.trim(),
            created: new Date().toISOString(),
          };
          localStorage.setItem(`room_${response.code}`, JSON.stringify(roomData));
        }
        
        // Set success state
        setCreatedRoomCode(response.code);
        setCreatedSchoolName(school.name);
        setRoomCreated(true);
        
        // Set rate limiting cooldown
        localStorage.setItem('lastRoomCreatedTime', Date.now().toString());
        setIsOnCooldown(true);
        setCooldownTimeLeft(60); // 60 seconds
        
        // Start cooldown timer
        const cooldownTimer = setInterval(() => {
          setCooldownTimeLeft(prev => {
            if (prev <= 1) {
              setIsOnCooldown(false);
              clearInterval(cooldownTimer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        toast({
          title: '🎉 Classroom Created!',
          description: `Your ${school.name} classroom is ready`,
        });
      } else {
        throw new Error(response.message || 'Failed to create classroom');
      }
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'An error occurred while creating the classroom',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <GeoBlockWrapper>
      <main className="min-h-screen bg-black relative">
        {/* Ultra dark gradient background with minimal accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.03)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.01)_25%,rgba(59,130,246,0.01)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.01)_75%)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-transparent to-slate-900/50" />
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-white/20 dark:border-slate-700/50 p-1 shadow-lg">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-16 max-w-2xl relative z-10">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 mb-8 transition-all duration-200 group">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-lg group-hover:shadow-xl transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Home</span>
          </Link>

          <SignedIn>
            {!roomCreated ? (
              <div className="bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
                <div className="text-center space-y-6 mb-8">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 rounded-3xl shadow-2xl relative group">
                      <Plus className="h-12 w-12 text-white drop-shadow-lg" />
                      <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                      Create Classroom
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                      Set up a secure chat room for your Forsyth County Schools class 🏫
                    </p>
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      ✅ Signed in as {profile?.displayName || user?.fullName || user?.firstName || user?.username}
                    </div>
                  </div>
                  
                  {/* Rate limiting notice */}
                  {isOnCooldown && (
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 rounded-2xl">
                          <span className="text-2xl">⏳</span>
                        </div>
                        <div>
                          <p className="font-semibold text-amber-800 dark:text-amber-200">
                            Rate Limit Active
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            You can create another classroom in {cooldownTimeLeft} seconds
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Creator Name */}
                  <div className="space-y-4">
                    <label htmlFor="creatorName" className="text-lg font-semibold block text-slate-900 dark:text-white">
                      👤 Your Name <span className="text-sm text-green-600 dark:text-green-400">(✓ Verified)</span>
                    </label>
                    <div className="relative group">
                      <Input
                        id="creatorName"
                        name="creatorName"
                        type="text"
                        value={creatorName}
                        onChange={(e) => {
                          if (!isSignedIn) {
                            setCreatorName(e.target.value);
                            setNameError('');
                          }
                        }}
                        placeholder="Authenticated user"
                        autoComplete="name"
                        className="w-full text-lg py-4 px-6 rounded-2xl border-2 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950/20 cursor-not-allowed backdrop-blur-sm focus:ring-4 focus:ring-green-500/20 transition-all duration-200 group-hover:shadow-lg"
                        disabled={isCreating || isSignedIn}
                        required
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 pointer-events-none" />
                    </div>
                    {nameError && (
                      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                          <span>⚠️</span> {nameError}
                        </p>
                      </div>
                    )}
                    <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                        <span>✅</span> Your name is automatically filled from your authenticated account
                      </p>
                    </div>
                  </div>

                {/* School Selection */}
                <div className="space-y-3">
                  <label htmlFor="schoolSelect" className="text-lg font-semibold block" style={{color: 'var(--foreground)'}}>
                    Select Your Forsyth County School *
                  </label>
                  <Select 
                    value={selectedSchool} 
                    onValueChange={(value) => {
                      setSelectedSchool(value);
                      setSchoolError('');
                    }}
                    name="schoolSelect"
                  >
                    <SelectTrigger 
                      id="schoolSelect"
                      className="modern-input text-lg py-4 rounded-2xl" 
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--foreground)'
                      }}
                      aria-label="Select your Forsyth County School"
                    >
                      <SelectValue placeholder="Choose your school..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 max-h-[400px]">
                      <div className="font-bold text-base text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800">High Schools</div>
                      {SCHOOLS_BY_CATEGORY.high.map((school) => (
                        <SelectItem 
                          key={school.name} 
                          value={school.name}
                          className="text-base py-3 px-4 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-100 dark:focus:bg-red-900/40 text-gray-900 dark:text-gray-100"
                        >
                          {school.name}
                        </SelectItem>
                      ))}
                      <div className="font-bold text-base text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 mt-2">Middle Schools</div>
                      {SCHOOLS_BY_CATEGORY.middle.map((school) => (
                        <SelectItem 
                          key={school.name} 
                          value={school.name}
                          className="text-base py-3 px-4 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-100 dark:focus:bg-red-900/40 text-gray-900 dark:text-gray-100"
                        >
                          {school.name}
                        </SelectItem>
                      ))}
                      <div className="font-bold text-base text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 mt-2">Elementary Schools</div>
                      {SCHOOLS_BY_CATEGORY.elementary.map((school) => (
                        <SelectItem 
                          key={school.name} 
                          value={school.name}
                          className="text-base py-3 px-4 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-100 dark:focus:bg-red-900/40 text-gray-900 dark:text-gray-100"
                        >
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {schoolError && (
                    <p className="text-red-600 text-sm font-medium">{schoolError}</p>
                  )}
                </div>

                {/* Policy Agreements */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="policy"
                      checked={agreedToPolicy}
                      onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
                      disabled={isCreating}
                    />
                    <label htmlFor="policy" className="text-sm leading-relaxed cursor-pointer" style={{color: 'var(--foreground-secondary)'}}>
                      I agree to maintain a respectful and appropriate classroom environment. 
                      I understand that all chats are monitored for educational purposes and inappropriate 
                      behavior will result in immediate removal.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="districtPolicy"
                      checked={agreedToDistrictPolicy}
                      onCheckedChange={(checked) => setAgreedToDistrictPolicy(checked === true)}
                      disabled={isCreating}
                    />
                    <label htmlFor="districtPolicy" className="text-sm leading-relaxed cursor-pointer" style={{color: 'var(--foreground-secondary)'}}>
                      I agree to the <strong>Forsyth County Schools Acceptable Use Policy</strong> and 
                      understand that this platform is for educational purposes only. I am authorized 
                      to create this classroom for legitimate school activities.
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className={`w-full text-xl py-6 font-bold rounded-2xl ${
                    isOnCooldown 
                      ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                      : 'btn-red-primary'
                  }`}
                  disabled={isCreating || !creatorName.trim() || !selectedSchool || !agreedToPolicy || !agreedToDistrictPolicy || isOnCooldown}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating Secure Classroom...</span>
                    </>
                  ) : isOnCooldown ? (
                    <>
                      <span className="mr-2">⏳</span>
                      Wait {cooldownTimeLeft}s
                    </>
                  ) : (
                    'Create Forsyth County Classroom'
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="animate-scale-in">
              {/* Modern Success Card with Glassmorphism */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/70 backdrop-blur-xl border-0 shadow-2xl">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/10 to-green-600/20 animate-pulse opacity-50" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-green-400/30 to-emerald-600/30 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-float-delayed" />
                
                <CardContent className="relative z-10 text-center space-y-8 p-8">
                  {/* Success Icon with Advanced Animation */}
                  <div className="relative flex justify-center mb-8">
                    <div className="relative">
                      {/* Main icon container */}
                      <div className="relative z-10 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-6 rounded-[2rem] shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-6 group">
                        <div className="relative">
                          <span className="text-5xl block transform transition-all duration-300 group-hover:scale-110">🎉</span>
                          {/* Sparkle effects */}
                          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
                          <div className="absolute -bottom-1 -left-1 text-xl animate-bounce" style={{animationDelay: '0.5s'}}>🌟</div>
                        </div>
                      </div>
                      
                      {/* Orbiting elements */}
                      <div className="absolute inset-0 animate-spin-slow">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse" />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-lg animate-pulse" style={{animationDelay: '1s'}} />
                        <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-2 h-2 bg-green-500 rounded-full shadow-lg animate-pulse" style={{animationDelay: '2s'}} />
                        <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-3 h-3 bg-emerald-500 rounded-full shadow-lg animate-pulse" style={{animationDelay: '1.5s'}} />
                      </div>
                      
                      {/* Glow effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}} />
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="space-y-4">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent leading-tight">
                      Classroom Created!
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-xl text-gray-700 dark:text-gray-200">
                      <span>Your</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{createdSchoolName}</span>
                      <span>classroom is ready</span>
                      <span className="text-2xl animate-bounce">📚</span>
                    </div>
                  </div>

                  {/* Room Code Section - Redesigned */}
                  <div className="relative group">
                    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl p-8 border-2 border-gray-200/50 dark:border-gray-600/50 shadow-xl backdrop-blur-sm">
                      {/* Floating badge */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                          <span className="mr-2">📤</span>
                          Share with Friends
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        {/* Room code display with text box */}
                        <div className="relative">
                          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-2xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105 group-hover:shadow-3xl">
                            <input
                              type="text"
                              value={createdRoomCode}
                              readOnly
                              className="w-full bg-transparent text-4xl font-mono font-black text-white tracking-[0.3em] drop-shadow-lg text-center outline-none cursor-pointer select-all"
                              onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            {/* Animated underline */}
                            <div className="h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          
                          {/* Copy success indicator */}
                          <div className="absolute -top-2 -right-2 opacity-0 transform scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                            <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
                              <span className="text-sm">👆</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Copy button */}
                        <Button
                          onClick={copyRoomCode}
                          className="mt-6 w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-xl py-4 font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                        >
                          <span className="mr-2 transition-transform duration-300 group-hover:scale-110">📋</span>
                          Copy Room Code
                          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300">✨</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Enhanced */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={navigateToChat}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white font-black py-6 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-lg group"
                    >
                      <span className="mr-3 text-2xl transition-transform duration-300 group-hover:translate-x-1">🚀</span>
                      Enter Classroom
                      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
                    </Button>
                    <Button
                      onClick={shareOnGoogleDocs}
                      variant="outline"
                      size="lg"
                      className="px-6 py-6 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-2xl font-bold transition-all duration-300 hover:scale-105 text-lg group"
                    >
                      <span className="mr-2 text-xl transition-transform duration-300 group-hover:scale-110">📄</span>
                      Share on Google Docs
                      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
                    </Button>
                  </div>
                  
                  {/* Success message animation */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-emerald-500 via-green-600 to-emerald-600 animate-gradient-x" />
                </CardContent>
              </Card>
            </div>
          )}
          </SignedIn>

          <SignedOut>
            <div className="bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
              <div className="text-center space-y-6 mb-8">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-6 rounded-3xl shadow-2xl relative group">
                    <Plus className="h-12 w-12 text-white drop-shadow-lg" />
                    <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    Sign In Required
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Please sign in to create a Forsyth County Schools classroom 🏫
                  </p>
                  <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                    Your account will be automatically verified and your name will be pre-filled
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <SignInButton mode="modal">
                  <Button className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg">
                    🚪 Sign In to Create Classroom
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
          </SignedOut>
        </div>
      </main>
    </GeoBlockWrapper>
  );
}
