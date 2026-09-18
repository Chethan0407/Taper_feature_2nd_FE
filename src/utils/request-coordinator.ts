/**
 * Request coordinator — stops API fan-out storms that exhaust backend pools.
 *
 * - In-flight GET dedupe (identical keys share one promise)
 * - Short TTL cache for hot shell reads (me / notifications / dashboard)
 * - Concurrency-limited maps (e.g. checklist completions)
 * - Abort scopes so company/page switches cancel stale work
 * - Bounded retry with backoff (never unbounded refetch storms)
 */

type CacheEntry<T> = { data: T; expiresAt: number }

const inflight = new Map<string, Promise<unknown>>()
const softCache = new Map<string, CacheEntry<unknown>>()

export function createRequestScope(_name = 'scope') {
  let controller = new AbortController()

  return {
    get signal() {
      return controller.signal
    },
    /** Abort any prior work in this scope and start a new generation. */
    begin() {
      try {
        controller.abort()
      } catch {
        /* ignore */
      }
      controller = new AbortController()
      return controller.signal
    },
    abort() {
      try {
        controller.abort()
      } catch {
        /* ignore */
      }
    },
  }
}

/** Shared scope aborted on every authenticated route change (cancels stale page traffic). */
export const navigationScope = createRequestScope('navigation')

export function bumpNavigationGeneration() {
  navigationScope.begin()
}

export function isAbortError(err: unknown): boolean {
  // Strict check only — do NOT match message text. Timeouts and "Network error: aborted"
  // wrappers used to be swallowed as aborts, leaving Stats/modules empty with no retry UI.
  if (!err || typeof err !== 'object') return false
  const e = err as { name?: string; code?: string }
  return e.name === 'AbortError' || e.code === 'ABORT_ERR'
}

/** Wait for a shared promise, but stop waiting if the caller scope aborts (without aborting peers). */
export function raceAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'))
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (err) => {
        signal.removeEventListener('abort', onAbort)
        reject(err)
      },
    )
  })
}

export function friendlyHttpError(status: number, body = ''): string {
  if (status === 502 || status === 503 || status === 504) {
    return 'The API is temporarily unavailable. Please try again in a moment.'
  }
  if (status === 401) return 'Your session expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to view this data.'
  const trimmed = String(body || '').trim()
  if (trimmed && trimmed.length < 180 && !trimmed.startsWith('<')) return trimmed
  return `Request failed (${status}). Please try again.`
}

/**
 * Dedupe identical async work. Concurrent callers await the same promise.
 * Optional short TTL returns cached data without hitting the network.
 */
export async function dedupeAsync<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { ttlMs?: number },
): Promise<T> {
  const ttlMs = opts?.ttlMs ?? 0
  if (ttlMs > 0) {
    const cached = softCache.get(key) as CacheEntry<T> | undefined
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }
  }

  const existing = inflight.get(key) as Promise<T> | undefined
  if (existing) return existing

  const promise = (async () => {
    try {
      const data = await fetcher()
      if (ttlMs > 0) {
        softCache.set(key, { data, expiresAt: Date.now() + ttlMs })
      }
      return data
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, promise)
  return promise
}

/** Drop soft-cache / inflight entries matching a substring (e.g. after company switch). */
export function invalidateRequestCache(match?: string) {
  if (!match) {
    softCache.clear()
    return
  }
  for (const key of softCache.keys()) {
    if (key.includes(match)) softCache.delete(key)
  }
  for (const key of inflight.keys()) {
    if (key.includes(match)) inflight.delete(key)
  }
}

/**
 * Run async work over items with a hard concurrency ceiling.
 * Honors AbortSignal — remaining items are skipped after abort.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number, signal: AbortSignal) => Promise<R>,
  signal?: AbortSignal,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  const max = Math.max(1, Math.min(limit, items.length || 1))
  let next = 0

  async function runOne() {
    while (next < items.length) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      const index = next++
      const item = items[index]
      results[index] = await worker(item, index, signal ?? new AbortController().signal)
    }
  }

  const runners = Array.from({ length: Math.min(max, items.length) }, () => runOne())
  await Promise.all(runners)
  return results
}

export async function withBoundedRetry<T>(
  fn: () => Promise<T>,
  opts?: { retries?: number; baseDelayMs?: number; signal?: AbortSignal },
): Promise<T> {
  const retries = opts?.retries ?? 2
  const baseDelayMs = opts?.baseDelayMs ?? 400
  let attempt = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (opts?.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    try {
      return await fn()
    } catch (err) {
      if (isAbortError(err)) throw err
      if (attempt >= retries) throw err
      const delay = baseDelayMs * Math.pow(2, attempt)
      attempt += 1
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, delay)
        opts?.signal?.addEventListener(
          'abort',
          () => {
            clearTimeout(t)
            reject(new DOMException('Aborted', 'AbortError'))
          },
          { once: true },
        )
      })
    }
  }
}
