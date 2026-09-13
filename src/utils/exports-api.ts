import { authenticatedFetch } from '@/utils/auth-requests'

export type ExportResource =
  | 'users'
  | 'companies'
  | 'projects'
  | 'vendors'
  | 'specifications'
  | 'checklist-templates'
  | 'active-checklists'

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'zip'

export type ExportQuery = {
  format?: ExportFormat
  limit?: number
  status?: string
  platform?: string
}

export type ExportTypesResponse = {
  resources?: Array<{ id?: string; value?: string; name?: string; label?: string }>
  formats?: Array<{ id?: string; value?: string; name?: string; label?: string } | string>
}

export type ImportTypesResponse = {
  resources?: Array<{ id?: string; value?: string; name?: string; label?: string; columns?: string[] }>
  formats?: Array<{ id?: string; value?: string; name?: string; label?: string } | string>
  max_bytes?: number
  notes?: string
}

export type ImportResultBucket = {
  created?: number
  updated?: number
  skipped?: number
  errors?: Array<string | { message?: string; detail?: string }>
}

export type ImportCompleteResponse = {
  schema_version?: number
  imported_by?: string
  results?: Record<string, ImportResultBucket>
  message?: string
}

function parseFilename(res: Response, fallback: string): string {
  const disp = res.headers.get('Content-Disposition')
  if (!disp) return fallback
  const match =
    disp.match(/filename\*?=(?:UTF-8'')?["']?([^"'\s;]+)["']?/i) ||
    disp.match(/filename=(["']?)([^"'\s;]+)\1/)
  if (!match) return fallback
  return (match[2] || match[1] || '').trim() || fallback
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => window.URL.revokeObjectURL(url), 500)
}

function denyMessage(status: number, fallback: string) {
  if (status === 401) return 'Session expired. Please sign in again.'
  if (status === 403) return 'Download and upload are available to admins and superusers only.'
  return fallback
}

export async function fetchExportTypes(): Promise<ExportTypesResponse> {
  const res = await authenticatedFetch('/api/v1/exports/types')
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(denyMessage(res.status, text || 'Failed to load export options'))
  }
  return res.json()
}

/**
 * Download an admin export for a resource.
 * csv/xlsx/zip → file blob; json → { resource, count, data } saved as .json
 */
export async function downloadExport(resource: ExportResource, query: ExportQuery = {}) {
  const format: ExportFormat = query.format || 'csv'
  const params = new URLSearchParams()
  params.set('format', format)
  if (query.limit != null) params.set('limit', String(query.limit))
  if (query.status) params.set('status', query.status)
  if (query.platform) params.set('platform', query.platform)

  const res = await authenticatedFetch(`/api/v1/exports/${resource}?${params.toString()}`)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let detail = text
    try {
      const j = JSON.parse(text)
      detail = j.detail || j.message || text
    } catch {
      /* ignore */
    }
    if (res.status === 400) throw new Error(detail || 'Invalid export resource or parameters.')
    throw new Error(denyMessage(res.status, detail || `Export failed (${res.status})`))
  }

  const contentType = (res.headers.get('Content-Type') || '').toLowerCase()

  if (format === 'json' || contentType.includes('application/json')) {
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    triggerBlobDownload(blob, parseFilename(res, `${resource}-export.json`))
    return data
  }

  const blob = await res.blob()
  const fallbackExt = format === 'xlsx' ? 'xlsx' : format === 'zip' ? 'zip' : 'csv'
  triggerBlobDownload(blob, parseFilename(res, `${resource}-export.${fallbackExt}`))
  return null
}

/** Download ALL data — GET /api/v1/exports/complete?format=json|zip */
export async function downloadCompleteExport(format: 'json' | 'zip' = 'zip') {
  const res = await authenticatedFetch(`/api/v1/exports/complete?format=${format}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(denyMessage(res.status, text || 'Complete export failed'))
  }

  const contentType = (res.headers.get('Content-Type') || '').toLowerCase()
  if (format === 'json' || contentType.includes('application/json')) {
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    triggerBlobDownload(blob, parseFilename(res, 'tapeoutops-complete-export.json'))
    return data
  }

  const blob = await res.blob()
  triggerBlobDownload(blob, parseFilename(res, 'tapeoutops-complete-export.zip'))
  return null
}

export async function fetchImportTypes(): Promise<ImportTypesResponse> {
  const res = await authenticatedFetch('/api/v1/imports/types')
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(denyMessage(res.status, text || 'Failed to load import options'))
  }
  return res.json()
}

/** Download empty template — GET /api/v1/imports/template?format=json|zip */
export async function downloadImportTemplate(format: 'json' | 'zip' = 'zip') {
  const res = await authenticatedFetch(`/api/v1/imports/template?format=${format}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(denyMessage(res.status, text || 'Failed to download import template'))
  }

  const contentType = (res.headers.get('Content-Type') || '').toLowerCase()
  if (format === 'json' || contentType.includes('application/json')) {
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    triggerBlobDownload(blob, parseFilename(res, 'tapeoutops-import-template.json'))
    return data
  }

  const blob = await res.blob()
  triggerBlobDownload(blob, parseFilename(res, 'tapeoutops-import-template.zip'))
  return null
}

/**
 * Upload existing data — POST /api/v1/imports/complete
 * multipart field: file (.json, .zip, or .csv with ?resource=)
 */
export async function uploadImportComplete(
  file: File,
  opts: { resource?: ExportResource } = {},
): Promise<ImportCompleteResponse> {
  const params = new URLSearchParams()
  if (opts.resource && file.name.toLowerCase().endsWith('.csv')) {
    params.set('resource', opts.resource)
  }
  const qs = params.toString()
  const url = qs ? `/api/v1/imports/complete?${qs}` : '/api/v1/imports/complete'

  const body = new FormData()
  body.append('file', file)

  const res = await authenticatedFetch(url, { method: 'POST', body })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let detail = text
    try {
      const j = JSON.parse(text)
      detail = j.detail || j.message || text
    } catch {
      /* ignore */
    }
    throw new Error(denyMessage(res.status, detail || `Import failed (${res.status})`))
  }
  return res.json()
}
