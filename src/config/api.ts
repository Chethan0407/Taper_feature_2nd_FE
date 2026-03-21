/**
 * Browser API base. In dev, defaults to FastAPI on :8000 so requests hit the backend directly.
 * Production: same-origin `/api/...` unless VITE_API_ORIGIN is set.
 */
const raw =
  import.meta.env.VITE_API_ORIGIN ??
  (import.meta.env.DEV ? 'http://localhost:8000' : '')

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
