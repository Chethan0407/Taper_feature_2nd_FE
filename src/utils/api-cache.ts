/**
 * API Request Cache with Deduplication
 * 
 * This utility implements Facebook-level request optimization:
 * 1. Request Caching: Stores API responses to avoid redundant network calls
 * 2. Request Deduplication: Prevents multiple identical requests from running simultaneously
 * 3. TTL (Time To Live): Automatically expires stale cache entries
 * 
 * WHY: Without caching, the same API endpoint might be called multiple times
 * (e.g., when multiple components mount). This wastes bandwidth, slows down
 * the app, and increases server load. Caching ensures each unique request
 * only happens once, dramatically improving performance.
 * 
 * Example usage:
 * ```typescript
 * const data = await apiCache.get('specs-list', () => fetchSpecs())
 * ```
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class RequestCache {
  /**
   * Cache storage - maps request keys to cached responses
   * WHY: Using Map for O(1) lookup performance
   */
  private cache = new Map<string, CacheEntry<any>>()

  /**
   * Tracks in-flight requests to prevent duplicate concurrent requests
   * WHY: If 3 components request the same data simultaneously, we only
   * make 1 API call and share the result with all 3
   */
  private pendingRequests = new Map<string, Promise<any>>()

  /**
   * Default Time To Live (TTL) for cached entries
   * WHY: 5 minutes balances freshness with performance. Data older than
   * 5 minutes is considered stale and will be refetched
   */
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

  /**
   * Get data from cache or fetch if not cached/expired
   * 
   * @param key - Unique identifier for this request (e.g., 'specs-list', 'user-profile')
   * @param fetcher - Function that fetches the data if not in cache
   * @param ttl - Optional custom TTL for this specific request (defaults to 5 minutes)
   * 
   * WHY: This method implements the core caching logic:
   * 1. Check if we have valid cached data
   * 2. If not, check if a request is already in-flight (deduplication)
   * 3. If neither, fetch the data and cache it
   * 
   * @returns Promise resolving to the cached or freshly fetched data
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Step 1: Check if we have valid cached data
    // WHY: Avoids network request if we have recent data
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`✅ Cache hit: ${key}`)
      return cached.data
    }

    // Step 2: Check if a request is already in-flight (deduplication)
    // WHY: If 5 components request the same data at once, we only make 1 API call
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ Request deduplication: ${key} (waiting for in-flight request)`)
      return this.pendingRequests.get(key)!
    }

    // Step 3: Fetch the data and cache it
    // WHY: Store the promise so other callers can await the same request
    const promise = fetcher()
      .then((data) => {
        // Cache the successful response
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
        })
        // Remove from pending requests
        this.pendingRequests.delete(key)
        console.log(`💾 Cached: ${key}`)
        return data
      })
      .catch((error) => {
        // Remove from pending requests on error
        // WHY: Allows retry on next call
        this.pendingRequests.delete(key)
        throw error
      })

    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * Invalidate cached entries
   * 
   * @param pattern - Optional pattern to match keys (e.g., 'specs' invalidates all specs-related cache)
   *                  If not provided, clears entire cache
   * 
   * WHY: Sometimes data changes and we need to force a refresh.
   * For example, after creating a new spec, we should invalidate
   * the 'specs-list' cache so the new spec appears.
   */
  invalidate(pattern?: string): void {
    if (pattern) {
      // Invalidate only matching keys
      // WHY: More granular control - we can invalidate only related cache entries
      let invalidatedCount = 0
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
          invalidatedCount++
        }
      }
      console.log(`🗑️ Invalidated ${invalidatedCount} cache entries matching: ${pattern}`)
    } else {
      // Clear entire cache
      // WHY: Useful for logout or major data refresh
      const size = this.cache.size
      this.cache.clear()
      console.log(`🗑️ Cleared entire cache (${size} entries)`)
    }
  }

  /**
   * Get cache statistics for debugging
   * WHY: Helps identify cache hit rates and optimize TTL values
   */
  getStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  /**
   * Clear expired cache entries
   * WHY: Prevents memory leaks from stale cache entries
   */
  clearExpired(ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now()
    let clearedCount = 0
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= ttl) {
        this.cache.delete(key)
        clearedCount++
      }
    }
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired cache entries`)
    }
  }
}

// Export singleton instance
// WHY: Single cache instance ensures all parts of the app share the same cache
export const apiCache = new RequestCache()

// Auto-cleanup expired entries every 10 minutes
// WHY: Prevents memory leaks from accumulated stale cache entries
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.clearExpired()
  }, 10 * 60 * 1000) // Every 10 minutes
}

