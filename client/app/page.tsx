import Link from 'next/link';
import { MessageSquare, Plus, LogIn, Rocket, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function Home() {
  return (
    <GeoBlockWrapper>
      <main className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-red-700/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}} />
        </div>
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-32 animate-fade-in">
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="bg-red-600 p-12 rounded-3xl shadow-2xl relative z-10">
                  <MessageSquare className="h-20 w-20 text-white drop-shadow-lg" />
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-red-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
                </div>
                {/* Outer glow rings */}
                <div className="absolute -inset-8 bg-red-600/20 rounded-full blur-2xl animate-ping" />
                <div className="absolute -inset-4 bg-red-500/30 rounded-full blur-lg animate-pulse" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Forsyth Chat
            </h1>
            <div className="max-w-4xl mx-auto mb-8">
              <p className="text-2xl md:text-3xl leading-relaxed font-semibold text-red-400 mb-4">
                Exclusive Classroom Chat for Forsyth County Schools<br />
                <span className="text-xl text-red-500">(Georgia)</span>
              </p>
              <p className="text-xl md:text-2xl mt-4 leading-relaxed text-gray-300">
                Secure, real-time communication for students and educators.
                <span className="text-red-400 font-bold"> School-verified access only.</span>
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-16 mt-16 animate-slide-up">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-red-400">100%</div>
                <div className="text-gray-400 text-sm md:text-base font-medium">Secure</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-red-400">23</div>
                <div className="text-gray-400 text-sm md:text-base font-medium">Schools</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black text-red-400">GA</div>
                <div className="text-gray-400 text-sm md:text-base font-medium">Only</div>
              </div>
            </div>
          </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-8 justify-center mb-20 max-w-2xl mx-auto animate-slide-up">
          <Link href="/create" className="flex-1">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-8 px-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-red-600/25">
              Create Room
            </Button>
          </Link>
          <Link href="/join" className="flex-1">
            <Button variant="outline" className="w-full border-2 border-gray-700 hover:border-red-600 bg-gray-900/50 hover:bg-red-600/10 text-white font-bold text-xl py-8 px-8 rounded-2xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105">
              Join Room
            </Button>
          </Link>
        </div>
        
        {/* Features Section */}
        <div className="animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-white">
            Why <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Forsyth County</span> Chose This?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 hover:border-red-600/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">School Secure</h3>
              <p className="leading-relaxed text-lg text-gray-300">
                Georgia-restricted access with school verification and content filtering.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 hover:border-red-600/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Rocket className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">Education Ready</h3>
              <p className="leading-relaxed text-lg text-gray-300">
                Built for classrooms with appropriate content controls and monitoring.
              </p>
            </div>
            
            <div className="text-center p-8 bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 hover:border-red-600/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">Real-Time Learning</h3>
              <p className="leading-relaxed text-lg text-gray-300">
                Instant messaging with teacher oversight and automatic moderation.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-20 pt-8">
          <p className="text-gray-500 text-sm">
            Authorized for use by Forsyth County Schools students and faculty only
          </p>
        </div>
      </div>
    </main>
    </GeoBlockWrapper>
  );
}
