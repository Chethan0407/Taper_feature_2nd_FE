import { resolveApiUrl } from '@/config/api'
import { authenticatedFetch } from '@/utils/auth-requests'
import type {
  AccessReviewResponse,
  AuthTokenResponse,
  MfaSetupResponse,
  MfaStatus,
  PasswordPolicy,
  PublicSecurityOverview,
  RetentionSettings,
  SecurityReportPayload,
  SessionInfo,
} from '@/types/security'

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '')
  try {
    const data = JSON.parse(text)
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join('. ')
    }
    return data.message || text || res.statusText
  } catch {
    return text || res.statusText || `HTTP ${res.status}`
  }
}

export async function fetchPublicSecurity(): Promise<PublicSecurityOverview> {
  const res = await fetch(resolveApiUrl('/api/v1/public/security'))
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function submitSecurityReport(body: SecurityReportPayload): Promise<void> {
  const res = await fetch(resolveApiUrl('/api/v1/public/security-report'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res))
}

export async function fetchMfaStatus(): Promise<MfaStatus> {
  const res = await authenticatedFetch('/api/v1/settings/security/mfa/status')
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function setupMfa(): Promise<MfaSetupResponse> {
  const res = await authenticatedFetch('/api/v1/settings/security/mfa/setup', { method: 'POST' })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function enableMfa(code: string): Promise<{ ok: boolean; mfa_enabled: boolean }> {
  const res = await authenticatedFetch('/api/v1/settings/security/mfa/enable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function disableMfa(code: string): Promise<{ ok: boolean; mfa_enabled: boolean }> {
  const res = await authenticatedFetch('/api/v1/settings/security/mfa/disable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function fetchAccessReview(companyId?: number): Promise<AccessReviewResponse> {
  const q = companyId != null ? `?company_id=${companyId}` : ''
  const res = await authenticatedFetch(`/api/v1/settings/security/access-review${q}`)
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function fetchRetention(companyId?: number): Promise<RetentionSettings> {
  const q = companyId != null ? `?company_id=${companyId}` : ''
  const res = await authenticatedFetch(`/api/v1/settings/security/retention${q}`)
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function updateRetention(body: {
  company_id: number
  data_retention_days: number
  deletion_policy?: string
}): Promise<RetentionSettings & { ok?: boolean }> {
  const res = await authenticatedFetch('/api/v1/settings/security/retention', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function requestAccountDeletion(confirm: true, reason?: string): Promise<{
  ok: boolean
  status: string
  message?: string
  deleted_at?: string
}> {
  const res = await authenticatedFetch('/api/v1/settings/security/deletion-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm, reason: reason || null }),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function fetchSessionInfo(): Promise<SessionInfo> {
  const res = await authenticatedFetch('/api/v1/auth/session')
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function fetchPasswordPolicy(): Promise<PasswordPolicy> {
  const res = await fetch(resolveApiUrl('/api/v1/auth/password-policy'))
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function verifyMfaLogin(mfaToken: string, mfaCode: string): Promise<AuthTokenResponse> {
  const res = await fetch(resolveApiUrl('/api/v1/auth/mfa/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mfa_token: mfaToken, mfa_code: mfaCode }),
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}
