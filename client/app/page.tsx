import Link from 'next/link';
import { MessageSquare, Plus, LogIn, Rocket, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function Home() {
  return (
    <GeoBlockWrapper>
      <main className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{backgroundColor: 'var(--background)'}}>
        {/* Animated Background */}
        <div className="hero-gradient absolute inset-0" />
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-16 max-w-7xl relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-32 slide-up">
            <div className="flex justify-center mb-12">
              <div className="card-glass p-10 rounded-full float-animation glow-red relative">
                <MessageSquare className="h-20 w-20 text-red-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full blur-xl" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight" style={{color: 'var(--foreground)'}}>
              Canvas <span className="text-gradient">Dashboard</span>
            </h1>
            <div className="max-w-4xl mx-auto mb-8">
              <p className="text-2xl md:text-3xl leading-relaxed font-medium text-red-600">
                Exclusive Classroom Chat for Forsyth County Schools (Georgia)
              </p>
              <p className="text-xl md:text-2xl mt-4 leading-relaxed" style={{color: 'var(--foreground-secondary)'}}>
                Secure, real-time communication for students and educators.
                <span className="text-red-500 font-bold"> School-verified access only.</span>
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-12 mt-16 slide-up" style={{animationDelay: '0.2s'}}>
              <div className="text-center">
                <div className="text-3xl font-black text-red-500">100%</div>
                <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>Secure</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-red-500">23</div>
                <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>Schools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-red-500">GA</div>
                <div className="text-sm" style={{color: 'var(--foreground-secondary)'}}>Only</div>
              </div>
            </div>
          </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-32">
          {/* Create Classroom Card */}
          <Link href="/create" className="block group slide-up" style={{animationDelay: '0.3s'}}>
            <div className="card-glass p-10 h-full rounded-3xl group-hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-center relative z-10">
                <div className="flex justify-center mb-10">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-3xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl relative">
                    <Plus className="h-16 w-16 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-700 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                  </div>
                </div>
                <h2 className="text-4xl font-black mb-6" style={{color: 'var(--foreground)'}}>Create Classroom</h2>
                <p className="text-xl mb-10 leading-relaxed" style={{color: 'var(--foreground-secondary)'}}>
                  Start a secure chat for your Forsyth County Schools class
                </p>
                <Button className="btn-red-primary w-full text-xl py-6 rounded-2xl font-bold group-hover:shadow-2xl group-hover:shadow-red-500/25 transition-all duration-500">
                  Create for School →
                </Button>
              </div>
            </div>
          </Link>

          {/* Join Classroom Card */}
          <Link href="/join" className="block group slide-up" style={{animationDelay: '0.4s'}}>
            <div className="card-glass p-10 h-full rounded-3xl group-hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-red-500/10 via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="text-center relative z-10">
                <div className="flex justify-center mb-10">
                  <div className="bg-white dark:bg-gray-900 border-4 border-red-500 p-8 rounded-3xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-2xl relative">
                    <LogIn className="h-16 w-16 text-red-500" />
                    <div className="absolute inset-0 bg-red-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                <h2 className="text-4xl font-black mb-6" style={{color: 'var(--foreground)'}}>Join Classroom</h2>
                <p className="text-xl mb-10 leading-relaxed" style={{color: 'var(--foreground-secondary)'}}>
                  Enter your teacher's room code to join the discussion
                </p>
                <Button className="btn-red-outline w-full text-xl py-6 rounded-2xl font-bold group-hover:shadow-2xl group-hover:shadow-red-500/25 transition-all duration-500">
                  Join Now →
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="slide-up" style={{animationDelay: '0.5s'}}>
          <h2 className="text-5xl md:text-6xl font-black text-center mb-20" style={{color: 'var(--foreground)'}}>
            Why <span className="text-gradient">Forsyth County</span> Chose This?
          </h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            <div className="text-center p-10 card-glass rounded-3xl group hover:scale-105 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl relative z-10">
                <Lock className="h-12 w-12 text-white" />
                <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              </div>
              <h3 className="text-3xl font-black mb-6" style={{color: 'var(--foreground)'}}>School Secure</h3>
              <p className="leading-relaxed text-xl" style={{color: 'var(--foreground-secondary)'}}>
                Georgia-restricted access with school verification and content filtering.
              </p>
            </div>
            
            <div className="text-center p-10 card-glass rounded-3xl group hover:scale-105 transition-all duration-500 relative overflow-hidden" style={{animationDelay: '0.1s'}}>
              <div className="absolute inset-0 bg-gradient-to-bl from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-2xl relative z-10">
                <Rocket className="h-12 w-12 text-white" />
                <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              </div>
              <h3 className="text-3xl font-black mb-6" style={{color: 'var(--foreground)'}}>Education Ready</h3>
              <p className="leading-relaxed text-xl" style={{color: 'var(--foreground-secondary)'}}>
                Built for classrooms with appropriate content controls and monitoring.
              </p>
            </div>
            
            <div className="text-center p-10 card-glass rounded-3xl group hover:scale-105 transition-all duration-500 relative overflow-hidden" style={{animationDelay: '0.2s'}}>
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl relative z-10">
                <Zap className="h-12 w-12 text-white" />
                <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              </div>
              <h3 className="text-3xl font-black mb-6" style={{color: 'var(--foreground)'}}>Real-Time Learning</h3>
              <p className="leading-relaxed text-xl" style={{color: 'var(--foreground-secondary)'}}>
                Instant messaging with teacher oversight and automatic moderation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    </GeoBlockWrapper>
  );
}
