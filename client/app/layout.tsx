import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/next';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: 'Canvas Dashboard',
  description: 'Secure classroom chat exclusively for Forsyth County Schools in Georgia',
  keywords: 'classroom, chat, forsyth county schools, education, georgia',
  authors: [{ name: 'Forsyth County Schools IT Department' }],
  robots: 'noindex, nofollow', // Keep private for school use
  icons: {
    icon: 'https://www.csc.edu/media/website/content-assets/images/tlpec/canvas_reversed_logo.png',
  },
  other: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Google Font preconnect */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Prevent flash of wrong theme */}
          <style dangerouslySetInnerHTML={{
            __html: `
              html {
                visibility: hidden;
              }
              html.dark {
                visibility: visible;
              }
            `
          }} />
          {/* Content Security Policy for XSS protection - Updated for Clerk with eval allowed */}
          <meta 
            httpEquiv="Content-Security-Policy" 
            content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://ipapi.co https://ipwho.is https://api.ipgeolocation.io https://api.ipify.org https://*.clerk.accounts.dev https://*.clerk.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://forsyth-chats.onrender.com https://ipapi.co https://ipwho.is https://api.ipgeolocation.io https://api.ipify.org https://*.clerk.accounts.dev https://*.clerk.dev https://clerk-telemetry.com wss: ws:; frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev; worker-src 'self' 'unsafe-eval' blob:; child-src 'self';" 
          />
          {/* Force HTTPS in production */}
          <script dangerouslySetInnerHTML={{
            __html: `
              if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                location.replace('https:' + window.location.href.substring(window.location.protocol.length));
              }
            `
          }} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Force dark mode immediately
                  document.documentElement.classList.add('dark');
                  
                  // Check localStorage for saved preference
                  const savedTheme = localStorage.getItem('theme');
                  if (savedTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // Default to dark if no preference saved
                    localStorage.setItem('theme', 'dark');
                  }
                  
                  // Make page visible
                  document.documentElement.style.visibility = 'visible';
                })()
              `,
            }}
          />
        </head>
        <body className={inter.className}>
          <header className="flex justify-end items-center p-4 gap-4 h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <SignedOut>
              <SignInButton>
                <button className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-medium text-sm h-10 px-6 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "rounded-2xl",
                  },
                }}
              />
            </SignedIn>
          </header>
          {children}
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
