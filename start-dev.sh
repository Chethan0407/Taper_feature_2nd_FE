#!/bin/bash

# Clean startup script for development server
# This ensures no conflicting processes are running before starting

echo "🚀 Starting development server..."

# Kill any existing vite processes
echo "🧹 Cleaning up any existing vite processes..."
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
sleep 1

# Check if port 5177 is in use
if lsof -ti:5177 > /dev/null 2>&1; then
  echo "⚠️  Port 5177 is already in use. Killing process..."
  lsof -ti:5177 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the dev server
echo "✅ Starting Vite dev server on port 5177..."
npm run dev

