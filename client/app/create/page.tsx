'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useUserStore } from '@/lib/store';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FORSYTH_SCHOOLS, SCHOOLS_BY_CATEGORY, generateSchoolCode } from '@/lib/schools';
import { validateUserName } from '@/lib/security';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function CreatePage() {
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
  
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useUserStore();

  const navigateToChat = () => {
    router.push(`/chat/${createdRoomCode}`);
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(createdRoomCode);
      toast({
        title: '📋 Copied!',
        description: 'Room code copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Please manually copy the room code',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      <main className="min-h-screen transition-colors duration-300 relative overflow-hidden" style={{backgroundColor: 'var(--background)'}}>
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-red-400/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
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

          {!roomCreated ? (
            <Card className="card-modern animate-fade-in">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl modern-shadow-hover animate-bounce-soft">
                    <Plus className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Create Forsyth County Classroom
                </CardTitle>
                <CardDescription className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                  Set up a secure chat room for your Forsyth County Schools class 🏫
                </CardDescription>
              </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Creator Name */}
                <div className="space-y-3">
                  <label htmlFor="creatorName" className="text-lg font-semibold block" style={{color: 'var(--foreground)'}}>
                    Your Name *
                  </label>
                  <Input
                    id="creatorName"
                    name="creatorName"
                    type="text"
                    value={creatorName}
                    onChange={(e) => {
                      setCreatorName(e.target.value);
                      setNameError('');
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="modern-input text-lg py-4"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--foreground)'
                    }}
                    disabled={isCreating}
                    required
                  />
                  {nameError && (
                    <p className="text-red-600 text-sm font-medium">{nameError}</p>
                  )}
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
                      className="modern-input text-lg py-4" 
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--foreground)'
                      }}
                      aria-label="Select your Forsyth County School"
                    >
                      <SelectValue placeholder="Choose your school..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="font-semibold text-sm text-gray-500 px-2 py-1">High Schools</div>
                      {SCHOOLS_BY_CATEGORY.high.map((school) => (
                        <SelectItem key={school.name} value={school.name}>
                          {school.name}
                        </SelectItem>
                      ))}
                      <div className="font-semibold text-sm text-gray-500 px-2 py-1 mt-2">Middle Schools</div>
                      {SCHOOLS_BY_CATEGORY.middle.map((school) => (
                        <SelectItem key={school.name} value={school.name}>
                          {school.name}
                        </SelectItem>
                      ))}
                      <div className="font-semibold text-sm text-gray-500 px-2 py-1 mt-2">Elementary Schools</div>
                      {SCHOOLS_BY_CATEGORY.elementary.map((school) => (
                        <SelectItem key={school.name} value={school.name}>
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
                  className="btn-red-primary w-full text-xl py-6 font-bold"
                  disabled={isCreating || !creatorName.trim() || !selectedSchool || !agreedToPolicy || !agreedToDistrictPolicy}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating Secure Classroom...</span>
                    </>
                  ) : (
                    'Create Forsyth County Classroom'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          ) : (
            <div className="animate-scale-in">
              <Card className="card-modern border-2 border-green-500/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardContent className="text-center space-y-8 pt-8">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-3xl modern-shadow-hover animate-bounce-soft">
                      <span className="text-6xl">🎉</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                      Classroom Created!
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      Your {createdSchoolName} classroom is ready for students 📚
                    </p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                      📋 Share this room code with your students
                    </p>
                    <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-xl p-4 border-2 border-red-200/50 dark:border-red-800/50">
                      <code className="text-3xl font-mono font-bold text-red-700 dark:text-red-400 tracking-wider">
                        {createdRoomCode}
                      </code>
                    </div>
                    <Button
                      onClick={copyRoomCode}
                      variant="outline"
                      className="mt-4 w-full border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950/30"
                    >
                      📋 Copy Room Code
                    </Button>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={navigateToChat}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      🚀 Enter Classroom
                    </Button>
                    <Button
                      onClick={() => {
                        setRoomCreated(false);
                        setCreatedRoomCode('');
                        setCreatedSchoolName('');
                        setCreatorName('');
                        setSelectedSchool('');
                        setAgreedToPolicy(false);
                        setAgreedToDistrictPolicy(false);
                      }}
                      variant="outline"
                      size="lg"
                      className="px-6 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800"
                    >
                      ➕ Create Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        </div>
      </main>
    </GeoBlockWrapper>
  );
}
