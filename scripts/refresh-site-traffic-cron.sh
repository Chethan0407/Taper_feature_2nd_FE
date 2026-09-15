#!/bin/bash
# Refresh Cloudflare site-traffic.json so System Usage stays near-live without a BE endpoint.
set -euo pipefail
cd /home/ubuntu/Taper_feature_2nd_FE
if [ -f "$HOME/.config/tapeoutops/cloudflare.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$HOME/.config/tapeoutops/cloudflare.env"
  set +a
fi
node scripts/fetch-cloudflare-traffic.mjs
# Keep nginx-served copy fresh without full rebuild
if [ -d dist ]; then
  cp -f public/site-traffic.json dist/site-traffic.json
  chmod 644 dist/site-traffic.json || true
fi
