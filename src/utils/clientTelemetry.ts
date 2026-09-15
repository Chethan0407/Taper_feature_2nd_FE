import { resolveApiUrl } from '@/config/api'

/** Default relative path; backend should accept POST JSON. */
const DEFAULT_UI_EVENTS_PATH = '/api/v1/auth/ui-events'

function isTelemetryDisabled(): boolean {
  return (
    import.meta.env.VITE_DISABLE_UI_TELEMETRY === '1' ||
    import.meta.env.VITE_DISABLE_UI_TELEMETRY === 'true'
  )
}

function resolveTelemetryUrl(): string {
  const override = import.meta.env.VITE_UI_TELEMETRY_URL?.trim()
  if (override && /^https?:\/\//i.test(override)) {
    return override
  }
  if (override) {
    const p = override.startsWith('/') ? override : `/${override}`
    return resolveApiUrl(p)
  }
  return resolveApiUrl(DEFAULT_UI_EVENTS_PATH)
}

function sendTelemetryBody(body: Record<string, unknown>): void {
  if (isTelemetryDisabled()) return

  const url = resolveTelemetryUrl()
  const json = JSON.stringify(body)

  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const ok = navigator.sendBeacon(url, new Blob([json], { type: 'application/json' }))
      if (ok) return
    }
  } catch {
    /* fall through to fetch */
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
    credentials: 'omit',
    keepalive: true
  }).catch(() => {})
}

/**
 * Fire-and-forget UI telemetry. Safe payload only — never pass user-typed secrets.
 * Production: enable by implementing POST on the default path, or set VITE_UI_TELEMETRY_URL.
 * Disable: VITE_DISABLE_UI_TELEMETRY=1
 */
export function reportUiEvent(
  event: string,
  payload: Record<string, string | number | boolean>
): void {
  sendTelemetryBody({
    event,
    payload,
    ts: Date.now(),
    path: typeof window !== 'undefined' ? window.location.pathname : ''
  })
}

/** Full `user@host.tld` — used only to set `partial: false` on the wire. */
const SIGNUP_EMAIL_COMPLETE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * True when the user has typed enough in the email field to show intent:
 * non-empty local part, @, and domain segment at least 2 chars (e.g. `alex@acme` before `.com`).
 */
export function isSignupEmailEnoughForLead(value: string): boolean {
  const t = value.trim().toLowerCase()
  if (t.length < 4) return false
  const m = /^([^\s@]+)@([^\s@]+)$/.exec(t)
  if (!m) return false
  return m[1].length >= 1 && m[2].length >= 2
}

export type SignupEmailLeadSource =
  | 'blur'
  | 'idle'
  | 'modal_close'
  | 'page_left'
  /** User typed an email-shaped value in Full Name instead of Email */
  | 'name_blur'
  | 'name_idle'
  | 'name_modal_close'
  | 'name_page_left'

/** Browser-only log so admins can preview captures without GET /admin/usage/signup-leads. */
const LOCAL_SIGNUP_LEADS_KEY = 'tapeout_signup_leads_log'
const LOCAL_SIGNUP_LEADS_MAX = 150

export type LocalSignupLeadEntry = {
  email: string
  source: SignupEmailLeadSource
  partial: boolean
  ts: number
  path: string
}

function appendLocalSignupLeadEntry(entry: LocalSignupLeadEntry): void {
  try {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(LOCAL_SIGNUP_LEADS_KEY)
    const arr: LocalSignupLeadEntry[] = raw ? JSON.parse(raw) : []
    if (!Array.isArray(arr)) return
    arr.unshift(entry)
    localStorage.setItem(LOCAL_SIGNUP_LEADS_KEY, JSON.stringify(arr.slice(0, LOCAL_SIGNUP_LEADS_MAX)))
  } catch {
    /* quota / private mode */
  }
}

export function readLocalSignupLeadsLog(): LocalSignupLeadEntry[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(LOCAL_SIGNUP_LEADS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    return Array.isArray(arr) ? (arr as LocalSignupLeadEntry[]) : []
  } catch {
    return []
  }
}

export function clearLocalSignupLeadsLog(): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(LOCAL_SIGNUP_LEADS_KEY)
  } catch {
    /* ignore */
  }
}

/** Homepage / marketing visit log (this browser) for System Usage preview. */
const LOCAL_LANDING_VISITS_KEY = 'tapeout_landing_visits_log'
const LOCAL_LANDING_VISITS_MAX = 200

export type LocalLandingVisitEntry = {
  ts: number
  path: string
  referrer: string
  /** Marketing channel: linkedin | direct | google | other */
  channel?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  /** Present only when a session token/user is available */
  email?: string
  name?: string
  userId?: string | number
}

export function detectTrafficChannel(referrer: string, search = ''): {
  channel: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
} {
  let utmSource = ''
  let utmMedium = ''
  let utmCampaign = ''
  try {
    const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    utmSource = (q.get('utm_source') || '').trim().toLowerCase()
    utmMedium = (q.get('utm_medium') || '').trim().toLowerCase()
    utmCampaign = (q.get('utm_campaign') || '').trim().toLowerCase()
  } catch {
    /* ignore */
  }

  const ref = (referrer || '').toLowerCase()
  const linkedInUtm = utmSource.includes('linkedin') || utmSource === 'li' || utmMedium.includes('linkedin')
  const linkedInRef =
    ref.includes('linkedin.com') ||
    ref.includes('lnkd.in') ||
    ref.includes('linkedin.')

  if (linkedInUtm || linkedInRef) {
    return { channel: 'linkedin', utmSource, utmMedium, utmCampaign }
  }
  if (utmSource) {
    return { channel: utmSource.slice(0, 40), utmSource, utmMedium, utmCampaign }
  }
  if (!ref) {
    return { channel: 'direct', utmSource, utmMedium, utmCampaign }
  }
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('duckduckgo.')) {
    return { channel: 'search', utmSource, utmMedium, utmCampaign }
  }
  return { channel: 'other', utmSource, utmMedium, utmCampaign }
}

export function isLinkedInLandingVisit(row: LocalLandingVisitEntry): boolean {
  if (row.channel === 'linkedin') return true
  const { channel } = detectTrafficChannel(row.referrer || '', '')
  return channel === 'linkedin'
}

function appendLocalLandingVisit(entry: LocalLandingVisitEntry): void {
  try {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(LOCAL_LANDING_VISITS_KEY)
    const arr: LocalLandingVisitEntry[] = raw ? JSON.parse(raw) : []
    if (!Array.isArray(arr)) return
    arr.unshift(entry)
    localStorage.setItem(LOCAL_LANDING_VISITS_KEY, JSON.stringify(arr.slice(0, LOCAL_LANDING_VISITS_MAX)))
  } catch {
    /* quota / private mode */
  }
}

export function readLocalLandingVisitsLog(): LocalLandingVisitEntry[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(LOCAL_LANDING_VISITS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    return Array.isArray(arr) ? (arr as LocalLandingVisitEntry[]) : []
  } catch {
    return []
  }
}

export function clearLocalLandingVisitsLog(): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(LOCAL_LANDING_VISITS_KEY)
  } catch {
    /* ignore */
  }
}

export function countLocalLandingVisits(): number {
  return readLocalLandingVisitsLog().length
}

/**
 * Record a homepage hit. Anonymous by default; pass identity only when the visitor is logged in.
 * Also attempts fire-and-forget UI telemetry (same as signup leads).
 */
export function reportLandingVisit(identity?: {
  email?: string
  name?: string
  userId?: string | number
}): void {
  const ts = Date.now()
  const path = typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  const search = typeof window !== 'undefined' ? window.location.search || '' : ''
  const referrer =
    typeof document !== 'undefined' && document.referrer ? String(document.referrer).slice(0, 300) : ''
  const detected = detectTrafficChannel(referrer, search)

  const entry: LocalLandingVisitEntry = {
    ts,
    path,
    referrer,
    channel: detected.channel,
  }
  if (detected.utmSource) entry.utmSource = detected.utmSource
  if (detected.utmMedium) entry.utmMedium = detected.utmMedium
  if (detected.utmCampaign) entry.utmCampaign = detected.utmCampaign
  if (identity?.email) entry.email = String(identity.email).trim().toLowerCase()
  if (identity?.name) entry.name = String(identity.name).trim().slice(0, 120)
  if (identity?.userId != null && identity.userId !== '') entry.userId = identity.userId

  appendLocalLandingVisit(entry)

  const payload: Record<string, string | number | boolean> = {
    path,
    referrer: referrer || '(direct)',
    channel: detected.channel,
  }
  if (detected.utmSource) payload.utm_source = detected.utmSource
  if (detected.utmMedium) payload.utm_medium = detected.utmMedium
  if (detected.utmCampaign) payload.utm_campaign = detected.utmCampaign
  if (entry.email) payload.email = entry.email
  if (entry.name) payload.name = entry.name
  if (entry.userId != null) payload.userId = String(entry.userId)

  reportUiEvent('landing_page_visit', payload)
}

/**
 * Captures signup email text once it looks “enough” typed (not only after full domain.tld).
 * Also appends to localStorage so System Usage can show rows without a backend list API.
 * PII — align with your privacy policy; store securely server-side when API exists.
 */
export function reportSignupEmailLead(email: string, source: SignupEmailLeadSource): void {
  const trimmed = email.trim().toLowerCase()
  if (!isSignupEmailEnoughForLead(trimmed)) return

  const complete = SIGNUP_EMAIL_COMPLETE.test(trimmed)
  const ts = Date.now()
  const path = typeof window !== 'undefined' ? window.location.pathname : ''

  appendLocalSignupLeadEntry({
    email: trimmed,
    source,
    partial: !complete,
    ts,
    path
  })

  sendTelemetryBody({
    event: 'signup_email_lead',
    email: trimmed,
    source,
    partial: !complete,
    ts,
    path
  })
}
