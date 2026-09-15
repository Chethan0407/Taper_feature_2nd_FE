#!/bin/bash
# Frontend Deployment Script
# Deploys the latest changes to production

set -e

echo "🚀 Starting Frontend Deployment"
echo "================================"

# Navigate to project directory
cd /home/ubuntu/Taper_feature_2nd_FE

echo ""
echo "📦 Step 1: Pulling latest changes from git..."
git pull origin main

echo ""
echo "📦 Step 2: Installing dependencies..."
npm install

echo ""
echo "📈 Step 2b: Refreshing Cloudflare traffic snapshot (if credentials present)..."
if [ -f "$HOME/.config/tapeoutops/cloudflare.env" ] || [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
  # shellcheck disable=SC1090
  [ -f "$HOME/.config/tapeoutops/cloudflare.env" ] && set -a && . "$HOME/.config/tapeoutops/cloudflare.env" && set +a
  node scripts/fetch-cloudflare-traffic.mjs || echo "⚠️  Cloudflare traffic fetch failed (continuing deploy)"
else
  echo "⏭️  Skipping (no CLOUDFLARE_API_TOKEN / ~/.config/tapeoutops/cloudflare.env)"
fi

echo ""
echo "🔨 Step 3: Building production bundle..."
npx vite build

echo ""
echo "🔐 Step 4: Fixing permissions..."
sudo chmod -R 755 dist
sudo chmod 755 /home/ubuntu/Taper_feature_2nd_FE
sudo chmod 755 /home/ubuntu

echo ""
echo "🔄 Step 5: Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Deployment Complete!"
echo "================================"
echo "🌐 Frontend is live at: https://tapeoutops.com/"
echo ""
