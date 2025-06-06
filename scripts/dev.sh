#!/bin/bash

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "🔄 Stopping any existing Next.js processes..."
pkill -f "next dev" 2>/dev/null || true

echo "⏳ Waiting for processes to stop..."
sleep 3

echo "🚀 Starting Next.js development server..."
npm run dev 