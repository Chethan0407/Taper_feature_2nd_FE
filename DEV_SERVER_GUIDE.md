# Development Server Guide

## Quick Start

### Option 1: Standard Start (Recommended)
```bash
npm run dev
```

### Option 2: Clean Start (If you encounter port conflicts)
```bash
npm run dev:clean
```

This will automatically:
- Kill any existing vite processes
- Free up port 5177 if it's in use
- Install dependencies if needed
- Start the dev server

## Server Configuration

- **Port**: 5177
- **URL**: http://localhost:5177
- **API Proxy**: All `/api/*` requests are proxied to `http://localhost:8000`

## Troubleshooting

### Port Already in Use
If you see "Port 5177 is already in use":
```bash
# Kill the process using port 5177
lsof -ti:5177 | xargs kill -9

# Or use the clean start script
npm run dev:clean
```

### Server Not Responding
1. Check if the server is running:
   ```bash
   lsof -ti:5177
   ```

2. Check if the backend API is running on port 8000:
   ```bash
   lsof -ti:8000
   ```

3. Restart with clean script:
   ```bash
   npm run dev:clean
   ```

### App Stuck on Loading Screen
- Ensure the backend API server is running on `http://localhost:8000`
- Check browser console for errors
- Verify API proxy is working by checking Network tab in DevTools

## Important Notes

- The API proxy is **critical** - without it, the app will hang on loading
- Always ensure the backend is running before starting the frontend
- If you change the vite.config.ts, restart the dev server

