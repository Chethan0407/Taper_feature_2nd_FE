import { resolveApiUrl } from '@/config/api'

export type ClaimStatus = 'live' | 'ops' | 'roadmap' | 'partial'

export interface CapabilityClaim {
  claim: string
  status: ClaimStatus | string
  api?: string[]
  notes?: string
}

export interface PublicCapabilities {
  product?: string
  updated_at?: string
  capabilities: CapabilityClaim[]
}

export interface IntegrationItem {
  name: string
  kind?: string
  api?: string
  notes?: string
}

export interface PublicIntegrations {
  live: IntegrationItem[]
  roadmap: IntegrationItem[]
  out_of_scope: IntegrationItem[]
  note?: string
}

/** GET /api/v1/public/agent-access — Cursor / Claude MCP discovery */
export interface PublicAgentAccess {
  product?: string
  auth: {
    headers: string[]
    create_key?: string
    openapi?: string
  }
  mcp: {
    path: string
    env: string[]
    docs?: string
  }
  notes?: string
}

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '')
  try {
    const data = JSON.parse(text)
    return data.detail || data.message || text || res.statusText
  } catch {
    return text || res.statusText
  }
}

export async function fetchPublicCapabilities(): Promise<PublicCapabilities> {
  const res = await fetch(resolveApiUrl('/api/v1/public/capabilities'))
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function fetchPublicIntegrations(): Promise<PublicIntegrations> {
  const res = await fetch(resolveApiUrl('/api/v1/public/integrations'))
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function fetchPublicAgentAccess(): Promise<PublicAgentAccess> {
  const res = await fetch(resolveApiUrl('/api/v1/public/agent-access'))
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}
