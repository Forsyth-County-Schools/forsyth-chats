#!/bin/bash

# Production Environment Setup Script
# This script helps set up environment variables for production deployment

echo "🚀 Classroom Chat Center - Production Environment Setup"
echo "========================================================"
echo ""

# Server Environment Variables
echo "📦 Server Environment Variables (for Render):"
echo "---------------------------------------------"
echo "MONGO_URI=mongodb+srv://blakeflyz1_db_user:ErX0cMjAItvvq4rx@forsythcountychat.0rcvols.mongodb.net/?appName=ForsythCountyChat"
echo "PORT=4000"
echo "CLIENT_URL=https://forsyth-chats.vercel.app"
echo "NODE_ENV=production"
echo ""

# Client Environment Variables
echo "🌐 Client Environment Variables (for Vercel):"
echo "--------------------------------------------"
echo "NEXT_PUBLIC_SOCKET_URL=https://forsyth-chats.onrender.com"
echo "NEXT_PUBLIC_API_URL=https://forsyth-chats.onrender.com"
echo ""

echo "✅ Copy these values to your deployment platforms:"
echo "   - Render: Dashboard → Environment → Environment Variables"
echo "   - Vercel: Project Settings → Environment Variables"
echo ""
echo "🔒 Security Note: Consider changing the MongoDB password after deployment"
echo ""
