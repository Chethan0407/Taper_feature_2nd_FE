/**
 * Performance Monitoring Utilities
 * 
 * This module provides tools to measure and track application performance,
 * similar to how Facebook tracks performance metrics.
 * 
 * WHY: Performance monitoring helps identify bottlenecks and optimize slow operations.
 * Without metrics, you can't know what's slow or where to optimize.
 * 
 * Features:
 * 1. Function timing - measure how long operations take
 * 2. Performance marks - track specific events
 * 3. Memory usage - monitor memory consumption
 * 4. Network timing - track API call performance
 */

/**
 * Measure execution time of a function
 * 
 * @param name - Name of the operation being measured (for logging/analytics)
 * @param fn - Function to measure
 * 
 * WHY: Helps identify slow operations. If a function takes >100ms, it might
 * need optimization (debouncing, caching, or code splitting).
 * 
 * Example:
 * ```typescript
 * await trackPerformance('loadSpecs', async () => {
 *   await loadSpecifications()
 * })
 * ```
 */
export async function trackPerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now()
  const startMark = `${name}-start`
  const endMark = `${name}-end`

  // Create performance mark for browser DevTools
  // WHY: Shows up in Performance tab, useful for debugging
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(startMark)
  }

  try {
    const result = await fn()
    const end = performance.now()
    const duration = end - start

    // Create end mark
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(endMark)
      // Measure between marks
      performance.measure(name, startMark, endMark)
    }

    // Log in development
    // WHY: Helps developers identify slow operations during development
    if (import.meta.env.DEV) {
      const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '✅'
      console.log(`${emoji} Performance: ${name} took ${duration.toFixed(2)}ms`)
    }

    // In production, send to analytics
    // WHY: Track real-world performance to identify issues in production
    if (import.meta.env.PROD && typeof window !== 'undefined') {
      // Send to your analytics service (e.g., Google Analytics, Sentry)
      // Example:
      // analytics.track('performance', { name, duration })
    }

    return result
  } catch (error) {
    const end = performance.now()
    const duration = end - start

    console.error(`❌ Performance: ${name} failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

/**
 * Measure memory usage (if available)
 * 
 * WHY: Helps identify memory leaks. If memory usage grows continuously,
 * there might be a leak (e.g., event listeners not cleaned up).
 */
export function getMemoryUsage(): {
  used: number
  total: number
  percentage: number
} | null {
  // @ts-ignore - performance.memory is Chrome-specific
  if (typeof performance !== 'undefined' && performance.memory) {
    // @ts-ignore
    const memory = performance.memory
    const used = memory.usedJSHeapSize
    const total = memory.totalJSHeapSize
    const percentage = (used / total) * 100

    return {
      used: Math.round(used / 1024 / 1024), // Convert to MB
      total: Math.round(total / 1024 / 1024), // Convert to MB
      percentage: Math.round(percentage),
    }
  }
  return null
}

/**
 * Log memory usage
 * WHY: Quick way to check memory during development
 */
export function logMemoryUsage(label: string = 'Memory'): void {
  const memory = getMemoryUsage()
  if (memory) {
    console.log(
      `💾 ${label}: ${memory.used}MB / ${memory.total}MB (${memory.percentage}%)`
    )
  }
}

/**
 * Debounce a function to limit how often it executes
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * 
 * WHY: Prevents functions from running too frequently. For example, search
 * input shouldn't trigger API calls on every keystroke - debounce ensures
 * it only runs after user stops typing for 300ms.
 * 
 * Example:
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   searchSpecs(query)
 * }, 300)
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    // Clear previous timeout
    // WHY: If function is called again before delay expires, reset the timer
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle a function to limit execution rate
 * 
 * @param fn - Function to throttle
 * @param limit - Minimum time between executions (milliseconds)
 * 
 * WHY: Similar to debounce but ensures function runs at regular intervals.
 * Useful for scroll handlers, resize handlers, etc.
 * 
 * Example:
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition()
 * }, 100) // Run at most once every 100ms
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Create a performance report for the current page
 * WHY: Useful for debugging performance issues - shows all metrics at once
 */
export function generatePerformanceReport(): void {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    console.warn('Performance API not available')
    return
  }

  // Navigation timing (page load metrics)
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (navigation) {
    console.group('📊 Page Load Performance')
    console.log(`DNS Lookup: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`)
    console.log(`TCP Connection: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`)
    console.log(`Request: ${(navigation.responseStart - navigation.requestStart).toFixed(2)}ms`)
    console.log(`Response: ${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`)
    console.log(`DOM Processing: ${(navigation.domComplete - navigation.domInteractive).toFixed(2)}ms`)
    console.log(`Total Load Time: ${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`)
    console.groupEnd()
  }

  // Resource timing (images, scripts, etc.)
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  if (resources.length > 0) {
    console.group('📦 Resource Loading')
    const slowResources = resources
      .filter((r) => r.duration > 100)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10) // Top 10 slowest

    if (slowResources.length > 0) {
      console.log('Slowest resources:')
      slowResources.forEach((resource) => {
        console.log(`  ${resource.name.split('/').pop()}: ${resource.duration.toFixed(2)}ms`)
      })
    } else {
      console.log('✅ All resources loaded quickly')
    }
    console.groupEnd()
  }

  // Memory usage
  const memory = getMemoryUsage()
  if (memory) {
    console.group('💾 Memory Usage')
    console.log(`Used: ${memory.used}MB`)
    console.log(`Total: ${memory.total}MB`)
    console.log(`Percentage: ${memory.percentage}%`)
    console.groupEnd()
  }
}

