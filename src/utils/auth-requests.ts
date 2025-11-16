import { useAuthStore } from '@/stores/auth'

/**
 * Helper function to create authenticated headers
 */
export function getAuthHeaders(contentType?: string): HeadersInit {
  const authStore = useAuthStore()
  const headers: Record<string, string> = {}
  
  // Add authorization header if token exists
  if (authStore.token && authStore.token !== 'undefined' && authStore.token !== 'null') {
    headers['Authorization'] = `Bearer ${authStore.token}`
  }
  
  // Add content type if specified (don't set for FormData)
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  
  return headers
}

/**
 * Helper function to make authenticated fetch requests
 * Handles 401 errors by redirecting to login
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const authStore = useAuthStore()
  
  // Prepare headers
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  
  // Add authorization header if token exists
  const token = authStore.token
  console.log('🔑 authenticatedFetch - Token check:', {
    hasToken: !!token,
    tokenValue: token ? `${token.substring(0, 20)}...` : 'null',
    tokenLength: token?.length || 0,
    url: url
  })
  
  if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
    headers['Authorization'] = `Bearer ${token}`
    console.log('✅ authenticatedFetch - Authorization header added')
  } else {
    console.warn('⚠️ authenticatedFetch - No valid token found, request will be unauthenticated')
  }
  
  // Don't set Content-Type for FormData (browser will set it automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  
  console.log('📤 authenticatedFetch - Request headers:', Object.keys(headers))
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  // Handle 401 errors - but don't logout immediately
  // Let the calling code decide what to do
  if (response.status === 401) {
    try {
      const errorText = await response.clone().text()
      console.error('❌ 401 Unauthorized:', errorText)
      // Don't call logout() here - let the calling code handle it
      // This prevents immediate logout right after login
    } catch (e) {
      console.error('❌ 401 Unauthorized - Could not read error text')
      // Don't call logout() here either
    }
  }
  
  return response
}

/**
 * Helper function to handle API errors
 */
export async function handleApiError(response: Response, defaultMessage: string): Promise<string> {
  if (!response.ok) {
    try {
      const text = await response.text()
      try {
        const errorData = JSON.parse(text)
        return errorData.detail || errorData.message || defaultMessage
      } catch {
        return text || defaultMessage
      }
    } catch {
      return defaultMessage
    }
  }
  return defaultMessage
}

/**
 * Helper function to fetch project dashboard data
 */
export async function fetchProjectDashboard(projectId: string): Promise<{
  specs: any[]
  checklists: any[]
  specLints: any[]
  qualityScore: any
}> {
  const headers = getAuthHeaders()
  
  // NOTE: /spec-lints/with-status endpoint was removed
  // Spec lints are now loaded from /linked-content endpoint (handled separately)
  const [specsRes, checklistsRes, qualityScoreRes] = await Promise.all([
    authenticatedFetch(`/api/v1/projects/${projectId}/specs/with-status`),
    authenticatedFetch(`/api/v1/projects/${projectId}/checklists/with-status`),
    authenticatedFetch(`/api/v1/projects/${projectId}/quality-score`)
  ])
  
  if (!specsRes.ok) throw new Error(`Failed to load specs: ${await specsRes.text()}`)
  if (!checklistsRes.ok) throw new Error(`Failed to load checklists: ${await checklistsRes.text()}`)
  
  // Quality score is optional - log errors but don't throw
  let qualityScore = null
  if (qualityScoreRes.ok) {
    try {
      qualityScore = await qualityScoreRes.json()
      console.log('✅ Quality score fetched:', qualityScore)
    } catch (error) {
      console.error('❌ Failed to parse quality score JSON:', error)
    }
  } else {
    const errorText = await qualityScoreRes.text().catch(() => 'Unknown error')
    console.warn('⚠️ Quality score API returned error:', qualityScoreRes.status, errorText)
  }
  
  const [specs, checklists] = await Promise.all([
    specsRes.json(),
    checklistsRes.json()
  ])
  
  // Spec lints are now empty array (loaded separately from linked-content)
  const specLints: any[] = []
  
  // Map quality score fields to match the API response
  // Support both snake_case and camelCase field names
  const mappedQualityScore = qualityScore ? {
    spec_approval_rate: qualityScore.spec_approval_rate ?? qualityScore.specApprovalRate ?? 0,
    checklist_completion_rate: qualityScore.checklist_completion_rate ?? qualityScore.checklistCompletionRate ?? 0,
    lint_pass_rate: qualityScore.lint_pass_rate ?? qualityScore.lintPassRate ?? 0,
    overall_score: qualityScore.overall_score ?? qualityScore.overallScore ?? 0
  } : null
  
  console.log('📊 Mapped quality score in fetchProjectDashboard:', mappedQualityScore)
  console.log('📊 Raw quality score from API:', qualityScore)
  console.log('📊 Approval rate check:', {
    raw: qualityScore?.spec_approval_rate,
    camelCase: qualityScore?.specApprovalRate,
    mapped: mappedQualityScore?.spec_approval_rate
  })
  
  return {
    specs: specs || [],
    checklists: checklists || [],
    specLints: specLints || [],
    qualityScore: mappedQualityScore
  }
} 