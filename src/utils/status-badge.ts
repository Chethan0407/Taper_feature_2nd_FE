/** Amazon-style semantic status badges — shared across lists and detail views. */

export type StatusTone = 'success' | 'pending' | 'danger' | 'neutral' | 'info' | 'warning'

const TONE_CLASS: Record<StatusTone, string> = {
  success: 'status-badge status-badge--success',
  pending: 'status-badge status-badge--pending',
  danger: 'status-badge status-badge--danger',
  neutral: 'status-badge status-badge--neutral',
  info: 'status-badge status-badge--info',
  warning: 'status-badge status-badge--warning',
}

/** Map any product status / severity string to a badge tone. */
export function statusTone(status: string | null | undefined): StatusTone {
  const s = String(status ?? '')
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, ' ')

  if (
    s === 'active' ||
    s === 'approved' ||
    s === 'complete' ||
    s === 'completed' ||
    s === 'passed' ||
    s === 'success' ||
    s === 'enabled' ||
    s === 'published' ||
    s === 'linked'
  ) {
    return 'success'
  }

  if (
    s === 'pending' ||
    s === 'pending review' ||
    s === 'in review' ||
    s === 'in progress' ||
    s === 'processing' ||
    s === 'draft' ||
    s === 'submitted' ||
    s === 'waiting'
  ) {
    return 'pending'
  }

  if (
    s === 'rejected' ||
    s === 'declined' ||
    s === 'failed' ||
    s === 'error' ||
    s === 'blocked' ||
    s === 'cancelled' ||
    s === 'canceled' ||
    s === 'deleted' ||
    s === 'expired'
  ) {
    return 'danger'
  }

  if (s === 'warning' || s === 'at risk' || s === 'expiring') {
    return 'warning'
  }

  if (s === 'info' || s === 'open' || s === 'new') {
    return 'info'
  }

  if (s === 'inactive' || s === 'disabled' || s === 'archived' || s === 'closed' || s === 'unknown' || !s) {
    return 'neutral'
  }

  return 'neutral'
}

/** Full Tailwind/CSS class string for a status chip. */
export function statusBadgeClass(status: string | null | undefined): string {
  return TONE_CLASS[statusTone(status)]
}

/** Severity (error / warning / info) → badge classes. */
export function severityBadgeClass(severity: string | null | undefined): string {
  const s = String(severity ?? '').toLowerCase().trim()
  if (s === 'error' || s === 'critical') return TONE_CLASS.danger
  if (s === 'warning') return TONE_CLASS.warning
  if (s === 'info' || s === 'success') return s === 'success' ? TONE_CLASS.success : TONE_CLASS.info
  return TONE_CLASS.neutral
}

/** Display label — title case for readability. */
export function formatStatusLabel(status: string | null | undefined): string {
  const raw = String(status ?? '').trim()
  if (!raw) return 'Unknown'
  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
