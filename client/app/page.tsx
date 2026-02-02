import Link from 'next/link';
import { MessageSquare, Plus, LogIn, Rocket, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <main className="min-h-screen transition-colors duration-300" style={{backgroundColor: 'var(--background-secondary)'}}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-24 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="card-modern p-8 rounded-3xl animate-bounce-soft">
              <MessageSquare className="h-16 w-16 text-red-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight" style={{color: 'var(--foreground)'}}>
            Classroom Chat <span className="text-red-500">Center</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium" style={{color: 'var(--foreground-secondary)'}}>
            Simple, respectful real-time chat for classes.
            <br />
            <span className="text-red-500 font-semibold">No accounts required.</span>
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
          {/* Create Classroom Card */}
          <Link href="/create" className="block group">
            <div className="card-modern-hover p-8 h-full animate-slide-up">
              <div className="text-center">
                <div className="flex justify-center mb-8">
                  <div className="bg-red-600 p-6 rounded-2xl group-hover:scale-110 transition-transform duration-300 modern-shadow">
                    <Plus className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--foreground)'}}>Create a New Classroom</h2>
                <p className="text-lg mb-8 leading-relaxed" style={{color: 'var(--foreground-secondary)'}}>
                  Start a new chat room and get a unique code to share with your students
                </p>
                <Button className="btn-red-primary w-full text-lg py-4 rounded-xl font-semibold">
                  Create Classroom
                </Button>
              </div>
            </div>
          </Link>

          {/* Join Classroom Card */}
          <Link href="/join" className="block group">
            <div className="card-modern-hover p-8 h-full animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="text-center">
                <div className="flex justify-center mb-8">
                  <div className="bg-white border-4 border-red-600 p-6 rounded-2xl group-hover:scale-110 transition-transform duration-300 modern-shadow">
                    <LogIn className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--foreground)'}}>Join an Existing Classroom</h2>
                <p className="text-lg mb-8 leading-relaxed" style={{color: 'var(--foreground-secondary)'}}>
                  Enter a room code to join an ongoing classroom conversation
                </p>
                <Button className="btn-red-outline w-full text-lg py-4 rounded-xl font-semibold">
                  Join Classroom
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16" style={{color: 'var(--foreground)'}}>Why Classroom Chat?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 card-modern group hover:border-red-500/50 transition-all duration-300">
              <div className="bg-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 modern-shadow">
                <Rocket className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--foreground)'}}>No Setup Required</h3>
              <p className="leading-relaxed text-lg" style={{color: 'var(--foreground-secondary)'}}>
                Jump right in without creating accounts or downloading apps
              </p>
            </div>
            
            <div className="text-center p-8 card-modern group hover:border-red-500/50 transition-all duration-300">
              <div className="bg-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 modern-shadow">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--foreground)'}}>Secure & Private</h3>
              <p className="leading-relaxed text-lg" style={{color: 'var(--foreground-secondary)'}}>
                Unique 10-character codes keep your classroom conversations private
              </p>
            </div>
            
            <div className="text-center p-8 card-modern group hover:border-red-500/50 transition-all duration-300">
              <div className="bg-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 modern-shadow">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--foreground)'}}>Real-Time Updates</h3>
              <p className="leading-relaxed text-lg" style={{color: 'var(--foreground-secondary)'}}>
                See messages instantly as they're sent with live participant updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
