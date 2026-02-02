'use client';

import Link from 'next/link';
import { MessageSquare, Plus, LogIn, Lock, Shield, Users, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileSetup } from '@/components/ProfileSetup';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { useUserStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function Home() {
  const { user } = useUser();
  const { profile } = useUserStore();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    // If user is signed in but has no profile set up, show profile setup
    if (user && !profile) {
      // Don't immediately show profile setup, let ProfileSetup component handle it
      console.log('User authenticated, checking profile...');
    }
  }, [user, profile]);

  return (
    <GeoBlockWrapper>
      <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative">
        {/* Modern gradient background with subtle accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.02)_25%,rgba(59,130,246,0.02)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.02)_75%)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-6 py-16 max-w-4xl relative z-10">
          {/* Profile Setup for authenticated users */}
          <SignedIn>
            {(!profile || showProfileSetup) ? (
              <div>
                <ProfileSetup onComplete={() => setShowProfileSetup(false)} />
              </div>
            ) : (
              <div>
                {/* Authenticated User Dashboard */}
                <div className="text-center mb-12">
                  <div className="flex justify-center mb-6">
                    {profile?.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt={profile.displayName}
                        className="w-20 h-20 rounded-3xl shadow-xl object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-3xl shadow-xl">
                        <School className="h-8 w-8 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-50">
                    Welcome back, {profile?.displayName || user?.firstName || 'User'}!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-200 mb-8">
                    Ready to join or create a classroom chat?
                  </p>
                </div>

                {/* Action Cards for authenticated users */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-3xl">
                    <CardHeader className="text-center pb-6">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Plus className="h-8 w-8 text-white drop-shadow-sm" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Create Room</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                        Start a new classroom conversation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/create">
                        <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
                          Create New Room
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-3xl">
                    <CardHeader className="text-center pb-6">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <LogIn className="h-8 w-8 text-white drop-shadow-sm" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Join Room</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                        Enter an existing classroom chat
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/join">
                        <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl">
                          Join Existing Room
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Management Button */}
                <div className="text-center">
                  <Button
                    onClick={() => setShowProfileSetup(true)}
                    variant="outline"
                    className="rounded-2xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </SignedIn>

          {/* Unauthenticated Users */}
          <SignedOut>
            {/* Hero Section */}
            <div className="text-center mb-16">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <School className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-gray-50">
                Forsyth Chat
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
                Secure classroom communication platform for Forsyth County Schools
              </p>
              
              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-2xl backdrop-blur-sm shadow-sm">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-medium">100% Secure</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-2xl backdrop-blur-sm shadow-sm">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">23 Schools</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-2xl backdrop-blur-sm shadow-sm">
                  <Lock className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Georgia Only</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 max-w-md mx-auto">
              <Link href="/create" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-lg py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Room
                </Button>
              </Link>
              
              <Link href="/join" className="flex-1">
                <Button variant="outline" className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-red-600 dark:hover:border-red-500 text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold text-lg py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 backdrop-blur-sm">
                  <LogIn className="w-5 h-5 mr-2" />
                  Join Room
                </Button>
              </Link>
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Lock className="h-7 w-7 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">School Secure</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base text-gray-600 dark:text-gray-200">
                    Georgia-restricted access with school verification and content monitoring.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <School className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Education Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base text-gray-600 dark:text-gray-200">
                    Built for classrooms with teacher controls and safe communication tools.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageSquare className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Real-Time Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base text-gray-600 dark:text-gray-200">
                    Fast messaging with automatic moderation for safe learning environments.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="text-center">
              <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-600 p-8 max-w-lg mx-auto shadow-lg">
                <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-200">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-medium">
                    Authorized for <strong className="text-red-600 dark:text-red-400">Forsyth County Schools</strong> students only
                  </span>
                </div>
              </div>
            </div>
          </SignedOut>
        </div>
      </main>
    </GeoBlockWrapper>
  );
}