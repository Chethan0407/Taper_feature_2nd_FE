#!/bin/bash
# Build frontend only (without pulling or deploying)

set -e

echo "🔨 Building Frontend"
echo "================================"

cd /home/ubuntu/Taper_feature_2nd_FE

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building production bundle..."
npx vite build

echo ""
echo "✅ Build Complete!"
echo "Output: dist/"
ls -lh dist/
