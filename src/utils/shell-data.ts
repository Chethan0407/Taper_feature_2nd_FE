/**
 * Shared shell/page reads — one network call shared across Header, Dashboard, Stats, etc.
 */
import { authenticatedFetch } from '@/utils/auth-requests'
import { dedupeAsync, withBoundedRetry } from '@/utils/request-coordinator'

const SHELL_TTL_MS = 8_000

export async function fetchUnreadNotifications(signal?: AbortSignal): Promise<any[]> {
  return dedupeAsync(
    'GET:/api/v1/notifications?is_read=false',
    () =>
      withBoundedRetry(
        async () => {
          let res = await authenticatedFetch('/api/v1/notifications?is_read=false', { signal })
          if (res.status === 404) {
            res = await authenticatedFetch('/api/v1/notifications/?is_read=false', { signal })
          }
          if (!res.ok) {
            throw new Error(`notifications ${res.status}`)
          }
          const data = await res.json()
          return Array.isArray(data) ? data : data?.results || []
        },
        { retries: 1, baseDelayMs: 500, signal },
      ),
    { ttlMs: SHELL_TTL_MS },
  )
}

export async function fetchDashboardJson(
  queryString = '',
  signal?: AbortSignal,
): Promise<any> {
  const path = queryString ? `/api/v1/dashboard?${queryString}` : '/api/v1/dashboard'
  return dedupeAsync(
    `GET:${path}`,
    () =>
      withBoundedRetry(
        async () => {
          const res = await authenticatedFetch(path, { signal })
          if (!res.ok) {
            const text = await res.text().catch(() => '')
            throw new Error(text || `dashboard ${res.status}`)
          }
          return res.json()
        },
        { retries: 1, baseDelayMs: 500, signal },
      ),
    { ttlMs: SHELL_TTL_MS },
  )
}
