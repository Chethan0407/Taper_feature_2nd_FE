# Frontend Deployment Guide

Complete guide for deploying the TapeOutOps frontend application.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Deployment Scenarios](#deployment-scenarios)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

---

## 🚀 Quick Start

### First Time Setup

Already done! But if you need to set up on a new server:

1. Install Node.js 20+
2. Clone the repository
3. Run initial setup:
```bash
cd /home/ubuntu/Taper_feature_2nd_FE
npm install
npm run build
```

### Deploy New Changes

**The easiest way** - just run one command:

```bash
./scripts/deploy.sh
```

That's it! Your changes are now live at https://tapeoutops.com/

---

## 📦 Available Scripts

All scripts are located in the `scripts/` directory.

### `./scripts/deploy.sh`
**Most commonly used!** Deploys latest changes to production.

**What it does:**
- Pulls latest code from git
- Installs new dependencies
- Builds production bundle
- Fixes permissions
- Reloads Nginx

**When to use:**
- You pushed new code to git and want to deploy it
- Regular updates and feature releases

**Usage:**
```bash
cd /home/ubuntu/Taper_feature_2nd_FE
./scripts/deploy.sh
```

---

### `./scripts/build.sh`
Builds the production bundle without deploying.

**What it does:**
- Installs dependencies
- Creates optimized production build in `dist/`

**When to use:**
- Testing the build process
- Building locally before manual deployment

**Usage:**
```bash
./scripts/build.sh
```

---

### `./scripts/check.sh`
Checks the status of your frontend deployment.

**What it does:**
- Verifies dist/ directory exists
- Checks Nginx status
- Tests frontend URL
- Shows latest git commit
- Shows git status

**When to use:**
- Verifying deployment was successful
- Debugging issues
- Checking current state

**Usage:**
```bash
./scripts/check.sh
```

---

### `./scripts/dev.sh`
Starts the development server (for local development).

**What it does:**
- Runs Vite dev server on http://localhost:5177
- Enables hot module replacement

**When to use:**
- Local development and testing

**Usage:**
```bash
./scripts/dev.sh
```

---

### `./scripts/install.sh`
Installs or updates npm dependencies.

**What it does:**
- Runs `npm install`

**When to use:**
- After pulling code with new dependencies
- Fixing dependency issues

**Usage:**
```bash
./scripts/install.sh
```

---

## 🎯 Deployment Scenarios

### Scenario 1: Deploying New Features

**Situation:** You or your team pushed new code to the `main` branch.

**Steps:**
```bash
cd /home/ubuntu/Taper_feature_2nd_FE
./scripts/deploy.sh
```

**Time:** ~2-3 minutes

**Verification:**
- Visit https://tapeoutops.com/
- Check browser console for errors
- Test the new features

---

### Scenario 2: Emergency Rollback

**Situation:** The latest deployment has a critical bug.

**Steps:**

1. Find the last working commit:
```bash
cd /home/ubuntu/Taper_feature_2nd_FE
git log --oneline
```

2. Revert to that commit:
```bash
git reset --hard <commit-hash>
```

3. Rebuild and deploy:
```bash
./scripts/deploy.sh
```

**Alternative:** If you have a backup:
```bash
sudo rm -rf dist
sudo cp -r /home/ubuntu/dist_backup_YYYYMMDD_HHMMSS dist
sudo chmod -R 755 dist
sudo systemctl reload nginx
```

---

### Scenario 3: Nginx Configuration Changes

**Situation:** You need to update the Nginx configuration (e.g., add new routes, change caching).

**Steps:**

1. Edit the Nginx config:
```bash
sudo nano /etc/nginx/sites-available/tapeoutops
```

2. Test the configuration:
```bash
sudo nginx -t
```

3. If test passes, reload Nginx:
```bash
sudo systemctl reload nginx
```

**Tip:** Keep a backup of working configs!

---

### Scenario 4: Hotfix Without Git Pull

**Situation:** You made a quick fix directly on the server (not recommended for production, but sometimes necessary).

**Steps:**

1. Make your changes in `src/`

2. Build and deploy:
```bash
./scripts/build.sh
sudo chmod -R 755 dist
sudo systemctl reload nginx
```

3. Don't forget to commit and push your changes to git!

---

### Scenario 5: Fresh Deployment

**Situation:** Setting up on a new server or after major changes.

**Steps:**

1. Clone the repository:
```bash
cd /home/ubuntu
git clone <repository-url> Taper_feature_2nd_FE
cd Taper_feature_2nd_FE
```

2. Install dependencies:
```bash
./scripts/install.sh
```

3. Create production environment file:
```bash
cat > .env.production << 'ENVEOF'
VITE_API_BASE_URL=https://tapeoutops.com/api
VITE_APP_NAME=TapeOutOps
ENVEOF
```

4. Build:
```bash
./scripts/build.sh
```

5. Configure Nginx (see Nginx section below)

6. Deploy:
```bash
./scripts/deploy.sh
```

---

### Scenario 6: Dependency Updates

**Situation:** Package.json was updated with new dependencies or version bumps.

**Steps:**

1. Pull latest changes:
```bash
git pull origin main
```

2. Install dependencies:
```bash
./scripts/install.sh
```

3. Test build:
```bash
./scripts/build.sh
```

4. If successful, deploy:
```bash
sudo chmod -R 755 dist
sudo systemctl reload nginx
```

Or just use:
```bash
./scripts/deploy.sh
```

---

## 🔧 Troubleshooting

### Build Fails

**Problem:** `npm run build` fails with errors.

**Solutions:**

1. Check Node.js version:
```bash
node --version  # Should be 20+
```

2. Clean install dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Check for TypeScript errors:
```bash
npx vue-tsc --noEmit
```

---

### Frontend Shows Old Version

**Problem:** Deployed new code but still seeing old version.

**Solutions:**

1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

2. Check if build actually updated:
```bash
ls -lt dist/js/ | head
```

3. Verify Nginx served latest files:
```bash
curl -I https://tapeoutops.com/
# Check Last-Modified header
```

4. Clear Cloudflare cache (if using)

---

### Permission Denied Errors

**Problem:** Nginx can't read files (500 error or permission denied in logs).

**Solution:**
```bash
sudo chmod 755 /home/ubuntu
sudo chmod 755 /home/ubuntu/Taper_feature_2nd_FE
sudo chmod -R 755 /home/ubuntu/Taper_feature_2nd_FE/dist
sudo systemctl restart nginx
```

---

### 404 on Page Refresh

**Problem:** Navigating works, but refreshing gives 404.

**Solution:** Check Nginx has SPA fallback configured:
```bash
sudo grep "try_files" /etc/nginx/sites-available/tapeoutops
# Should see: try_files $uri $uri/ /index.html;
```

---

### API Calls Failing

**Problem:** Frontend loads but API calls return errors.

**Check:**

1. Backend is running:
```bash
cd /home/ubuntu/Taper_BE_staging_2
./check_services.sh
```

2. Check Nginx proxy configuration:
```bash
sudo nginx -t
```

3. View Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

---

## 🏗️ Architecture

### File Structure

```
/home/ubuntu/Taper_feature_2nd_FE/
├── dist/                    # Production build (served by Nginx)
├── src/                     # Source code
│   ├── components/          # Vue components
│   ├── views/               # Page views
│   ├── stores/              # Pinia stores
│   ├── router/              # Vue Router config
│   └── utils/               # Utility functions
├── scripts/                 # Deployment scripts
│   ├── deploy.sh           # Main deployment script
│   ├── build.sh            # Build only
│   ├── check.sh            # Status check
│   ├── dev.sh              # Dev server
│   └── install.sh          # Install dependencies
├── .env.production         # Production environment variables
├── package.json            # Dependencies
├── vite.config.ts          # Build configuration
└── DEPLOYMENT.md           # This file
```

### Request Flow

```
User Browser
    ↓
Cloudflare CDN
    ↓
Nginx (Port 443)
    ├── / → Static files (dist/)
    └── /api/ → Backend (Port 8000)
```

### Build Process

```
Source Code (src/)
    ↓
Vue Compiler + TypeScript
    ↓
Vite Bundler
    ├── Code Splitting
    ├── Minification
    ├── Tree Shaking
    └── Asset Optimization
    ↓
Production Bundle (dist/)
    ├── index.html
    ├── assets/*.css
    └── js/*.js
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Environment variables don't contain secrets in plain text
- [ ] HTTPS is enabled
- [ ] Security headers are configured in Nginx
- [ ] CORS is properly configured
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Build doesn't include source maps in production
- [ ] Console logs are removed from production code

---

## 📊 Monitoring

### Check Deployment Status

```bash
./scripts/check.sh
```

### View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Check Build Size

```bash
du -sh dist/
ls -lh dist/js/
ls -lh dist/assets/
```

---

## 🆘 Need Help?

### Common Commands

```bash
# Deploy new changes
./scripts/deploy.sh

# Check status
./scripts/check.sh

# View logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx config
sudo nginx -t
```

### Important Files

- **Nginx Config:** `/etc/nginx/sites-available/tapeoutops`
- **Frontend Files:** `/home/ubuntu/Taper_feature_2nd_FE/dist`
- **Environment:** `/home/ubuntu/Taper_feature_2nd_FE/.env.production`
- **Logs:** `/var/log/nginx/error.log`

---

**Last Updated:** January 3, 2026  
**Node.js Version:** v20.19.6  
**Vue Version:** 3.3.8  
**Build Tool:** Vite 4.5.14
