/** Security control maturity — use API values only; never invent statuses. */
export type SecurityStatus = 'live' | 'ops' | 'roadmap' | 'partial'

export interface SecurityControlItem {
  control?: string
  status: SecurityStatus
  notes?: string
  api?: string[]
}

export interface PublicSecurityOverview {
  product?: string
  updated_at?: string
  contact?: { security_email?: string }
  encryption?: Record<string, SecurityControlItem>
  authentication_access?: Record<string, SecurityControlItem>
  infrastructure?: Record<string, SecurityControlItem>
  data_protection?: Record<string, SecurityControlItem>
  monitoring?: Record<string, SecurityControlItem>
  deployment?: Record<string, SecurityControlItem>
  compliance?: {
    encryption_summary?: string
    access_summary?: string
    soc2?: SecurityControlItem
  }
  reporting?: { security_email?: string; api?: string }
  data_boundary?: string
  user_best_practices?: string[]
}

export interface SecurityReportPayload {
  email: string
  summary: string
  severity?: 'low' | 'medium' | 'high' | 'critical' | null
  name?: string | null
  page_url?: string | null
}

export interface MfaStatus {
  mfa_enabled: boolean
  method?: string
}

export interface MfaSetupResponse {
  secret: string
  otpauth_url: string
  issuer?: string
  message?: string
}

export interface AccessReviewUser {
  user_id: number
  email: string
  full_name?: string | null
  role?: string | null
  is_active?: boolean
  is_superuser?: boolean
  mfa_enabled?: boolean
  last_login_at?: string | null
  deleted_at?: string | null
}

export interface AccessReviewResponse {
  company_id: number | null
  company_name?: string
  users: AccessReviewUser[]
  reviewed_at: string
}

export interface RetentionSettings {
  company_id: number
  data_retention_days: number
  deletion_policy: string
  customer_isolation?: string
  notes?: string
}

export interface SessionInfo {
  user_id: number
  email: string
  mfa_enabled: boolean
  absolute_timeout_minutes: number
  expires_at: string | null
  rbac_role?: string | null
}

export interface PasswordPolicy {
  min_length: number
  max_length: number
  max_bytes: number
  require_uppercase: boolean
  require_lowercase: boolean
  require_number: boolean
  require_special: boolean
  special_chars: string
  block_common_passwords: boolean
  notes?: string
}

export interface AuthTokenResponse {
  access_token?: string | null
  token?: string | null
  token_type?: string
  expires_in_minutes?: number | null
  requires_mfa?: boolean
  mfa_token?: string | null
}

export const STATUS_LABEL: Record<SecurityStatus, string> = {
  live: 'Live',
  ops: 'Ops',
  roadmap: 'Roadmap',
  partial: 'Partial',
}

export function isSecurityStatus(value: unknown): value is SecurityStatus {
  return value === 'live' || value === 'ops' || value === 'roadmap' || value === 'partial'
}
