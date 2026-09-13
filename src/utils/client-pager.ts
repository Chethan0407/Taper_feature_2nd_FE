/**
 * Client-side page window helpers (tables that load full lists then slice).
 */
export function pageSlice<T>(items: T[], page: number, limit: number): T[] {
  const safeLimit = Math.max(1, limit || 10)
  const safePage = Math.max(1, page || 1)
  const start = (safePage - 1) * safeLimit
  return items.slice(start, start + safeLimit)
}

export function totalPages(total: number, limit: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, limit)) || 1)
}

export function rangeLabel(
  total: number,
  page: number,
  limit: number,
  shown: number,
  noun: string,
): string {
  if (!total) return `Showing 0 of 0 ${noun}`
  const from = (page - 1) * limit + 1
  const to = Math.min(from + shown - 1, total)
  const pages = totalPages(total, limit)
  return `Showing ${from}–${to} of ${total} ${noun} · Page ${page} of ${pages}`
}

export function pageNumberWindow(current: number, total: number, size = 5): number[] {
  let start = Math.max(1, current - Math.floor(size / 2))
  let end = Math.min(total, start + size - 1)
  start = Math.max(1, end - size + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
}
