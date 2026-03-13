# TapeOutOps Admin – System Usage

Standalone admin dashboard for **System Usage** (internal usage and activity). Separate from the main TapeOutOps app.

## Run locally

```bash
cd admin-app
npm install
npm run dev
```

Opens at **http://localhost:5180**. Log in with an **admin** account (same credentials as main app). Backend must be running (e.g. `http://localhost:8000`) or set `VITE_API_BASE` for a remote API.

## Build for production

```bash
npm run build
```

Then deploy the `dist/` folder. Set **VITE_API_BASE** to your API origin when building for prod/staging, e.g.:

```bash
VITE_API_BASE=https://tapeoutops.com npm run build
```

For staging:

```bash
VITE_API_BASE=https://staging.tapeoutops.com npm run build
```

## Environment

| Variable         | Description |
|------------------|-------------|
| `VITE_API_BASE`  | API base URL (e.g. `https://tapeoutops.com`). Leave unset in dev to use the Vite proxy to `localhost:8000`. |

## Features

- Login (admin JWT from `/api/v1/auth/login`)
- Overview KPIs, trends, users table, activity feed, domains, most active users
- All requests use `Authorization: Bearer <token>`
