import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Canvas Dashboard',
  description: 'Simple, respectful real-time chat for classes. No accounts required.',
  icons: {
    icon: 'https://www.csc.edu/media/website/content-assets/images/tlpec/canvas_reversed_logo.png',
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
