'use client';

import Link from 'next/link';
import { MessageSquare, Plus, LogIn, Rocket, Lock, Zap, Sparkles, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import GeoBlockWrapper from '@/components/GeoBlockWrapper';

export default function Home() {
  return (
    <GeoBlockWrapper>
      <main className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Advanced Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-red-600/30 via-pink-600/20 to-purple-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-red-500/25 via-orange-500/15 to-yellow-500/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-red-600/10 via-transparent to-transparent rounded-full blur-2xl animate-pulse-slow" />
          
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>
        
        {/* Theme Toggle */}
        <div className="absolute top-8 right-8 z-50">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-1">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-16 max-w-6xl relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-20">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 backdrop-blur-xl mb-8 animate-fade-in-down">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Exclusive Educational Platform
              </span>
            </div>

            {/* 3D Logo with advanced effects */}
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <div className="relative group">
                {/* Main logo container */}
                <div className="relative z-20 bg-gradient-to-br from-red-600 via-red-500 to-pink-600 p-8 rounded-2xl shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                  <MessageSquare className="h-16 w-16 text-white drop-shadow-2xl" strokeWidth={2.5} />
                  
                  {/* Inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                {/* Animated rings */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-full blur-3xl opacity-50 animate-ping" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                </div>
                
                {/* Orbiting elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 animate-spin-slow">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full shadow-lg shadow-red-400/50" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-400 rounded-full shadow-lg shadow-pink-400/50" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full shadow-lg shadow-orange-400/50" />
                </div>
              </div>
            </div>

            {/* Main heading with gradient animation */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-8 leading-none animate-fade-in-up animation-delay-200">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent inline-block animate-gradient-x">
                Forsyth Chat
              </span>
            </h1>
            
            {/* Animated stats with modern cards */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in-up animation-delay-600 max-w-2xl mx-auto">
              {[
                { value: '100%', label: 'Secure', icon: Shield },
                { value: '23', label: 'Schools', icon: Users },
                { value: 'GA', label: 'Only', icon: Lock }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="group backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/10 p-4 min-w-[140px] hover:border-red-500/50 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-red-500/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className="w-5 h-5 text-red-400 mx-auto mb-2 group-hover:scale-125 transition-transform duration-300" />
                  <div className="text-2xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-semibold tracking-wide text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons with modern design */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-16 max-w-2xl mx-auto animate-fade-in-up animation-delay-800">
            <Link href="/create" className="flex-1 md:max-w-xs group">
              <div className="relative overflow-hidden rounded-xl">
                {/* Gradient border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-red-600 opacity-100 animate-gradient-x" />
                <div className="relative m-[2px] bg-black rounded-xl">
                  <Button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-base py-4 px-6 rounded-xl shadow-2xl shadow-red-600/30 transition-all duration-500 transform group-hover:scale-[1.02] relative overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Room
                    </span>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>
                </div>
              </div>
            </Link>
            
            <Link href="/join" className="flex-1 md:max-w-xs group">
              <Button className="w-full backdrop-blur-xl bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-red-500/50 text-white font-black text-base py-4 px-6 rounded-xl shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02] relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Join Room
                </span>
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </Link>
          </div>
        
          {/* Features Section with bento grid */}
          <div className="animate-fade-in-up animation-delay-1000">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4">
                <span className="text-white">Why </span>
                <span className="bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-gradient-x">
                  Forsyth County
                </span>
                <span className="text-white"> Schools?</span>
              </h2>
              <p className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
                Built with cutting-edge technology for maximum security and educational excellence
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                {
                  icon: Lock,
                  title: 'School Secure',
                  description: 'Georgia-restricted access with multi-layer school verification and AI-powered content filtering.',
                  gradient: 'from-red-600 to-pink-600'
                },
                {
                  icon: Rocket,
                  title: 'Education Ready',
                  description: 'Purpose-built for modern classrooms with intelligent content controls and real-time monitoring.',
                  gradient: 'from-pink-600 to-purple-600'
                },
                {
                  icon: Zap,
                  title: 'Real-Time Learning',
                  description: 'Lightning-fast messaging with automatic AI moderation for safe learning.',
                  gradient: 'from-orange-600 to-red-600'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Gradient border */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`} />
                  
                  <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/10 p-4 h-full transition-all duration-500 group-hover:border-white/30 group-hover:scale-[1.02] group-hover:shadow-2xl">
                    {/* Icon with gradient background */}
                    <div className={`bg-gradient-to-br ${feature.gradient} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <feature.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    
                    <h3 className="text-lg font-black mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="leading-relaxed text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
                      {feature.description}
                    </p>

                    {/* Decorative corner accent */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        
          {/* Modern Footer */}
          <div className="text-center mt-20 pt-8 border-t border-white/5">
            <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4 max-w-xl mx-auto">
              <p className="text-gray-400 text-xs leading-relaxed">
                <Lock className="inline w-3 h-3 mr-2 text-red-400" />
                Authorized for use by <span className="text-red-400 font-semibold">Forsyth County Schools</span> students only
              </p>
            </div>
          </div>
        </div>

        {/* Custom animations styles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(30px, -30px) scale(1.05); }
            50% { transform: translate(-20px, 20px) scale(0.95); }
            75% { transform: translate(20px, 30px) scale(1.02); }
          }

          @keyframes float-delayed {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(-40px, 30px) scale(1.05); }
            50% { transform: translate(30px, -20px) scale(0.95); }
            75% { transform: translate(-30px, -30px) scale(1.02); }
          }

          @keyframes float-particle {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
          }

          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }

          @keyframes spin-slow {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }

          @keyframes fade-in-down {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-float {
            animation: float 20s ease-in-out infinite;
          }

          .animate-float-delayed {
            animation: float-delayed 25s ease-in-out infinite;
          }

          .animate-float-particle {
            animation: float-particle linear infinite;
          }

          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
          }

          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }

          .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
          }

          .animate-fade-in-down {
            animation: fade-in-down 0.6s ease-out forwards;
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }

          .animation-delay-200 {
            animation-delay: 200ms;
          }

          .animation-delay-300 {
            animation-delay: 300ms;
          }

          .animation-delay-400 {
            animation-delay: 400ms;
          }

          .animation-delay-600 {
            animation-delay: 600ms;
          }

          .animation-delay-800 {
            animation-delay: 800ms;
          }

          .animation-delay-1000 {
            animation-delay: 1000ms;
          }
        `}</style>
      </main>
    </GeoBlockWrapper>
  );
}