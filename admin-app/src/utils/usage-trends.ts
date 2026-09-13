/** Daily point from GET /admin/usage/trends */
export type TrendPoint = { date: string; count: number }

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Backend returns only days with activity (sparse). Charts need a full window
 * so a single busy day does not render as one full-width solid block.
 */
export function fillDailySeries(
  points: TrendPoint[] | undefined | null,
  days: number,
  end: Date = new Date(),
): TrendPoint[] {
  const dayCount = Math.max(1, Math.min(365, Number(days) || 30))
  const byDate = new Map<string, number>()
  for (const p of points || []) {
    const key = String(p?.date || '').slice(0, 10)
    if (!key) continue
    byDate.set(key, (byDate.get(key) || 0) + (Number(p.count) || 0))
  }

  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  const out: TrendPoint[] = []
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(endDay)
    d.setDate(endDay.getDate() - i)
    const key = formatLocalYmd(d)
    out.push({ date: key, count: byDate.get(key) ?? 0 })
  }
  return out
}

export function trendSeriesMax(points: TrendPoint[]): number {
  if (!points.length) return 1
  return Math.max(1, ...points.map((p) => Number(p.count) || 0))
}

export function trendBarPercent(count: number, max: number): number {
  const m = Math.max(1, max)
  const c = Math.max(0, Number(count) || 0)
  if (c <= 0) return 0
  return Math.max(4, Math.round((c / m) * 100))
}
