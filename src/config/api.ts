/**
 * Browser API base.
 * Default: same-origin `/api/...` (Vite proxies to FastAPI in dev).
 * Override with VITE_API_ORIGIN when you need a direct backend URL.
 */
const raw = import.meta.env.VITE_API_ORIGIN ?? ''

export const API_ORIGIN = String(raw).replace(/\/$/, '')

export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const p = path.startsWith('/') ? path : `/${path}`
  if (!API_ORIGIN) {
    return p
  }
  return `${API_ORIGIN}${p}`
}
