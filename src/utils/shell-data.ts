/**
 * Shared shell/page reads — one network call shared across Header, Dashboard, Stats, etc.
 */
import { authenticatedFetch } from '@/utils/auth-requests'
import {
  dedupeAsync,
  withBoundedRetry,
  raceAbort,
  friendlyHttpError,
} from '@/utils/request-coordinator'

const SHELL_TTL_MS = 8_000

export async function fetchUnreadNotifications(signal?: AbortSignal): Promise<any[]> {
  return raceAbort(
    dedupeAsync(
      'GET:/api/v1/notifications?is_read=false',
      () =>
        withBoundedRetry(
          async () => {
            let res = await authenticatedFetch('/api/v1/notifications?is_read=false')
            if (res.status === 404) {
              res = await authenticatedFetch('/api/v1/notifications/?is_read=false')
            }
            if (!res.ok) {
              throw new Error(friendlyHttpError(res.status, await res.text().catch(() => '')))
            }
            const data = await res.json()
            return Array.isArray(data) ? data : data?.results || []
          },
          { retries: 1, baseDelayMs: 500 },
        ),
      { ttlMs: SHELL_TTL_MS },
    ),
    signal,
  )
}

export async function fetchDashboardJson(
  queryString = '',
  signal?: AbortSignal,
): Promise<any> {
  const path = queryString ? `/api/v1/dashboard?${queryString}` : '/api/v1/dashboard'
  return raceAbort(
    dedupeAsync(
      `GET:${path}`,
      () =>
        withBoundedRetry(
          async () => {
            // Intentionally no page AbortSignal here — page scopes race via raceAbort so
            // one navigation abort does not cancel the shared in-flight GET for other consumers.
            const res = await authenticatedFetch(path)
            if (!res.ok) {
              throw new Error(friendlyHttpError(res.status, await res.text().catch(() => '')))
            }
            return res.json()
          },
          { retries: 1, baseDelayMs: 500 },
        ),
      { ttlMs: SHELL_TTL_MS },
    ),
    signal,
  )
}
