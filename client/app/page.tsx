import Link from 'next/link';
import { MessageSquare, Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <MessageSquare className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Classroom Chat Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, respectful real-time chat for classes. No accounts required.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Classroom Card */}
          <Link href="/create" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer border-2 hover:border-primary">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Create a New Classroom</CardTitle>
                <CardDescription className="text-center text-base">
                  Start a new chat room and get a unique code to share with your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Create Classroom
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Join Classroom Card */}
          <Link href="/join" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer border-2 hover:border-primary">
              <CardHeader className="pb-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <LogIn className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Join an Existing Classroom</CardTitle>
                <CardDescription className="text-center text-base">
                  Enter a room code to join an ongoing classroom conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" variant="outline">
                  Join Classroom
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Why Classroom Chat?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold mb-2">No Setup Required</h3>
              <p className="text-sm text-muted-foreground">
                Jump right in without creating accounts or downloading apps
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Unique 10-character codes keep your classroom conversations private
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-sm text-muted-foreground">
                See messages instantly as they&apos;re sent with live participant updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
