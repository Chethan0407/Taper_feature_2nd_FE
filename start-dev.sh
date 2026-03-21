#!/bin/bash

# Clean startup script for development server
# This ensures no conflicting processes are running before starting

echo "🚀 Starting development server..."

# Free TCP listener on 5177 (usually a leftover dev server)
echo "🧹 Freeing port 5177..."
for pid in $(lsof -nP -iTCP:5177 -sTCP:LISTEN -t 2>/dev/null); do
  echo "⚠️  Stopping pid $pid"
  kill -9 "$pid" 2>/dev/null || true
done
sleep 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the dev server
echo "✅ Starting Vite dev server on port 5177..."
npm run dev

