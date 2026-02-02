import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <head>
        {/* Content Security Policy for XSS protection */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.cloudflare.com https://ipapi.co https://ipwho.is https://api.ipgeolocation.io https://api.ipify.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://forsyth-chats.onrender.com https://ipapi.co https://ipwho.is https://api.ipgeolocation.io https://api.ipify.org https://challenges.cloudflare.com https://*.cloudflare.com wss: ws:; frame-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com; worker-src 'self' blob:; child-src 'self' https://challenges.cloudflare.com;" 
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
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })()
            `,
          }}
        />
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
