#!/bin/bash
# Check frontend status

echo "🔍 Frontend Status Check"
echo "================================"

echo ""
echo "📁 Build Directory:"
if [ -d "/home/ubuntu/Taper_feature_2nd_FE/dist" ]; then
    echo "✅ dist/ exists"
    echo "Size: $(du -sh /home/ubuntu/Taper_feature_2nd_FE/dist | cut -f1)"
    echo "Files: $(find /home/ubuntu/Taper_feature_2nd_FE/dist -type f | wc -l)"
else
    echo "❌ dist/ not found - run 'npm run build' first"
fi

echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager | grep "Active:"

echo ""
echo "🔗 Test Frontend:"
curl -sI https://tapeoutops.com/ | grep "HTTP"

echo ""
echo "📊 Latest Git Commit:"
cd /home/ubuntu/Taper_feature_2nd_FE
git log -1 --oneline

echo ""
echo "🔄 Git Status:"
git status -s
