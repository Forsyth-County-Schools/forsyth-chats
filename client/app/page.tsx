import Link from 'next/link';
import { MessageSquare, Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black relative overflow-hidden grid-background">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-purple-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="glass-dark p-6 rounded-2xl glow-teal animate-pulse-glow">
              <MessageSquare className="h-20 w-20 text-teal-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text">
            Classroom Chat Center
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Simple, respectful real-time chat for classes. 
            <br />
            <span className="text-teal-500 font-medium">No accounts required.</span>
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Create Classroom Card */}
          <Link href="/create" className="block group">
            <Card className="h-full glass-dark border-slate-700/50 hover:border-teal-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/20 cursor-pointer rounded-2xl animate-slide-up">
              <CardHeader className="pb-6">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-teal-600 to-cyan-500 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 glow-teal">
                    <Plus className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl md:text-3xl text-center text-slate-100 mb-3">Create a New Classroom</CardTitle>
                <CardDescription className="text-center text-lg text-slate-400">
                  Start a new chat room and get a unique code to share with your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 text-white border-0 h-12 text-lg font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300" size="lg">
                  Create Classroom
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Join Classroom Card */}
          <Link href="/join" className="block group">
            <Card className="h-full glass-dark border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer rounded-2xl animate-slide-up" style={{animationDelay: '0.1s'}}>
              <CardHeader className="pb-6">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 glow-purple">
                    <LogIn className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl md:text-3xl text-center text-slate-100 mb-3">Join an Existing Classroom</CardTitle>
                <CardDescription className="text-center text-lg text-slate-400">
                  Enter a room code to join an ongoing classroom conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border-2 border-purple-500 hover:border-purple-400 h-12 text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300" size="lg" variant="outline">
                  Join Classroom
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-200">Why Classroom Chat?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 glass-dark rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-200">No Setup Required</h3>
              <p className="text-slate-400 leading-relaxed">
                Jump right in without creating accounts or downloading apps
              </p>
            </div>
            <div className="text-center p-8 glass-dark rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-200">Secure & Private</h3>
              <p className="text-slate-400 leading-relaxed">
                Unique 10-character codes keep your classroom conversations private
              </p>
            </div>
            <div className="text-center p-8 glass-dark rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-200">Real-Time Updates</h3>
              <p className="text-slate-400 leading-relaxed">
                See messages instantly as they're sent with live participant updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
