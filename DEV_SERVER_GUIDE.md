# Development Server Guide

## Quick Start

**Important:** If you run `npm install` and `npm run dev` in the same paste block, **wait until `npm install` fully finishes** (the spinner stops and you get your shell prompt back). The `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` animation is **npm still working**, not Vite. Only then will `npm run dev` run.

### Option 1: Standard Start (Recommended)
```bash
npm run dev
```

### One command (install, clear Vite cache, then dev)
```bash
npm run dev:fresh
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

- **Port**: 5177 (fixed — if something else uses 5177, Vite will error instead of picking another port)
- **URL**: http://localhost:5177 or http://127.0.0.1:5177
- **API Proxy**: The browser correctly calls **`http://localhost:5177/api/v1/...`**. Vite **proxies** `/api` to your backend (default **`http://localhost:8000`**). You do **not** need to point the SPA at `:8000` in code for local dev.
- **Before debugging login**: run **`npm run check:api`** — it should print **`HTTP 200`** (or 3xx) when FastAPI is up. **`ECONNREFUSED` / `ETIMEDOUT`** in the Vite terminal means **nothing answered on port 8000** from this machine (API not started, wrong port, VPN/firewall, or Docker not published to the host).
- **Override proxy target**: Copy `.env.example` → `.env` and set `VITE_API_PROXY_TARGET` (e.g. `http://localhost:8000` or `http://host.docker.internal:8000` in Docker setups). On `npm run dev`, the terminal prints `[vite-config] API proxy: /api → …`.

### Login / Network tab shows `5177` / “Provisional headers” / proxy errors

- **`http://localhost:5177/api/...`** in DevTools is **normal** with the proxy above.
- **`ETIMEDOUT` or `ECONNREFUSED` to `127.0.0.1:8000` in the Vite terminal** means the **proxy cannot open a TCP connection to the backend**. Fix the **API process** (running? correct host/port?), not the frontend URL. Try `curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/docs` from the same machine as `npm run dev`.
- If **`127.0.0.1` times out** but the API answers on **`localhost`**, set `VITE_API_PROXY_TARGET=http://localhost:8000` in `.env`.

### If you see `ERR_CONNECTION_REFUSED`

1. **Start the server** and leave that terminal open: `npm run dev` or `npm run dev:clean`
2. In the terminal, confirm it says **`Local:`** with port **5177**.
3. Try **http://127.0.0.1:5177** if `localhost` fails.
4. Free the port and retry: `lsof -ti:5177 | xargs kill -9` then `npm run dev`

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

### `ENOENT` / missing `dep-827b23df.js` (or other `node_modules/vite/dist/...` files)

That means **`node_modules` is mixed or corrupted** (e.g. Vite 4 paths with a Vite 5 install). Fix:

```bash
npm run reinstall
```

Or manually: `rm -rf node_modules package-lock.json && npm install`

### App Stuck on Loading Screen
- Ensure the backend API server is running on `http://127.0.0.1:8000` (or `http://localhost:8000` if it listens on both)
- Check browser console for errors
- Verify API proxy is working by checking Network tab in DevTools

## Important Notes

- The API proxy is **critical** - without it, the app will hang on loading
- Always ensure the backend is running before starting the frontend
- If you change `vite.config.mjs`, restart the dev server

