import { authenticatedFetch } from '@/utils/auth-requests'

async function readError(res: Response, fallback: string) {
  const text = await res.text().catch(() => '')
  try {
    const j = JSON.parse(text)
    return j.detail || j.message || text || fallback
  } catch {
    return text || fallback
  }
}

export interface SignoffMatrixRow {
  gate_id: number | string
  gate: string
  owner?: string
  status: string
  status_raw?: string
  approved_by?: string | null
  when?: string | null
  tool_name?: string | null
  report_name?: string | null
  notes?: string | null
}

export interface SignoffMatrixResponse {
  project_id: number | string
  count: number
  gates: SignoffMatrixRow[]
  default_gate_types?: string[]
}

export async function fetchSignoffMatrix(
  projectId: string | number,
): Promise<SignoffMatrixResponse> {
  const res = await authenticatedFetch(`/api/v1/projects/${projectId}/signoff-matrix`)
  if (!res.ok) throw new Error(await readError(res, 'Failed to load sign-off matrix'))
  return res.json()
}

export async function approveSignoffGate(
  projectId: string | number,
  gateId: string | number,
): Promise<Record<string, unknown>> {
  const res = await authenticatedFetch(
    `/api/v1/projects/${projectId}/signoff-gates/${gateId}/approve`,
    { method: 'POST' },
  )
  if (!res.ok) throw new Error(await readError(res, 'Failed to approve gate'))
  return res.json()
}

export interface VendorPerformanceRow {
  vendor_id: number | string
  name: string
  type?: string
  status?: string
  nda_scope?: {
    status?: string
    file_name?: string | null
    expires_at?: string | null
  }
  linked_specifications?: number
  acknowledgements?: number
  last_activity_at?: string | null
  hours_since_activity?: number | null
  response_sla_hours?: number
  sla_breached?: boolean
  staging?: string
}

export interface VendorPerformanceResponse {
  count: number
  note?: string
  vendors: VendorPerformanceRow[]
}

export async function fetchVendorPerformance(limit = 50): Promise<VendorPerformanceResponse> {
  const res = await authenticatedFetch(`/api/v1/vendors/performance?limit=${limit}`)
  if (!res.ok) throw new Error(await readError(res, 'Failed to load vendor performance'))
  return res.json()
}

export interface ActivityLogRow {
  id: number | string
  timestamp?: string | null
  user?: string | null
  action?: string | null
  entity?: string | null
  entity_id?: number | string | null
  details?: Record<string, unknown> | null
}

export async function fetchActivity(params: {
  entity?: string
  entity_id?: number | string
  user?: string
  action?: string
  q?: string
  since?: string
  until?: string
  hours?: number
  limit?: number
  offset?: number
} = {}): Promise<ActivityLogRow[]> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') qs.set(k, String(v))
  })
  const res = await authenticatedFetch(`/api/v1/activity/?${qs.toString()}`)
  if (!res.ok) throw new Error(await readError(res, 'Failed to load activity'))
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export interface IntegrationConnector {
  id: number
  company_id: number
  provider: string
  name?: string | null
  project_id?: number | null
  is_active: boolean
  created_by?: string | null
  created_at?: string | null
  inbound_path: string
  secret_hint: string
  secret?: string
}

export interface IntegrationEvent {
  id: number
  connector_id?: number | null
  company_id?: number | null
  provider: string
  event_type?: string | null
  external_id?: string | null
  project_id?: number | null
  status: string
  payload?: Record<string, unknown> | null
  created_at?: string | null
}

export async function listIntegrationConnectors(companyId?: number): Promise<IntegrationConnector[]> {
  const q = companyId != null ? `?company_id=${companyId}` : ''
  const res = await authenticatedFetch(`/api/v1/integrations/connectors${q}`)
  if (!res.ok) throw new Error(await readError(res, 'Failed to load connectors'))
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function createIntegrationConnector(body: {
  provider: string
  company_id: number
  name?: string
  project_id?: number | null
  secret?: string | null
}): Promise<IntegrationConnector> {
  const res = await authenticatedFetch('/api/v1/integrations/connectors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to create connector'))
  return res.json()
}

export async function listIntegrationEvents(params: {
  company_id?: number
  provider?: string
  project_id?: number
  limit?: number
} = {}): Promise<IntegrationEvent[]> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') qs.set(k, String(v))
  })
  const res = await authenticatedFetch(`/api/v1/integrations/events?${qs.toString()}`)
  if (!res.ok) throw new Error(await readError(res, 'Failed to load integration events'))
  const data = await res.json()
  return Array.isArray(data) ? data : []
}
