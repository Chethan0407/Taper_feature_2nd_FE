import { useAuthStore } from '@/stores/auth'

// Use proxy path to work with Vite dev server
const API_BASE = '/api/v1'

export interface LinkedSpecification {
  id: string | number
  name?: string
  file_name?: string
  version?: string
  description?: string
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Updated After Rejection' | 'Archived'
  uploaded_by: string
  uploaded_on: string
  assigned_to?: string
  reviewerName?: string
  mime_type?: string
  file_type?: string
  type?: string
  file_size?: number
  created_at?: string
  updated_at?: string
  approved_by?: string | null
  rejected_by?: string | null
  liked_by_me?: boolean
  like_count?: number
}

export interface LinkedContentResponse {
  specs?: LinkedSpecification[]
  checklists?: any[]
  specLints?: any[]
  qualityScore?: any
}

// The API can also return an array directly
export type LinkedContentArray = Array<{
  id: string | number
  type: 'specification' | 'checklist' | 'spec_lint'
  name?: string
  file_name?: string
  status?: string
  [key: string]: any
}>

/**
 * Link a specification to a project
 */
export async function linkSpecToProject(
  projectId: string | number,
  specificationId: string | number
): Promise<void> {
  const authStore = useAuthStore()
  
  const response = await fetch(
    `${API_BASE}/projects/${projectId}/specifications/${specificationId}/link`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to link specification to project')
  }
}

/**
 * Unlink a specification from a project
 */
export async function unlinkSpecFromProject(
  projectId: string | number,
  specificationId: string | number
): Promise<void> {
  const authStore = useAuthStore()
  
  const response = await fetch(
    `${API_BASE}/projects/${projectId}/specifications/${specificationId}/link`,
    {
      method: 'DELETE',
      headers: {
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to unlink specification from project')
  }
}

/**
 * Get all linked content for a project (specs, checklists, spec lints)
 * STEP 4: GET /api/v1/projects/{project_id}/linked-content
 * 
 * API RESPONSE FORMAT: Flat array directly
 * [
 *   { id: "...", type: "specification", name: "...", ... },
 *   { id: 1, type: "checklist", name: "...", ... }
 * ]
 * 
 * Returns: Object with specs, checklists, specLints arrays
 */
export async function getLinkedContent(projectId: string | number): Promise<LinkedContentResponse> {
  const authStore = useAuthStore()
  
  // Add cache-busting parameter to force fresh data
  const cacheBuster = `?t=${Date.now()}`
  const response = await fetch(
    `${API_BASE}/projects/${projectId}/linked-content${cacheBuster}`,
    {
      headers: {
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {}),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to load linked content')
  }

  // ✅ API returns a FLAT ARRAY directly
  const linkedContentArray = await response.json()
  
  console.log('🔍 DEBUG - Raw API response (linked-content):', linkedContentArray)
  console.log('🔍 DEBUG - Is array?', Array.isArray(linkedContentArray))
  console.log('🔍 DEBUG - Total items:', Array.isArray(linkedContentArray) ? linkedContentArray.length : 0)
  
  // ✅ Filter by type (handle both camelCase "specLint" and snake_case "spec_lint")
  if (Array.isArray(linkedContentArray)) {
    const specs = linkedContentArray.filter((item: any) => item.type === 'specification')
    const checklists = linkedContentArray.filter((item: any) => item.type === 'checklist')
    // Handle both "specLint" (camelCase) and "spec_lint" (snake_case) formats
    const specLints = linkedContentArray.filter((item: any) => 
      item.type === 'specLint' || item.type === 'spec_lint'
    )
    
    console.log('🔍 DEBUG - Filtered specs:', specs.length)
    console.log('🔍 DEBUG - Filtered checklists:', checklists.length)
    console.log('🔍 DEBUG - Filtered specLints:', specLints.length)
    
    return { specs, checklists, specLints }
  }
  
  // Fallback if response is not an array (shouldn't happen per API spec)
  console.warn('🔍 DEBUG - ⚠️ API response is not an array:', linkedContentArray)
  return { specs: [], checklists: [], specLints: [] }
}

/**
 * Get all available specifications with optional filters
 */
export async function getAvailableSpecifications(filters?: {
  status?: string
  assigned_to?: string
  uploaded_by?: string
  file_type?: string
  date_from?: string
  date_to?: string
  sort_by?: 'name' | 'uploaded_on' | 'status' | 'assigned_to' | 'uploaded_by'
  sort_order?: 'asc' | 'desc'
}): Promise<LinkedSpecification[]> {
  const authStore = useAuthStore()
  
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
  }

  const url = params.toString() ? `${API_BASE}/specifications/?${params.toString()}` : `${API_BASE}/specifications/`
  
  const response = await fetch(url, {
    headers: {
      ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to load specifications')
  }

  return await response.json()
}

/**
 * Download a specification file
 */
export async function downloadSpecification(specificationId: string | number): Promise<void> {
  const authStore = useAuthStore()
  
  const response = await fetch(
    `${API_BASE}/specifications/${specificationId}/download`,
    {
      headers: {
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to download specification')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '' // Let backend set filename via headers
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * Like a specification
 */
export async function likeSpecification(specificationId: string | number): Promise<void> {
  const authStore = useAuthStore()
  
  const response = await fetch(
    `${API_BASE}/projects/specifications/${specificationId}/like`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to like specification')
  }
}

/**
 * Unlike a specification
 */
export async function unlikeSpecification(specificationId: string | number): Promise<void> {
  const authStore = useAuthStore()
  
  const response = await fetch(
    `${API_BASE}/projects/specifications/${specificationId}/unlike`,
    {
      method: 'DELETE',
      headers: {
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to unlike specification')
  }
}

/**
 * Batch link multiple specifications to a project
 */
export async function batchLinkSpecsToProject(
  projectId: string | number,
  specificationIds: (string | number)[]
): Promise<void> {
  const promises = specificationIds.map(id => 
    linkSpecToProject(projectId, id)
  )
  
  await Promise.all(promises)
}

/**
 * Batch unlink multiple specifications from a project
 */
export async function batchUnlinkSpecsFromProject(
  projectId: string | number,
  specificationIds: (string | number)[]
): Promise<void> {
  const promises = specificationIds.map(id => 
    unlinkSpecFromProject(projectId, id)
  )
  
  await Promise.all(promises)
}
