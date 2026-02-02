/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Image domains for development and production
  images: {
    domains: [
      'forsyth-chats.onrender.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/api/file/**',
      },
      {
        protocol: 'https',
        hostname: 'forsyth-chats.onrender.com',
        pathname: '/api/file/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
};

module.exports = nextConfig;
