#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install --include=dev

echo "🏗️ Building TypeScript..."
npm run build

echo "📁 Build output:"
ls -la dist/

echo "✅ Build completed successfully!"
