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
  const [turnstileToken, setTurnstileToken] = useState('');
  
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

    if (!turnstileToken) {
      toast({
        title: 'Security Verification Required',
        description: 'Please complete the security verification',
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
        
        toast({
          title: 'Classroom Created!',
          description: `Your ${school.name} classroom is ready`,
        });
        
        // Navigate to chat
        router.push(`/chat/${response.code}`);
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
                  <Plus className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold" style={{color: 'var(--foreground)'}}>
                Create Forsyth County Classroom
              </CardTitle>
              <CardDescription className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                Set up a secure chat room for your Forsyth County Schools class
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Teacher/Creator Name */}
                <div className="space-y-3">
                  <label htmlFor="creatorName" className="text-lg font-semibold block" style={{color: 'var(--foreground)'}}>
                    Your Name (Teacher/Instructor) *
                  </label>
                  <Input
                    id="creatorName"
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
                  <label className="text-lg font-semibold block" style={{color: 'var(--foreground)'}}>
                    Select Your Forsyth County School *
                  </label>
                  <Select value={selectedSchool} onValueChange={(value) => {
                    setSelectedSchool(value);
                    setSchoolError('');
                  }}>
                    <SelectTrigger className="modern-input text-lg py-4" style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--foreground)'
                    }}>
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

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center">
                  <div 
                    className="cf-turnstile" 
                    data-sitekey="0x4AAAAAACW20p-WO0bwShk2"
                    data-callback="onTurnstileSuccess"
                  ></div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="btn-red-primary w-full text-xl py-6 font-bold"
                  disabled={isCreating || !creatorName.trim() || !selectedSchool || !agreedToPolicy || !agreedToDistrictPolicy || !turnstileToken}
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
