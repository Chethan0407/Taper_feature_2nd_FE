import { authenticatedFetch } from '@/utils/auth-requests'

export type ReadinessBlocker = {
  id?: string | number
  code?: string
  title?: string
  message?: string
  severity?: string
  [key: string]: unknown
}

export type ReadinessGateSummary = {
  id?: string | number
  gate_type?: string
  type?: string
  name?: string
  status?: string
  tool_name?: string
  tool_version?: string
  [key: string]: unknown
}

export type ProjectReadiness = {
  readiness_score?: number
  blockers?: ReadinessBlocker[]
  gates?: ReadinessGateSummary[]
  waivers_summary?: Record<string, unknown>
  packages_summary?: Record<string, unknown>
  fab_lots_summary?: Record<string, unknown>
  is_design_frozen?: boolean
  tapeout_status?: string
  foundry?: string
  process_node?: string
  pdk_version?: string
  node?: string
  [key: string]: unknown
}

export type ProjectGap = {
  id?: string | number
  code?: string
  title?: string
  message?: string
  description?: string
  severity?: string
  category?: string
  [key: string]: unknown
}

export type SignoffGate = {
  id: string | number
  gate_type?: string
  type?: string
  name?: string
  status?: string
  tool_name?: string
  tool_version?: string
  notes?: string
  report_url?: string
  updated_at?: string
  [key: string]: unknown
}

async function readError(res: Response, fallback: string) {
  const text = await res.text().catch(() => '')
  try {
    const j = JSON.parse(text)
    return j.detail || j.message || text || fallback
  } catch {
    return text || fallback
  }
}

function projectBase(projectId: string | number) {
  return `/api/v1/projects/${projectId}`
}

export async function fetchProjectReadiness(projectId: string | number): Promise<ProjectReadiness> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/readiness`)
  if (res.status === 404) {
    throw new Error('Readiness API is not available for this project yet.')
  }
  if (!res.ok) throw new Error(await readError(res, 'Failed to load readiness'))
  return res.json()
}

export async function fetchProjectGaps(projectId: string | number): Promise<ProjectGap[]> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/gaps`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(await readError(res, 'Failed to load gaps'))
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.gaps)) return data.gaps
  if (Array.isArray(data?.items)) return data.items
  return []
}

export async function freezeProject(projectId: string | number): Promise<ProjectReadiness | null> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/freeze`, { method: 'POST' })
  if (!res.ok) throw new Error(await readError(res, 'Failed to freeze design'))
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function unfreezeProject(projectId: string | number): Promise<ProjectReadiness | null> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/unfreeze`, { method: 'POST' })
  if (!res.ok) throw new Error(await readError(res, 'Failed to unfreeze design'))
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function fetchSignoffGates(projectId: string | number): Promise<SignoffGate[]> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/signoff-gates`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(await readError(res, 'Failed to load signoff gates'))
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.gates)) return data.gates
  if (Array.isArray(data?.items)) return data.items
  return []
}

export async function patchSignoffGate(
  projectId: string | number,
  gateId: string | number,
  body: { status: string; tool_name?: string; tool_version?: string; notes?: string },
): Promise<SignoffGate> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/signoff-gates/${gateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to update gate'))
  return res.json()
}

export async function uploadSignoffGateReport(
  projectId: string | number,
  gateId: string | number,
  file: File,
  extras: { status?: string; tool_name?: string; tool_version?: string; notes?: string } = {},
): Promise<SignoffGate> {
  const form = new FormData()
  form.append('file', file)
  if (extras.status) form.append('status', extras.status)
  if (extras.tool_name) form.append('tool_name', extras.tool_name)
  if (extras.tool_version) form.append('tool_version', extras.tool_version)
  if (extras.notes) form.append('notes', extras.notes)

  const res = await authenticatedFetch(`${projectBase(projectId)}/signoff-gates/${gateId}/report`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to upload gate report'))
  return res.json()
}

function asList<T>(data: unknown, keys: string[] = ['items', 'results']): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    for (const k of keys) {
      if (Array.isArray(o[k])) return o[k] as T[]
    }
  }
  return []
}

export type Waiver = {
  id: string | number
  title?: string
  rule_id?: string
  severity?: string
  description?: string
  status?: string
  [key: string]: unknown
}

export type ReleasePackage = {
  id: string | number
  version_label?: string
  notes?: string
  status?: string
  is_frozen?: boolean
  artifacts?: PackageArtifact[]
  [key: string]: unknown
}

export type PackageArtifact = {
  id?: string | number
  file_name?: string
  artifact_type?: string
  checksum_sha256?: string
  size_bytes?: number
  [key: string]: unknown
}

export type FoundrySubmission = {
  id: string | number
  package_id?: string | number
  status?: string
  foundry_ticket_id?: string
  [key: string]: unknown
}

export type FabLot = {
  id: string | number
  lot_id?: string
  wafer_count?: number
  status?: string
  [key: string]: unknown
}

export async function fetchWaivers(projectId: string | number): Promise<Waiver[]> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/waivers`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(await readError(res, 'Failed to load waivers'))
  return asList<Waiver>(await res.json(), ['waivers', 'items'])
}

export async function createWaiver(
  projectId: string | number,
  body: { title: string; rule_id?: string; severity: string; description?: string },
): Promise<Waiver> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/waivers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to create waiver'))
  return res.json()
}

export async function patchWaiver(
  projectId: string | number,
  waiverId: string | number,
  body: { status: string },
): Promise<Waiver> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/waivers/${waiverId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to update waiver'))
  return res.json()
}

export async function fetchPackages(projectId: string | number): Promise<ReleasePackage[]> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/packages`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(await readError(res, 'Failed to load packages'))
  return asList<ReleasePackage>(await res.json(), ['packages', 'items'])
}

export async function createPackage(
  projectId: string | number,
  body: { version_label: string; notes?: string },
): Promise<ReleasePackage> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to create package'))
  return res.json()
}

export async function registerPackageArtifact(
  projectId: string | number,
  pkgId: string | number,
  body: { file_name: string; artifact_type: string; checksum_sha256: string; size_bytes?: number },
): Promise<PackageArtifact> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/packages/${pkgId}/artifacts/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to register artifact'))
  return res.json()
}

export async function uploadPackageArtifact(
  projectId: string | number,
  pkgId: string | number,
  file: File,
): Promise<PackageArtifact> {
  const form = new FormData()
  form.append('file', file)
  const res = await authenticatedFetch(`${projectBase(projectId)}/packages/${pkgId}/artifacts`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to upload artifact'))
  return res.json()
}

export async function freezePackage(projectId: string | number, pkgId: string | number): Promise<ReleasePackage> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/packages/${pkgId}/freeze`, { method: 'POST' })
  if (!res.ok) throw new Error(await readError(res, 'Failed to freeze package'))
  return res.json()
}

export async function fetchSubmissions(projectId: string | number): Promise<FoundrySubmission[]> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/submissions`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(await readError(res, 'Failed to load submissions'))
  return asList<FoundrySubmission>(await res.json(), ['submissions', 'items'])
}

export async function createSubmission(
  projectId: string | number,
  body: { package_id: string | number; status: string; foundry_ticket_id?: string },
): Promise<FoundrySubmission> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to create submission'))
  return res.json()
}

export async function patchSubmission(
  projectId: string | number,
  submissionId: string | number,
  body: { status: string; foundry_ticket_id?: string },
): Promise<FoundrySubmission> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/submissions/${submissionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to update submission'))
  return res.json()
}

export async function fetchFabLots(projectId: string | number): Promise<FabLot[]> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/fab-lots`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(await readError(res, 'Failed to load fab lots'))
  return asList<FabLot>(await res.json(), ['fab_lots', 'items'])
}

export async function createFabLot(
  projectId: string | number,
  body: { lot_id: string; wafer_count: number; status: string },
): Promise<FabLot> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/fab-lots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to create fab lot'))
  return res.json()
}

export async function patchFabLot(
  projectId: string | number,
  lotId: string | number,
  body: Partial<{ lot_id: string; wafer_count: number; status: string }>,
): Promise<FabLot> {
  const res = await authenticatedFetch(`${projectBase(projectId)}/fab-lots/${lotId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readError(res, 'Failed to update fab lot'))
  return res.json()
}
