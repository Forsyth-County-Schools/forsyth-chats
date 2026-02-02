'use client';

import Link from 'next/link';
import { MessageSquare, Plus, LogIn, Lock, Shield, Users, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function Home() {
  return (
    <GeoBlockWrapper>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
        {/* Simple background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_25%,rgba(59,130,246,0.05)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.05)_75%)] bg-[length:20px_20px]" />
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-6 py-16 max-w-4xl relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="bg-red-600 p-4 rounded-2xl shadow-lg">
                <School className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Forsyth Chat
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Secure classroom communication platform for Forsyth County Schools
            </p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Shield className="w-5 h-5 text-green-600" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Users className="w-5 h-5 text-blue-600" />
                <span>23 Schools</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Lock className="w-5 h-5 text-red-600" />
                <span>Georgia Only</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 max-w-md mx-auto">
            <Link href="/create" className="flex-1">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-lg py-3 px-8 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl">
                <Plus className="w-5 h-5 mr-2" />
                Create Room
              </Button>
            </Link>
            
            <Link href="/join" className="flex-1">
              <Button variant="outline" className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-red-600 dark:hover:border-red-500 text-gray-700 dark:text-gray-300 font-semibold text-lg py-3 px-8 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl">
                <LogIn className="w-5 h-5 mr-2" />
                Join Room
              </Button>
            </Link>
          </div>
        
          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="bg-red-100 dark:bg-red-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl font-bold">School Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Georgia-restricted access with school verification and content monitoring.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="bg-blue-100 dark:bg-blue-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <School className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold">Education Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Built for classrooms with teacher controls and safe communication tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold">Real-Time Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Fast messaging with automatic moderation for safe learning environments.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        
          {/* Footer */}
          <div className="text-center">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <Lock className="w-4 h-4 text-red-600" />
                <span className="text-sm">
                  Authorized for <strong>Forsyth County Schools</strong> students only
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GeoBlockWrapper>
  );
}