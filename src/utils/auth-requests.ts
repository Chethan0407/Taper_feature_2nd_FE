import { useAuthStore } from '@/stores/auth'
import { validateToken, isTokenExpired } from './token-utils'

/**
 * Helper function to create authenticated headers
 */
export function getAuthHeaders(contentType?: string): HeadersInit {
  const authStore = useAuthStore()
  const headers: Record<string, string> = {}
  
  // Validate token before using it
  const token = authStore.token
  if (token) {
    // Ensure token has "Bearer " prefix (remove if already present to avoid duplication)
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token
    const authToken = `Bearer ${cleanToken}`
    
    const validation = validateToken(cleanToken)
    if (validation.valid) {
      headers['Authorization'] = authToken
    } else {
      console.warn('⚠️ Token validation failed:', validation.reason)
    }
  }
  
  // Add content type if specified (don't set for FormData)
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  
  return headers
}

/**
 * Helper function to make authenticated fetch requests
 * Handles 401 errors with proper error messages and token validation
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const authStore = useAuthStore()
  
  // Smart URL normalization (same as apiClient):
  // - Profile endpoint should NOT have trailing slash (causes network error)
  // - List endpoints (lint-results, settings) NEED trailing slash (to avoid 307 redirects)
  // - Preserve query parameters
  let finalUrl = url
  
  // Remove trailing slash if it's a profile endpoint
  if (finalUrl.includes('/user/profile') && finalUrl.endsWith('/')) {
    finalUrl = finalUrl.slice(0, -1)
    console.log('🔧 authenticatedFetch - Removed trailing slash from profile endpoint')
  }
  // Add trailing slash for list endpoints (except if query params exist or it's a specific resource)
  else if (
    (finalUrl.includes('/lint-results') || 
     finalUrl.startsWith('/api/v1/settings/') ||
     finalUrl.includes('/checklists') ||
     finalUrl.includes('/specifications') ||
     finalUrl.includes('/specs/')) &&
    !finalUrl.includes('?') && 
    !finalUrl.endsWith('/') &&
    !finalUrl.match(/\/\d+$/) && // Don't add if it's a specific resource like /lint-results/123 (no trailing slash)
    !finalUrl.match(/\/\d+\//) // Don't add if it's a specific resource like /lint-results/123/ (with trailing slash)
  ) {
    finalUrl = finalUrl + '/'
    console.log('🔧 authenticatedFetch - Added trailing slash to list endpoint')
  }
  // For other endpoints, preserve as-is (don't auto-add or remove trailing slashes)
  
  const cleanUrl = finalUrl
  
  // Prepare headers
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  
  // Validate and add token
  const token = authStore.token
  
  // Early check: if no token, don't make the request
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    console.error('❌ authenticatedFetch - No valid token found, aborting request:', cleanUrl)
    const errorResponse = new Response(
      JSON.stringify({ detail: 'No authentication token found. Please log in.' }),
      { status: 401, statusText: 'Unauthorized' }
    )
    ;(errorResponse as any).errorDetail = 'No authentication token found. Please log in.'
    ;(errorResponse as any).isAuthError = true
    return errorResponse
  }
  
  console.log('🔑 authenticatedFetch - Token check:', {
    hasToken: !!token,
    tokenValue: token ? `${token.substring(0, 20)}...` : 'null',
    tokenLength: token?.length || 0,
    hasBearerPrefix: token?.startsWith('Bearer ') || false,
    url: cleanUrl
  })
  
  if (token) {
    // Ensure token has "Bearer " prefix (remove if already present to avoid duplication)
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token
    const authToken = `Bearer ${cleanToken}`
    
    // Always add the token - let the backend validate it
    // Frontend validation is just a warning, not a blocker
    headers['Authorization'] = authToken
    
    // Validate token for logging purposes only
    const validation = validateToken(cleanToken)
    if (validation.valid) {
      console.log('✅ authenticatedFetch - Authorization header added (token valid)')
    } else {
      console.warn('⚠️ authenticatedFetch - Token validation warning:', validation.reason, '- Still sending token to backend')
    }
    
    // Log the actual header being sent (first 30 chars only for security)
    console.log('📤 Authorization header:', `Bearer ${cleanToken.substring(0, 30)}...`)
  } else {
    console.warn('⚠️ authenticatedFetch - No token found, request will be unauthenticated')
    console.warn('⚠️ This will likely result in a 401 error')
  }
  
  // Don't set Content-Type for FormData (browser will set it automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  
  console.log('📤 authenticatedFetch - Request details:', {
    originalUrl: url,
    cleanUrl: cleanUrl,
    method: options.method || 'GET',
    hasAuthHeader: !!headers['Authorization'],
    headerKeys: Object.keys(headers)
  })
  
  try {
    // Use 'follow' to automatically follow redirects (browser preserves headers)
    const response = await fetch(cleanUrl, {
      ...options,
      headers,
      redirect: 'follow' as RequestRedirect
    })
    
    console.log('📥 authenticatedFetch - Response:', {
      url: cleanUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })
  
    // Handle 401 errors with detailed error information
    if (response.status === 401) {
      try {
        const errorText = await response.clone().text()
        let errorDetail = 'Authentication failed'
        
        try {
          const errorData = JSON.parse(errorText)
          errorDetail = errorData.detail || errorData.message || errorText || 'Authentication failed'
        } catch {
          errorDetail = errorText || 'Authentication failed'
        }
        
        console.error('❌ 401 Unauthorized:', {
          url: cleanUrl,
          errorDetail,
          tokenExists: !!token,
          tokenValid: token ? validateToken(token).valid : false,
          tokenExpired: token ? isTokenExpired(token) : true,
          hasAuthHeader: !!headers['Authorization']
        })
        
        // Add error information to response for better error handling
        ;(response as any).errorDetail = errorDetail
        ;(response as any).isAuthError = true
        
        // Only redirect to login for authentication endpoints or if error indicates token is invalid
        // BUT: Don't redirect for data-loading endpoints (specifications, specs, etc.) - let components handle errors
        const isAuthEndpoint = cleanUrl.includes('/auth/') || cleanUrl.includes('/me') || cleanUrl.includes('/user/profile')
        const isDataEndpoint = cleanUrl.includes('/specifications') || 
                               cleanUrl.includes('/specs/') ||
                               cleanUrl.includes('/lint-results') ||
                               cleanUrl.includes('/projects/') ||
                               cleanUrl.includes('/checklists')
        const isTokenInvalid = errorDetail.toLowerCase().includes('token') || 
                               errorDetail.toLowerCase().includes('expired') ||
                               errorDetail.toLowerCase().includes('invalid') ||
                               errorDetail.toLowerCase().includes('not authenticated')
        
        // NEVER redirect for data endpoints - let components handle the error gracefully
        // Only redirect if it's an auth endpoint AND token is invalid AND it's NOT a data endpoint
        if (isDataEndpoint) {
          // For data endpoints, just log but don't redirect or clear tokens
          // Components should handle these errors gracefully
          console.warn('⚠️ 401 error on data endpoint - not redirecting, not clearing tokens, letting component handle:', cleanUrl, errorDetail)
          // DO NOT clear tokens or redirect - just return the error response
        } else if (isAuthEndpoint && isTokenInvalid) {
          // Only for auth endpoints with invalid token - clear tokens and redirect
          console.warn('⚠️ 401 on auth endpoint with invalid token - clearing tokens and redirecting')
          // Clear all possible token keys from localStorage
          const tokenKeys = ['tapeout_token', 'token', 'authToken', 'access_token']
          tokenKeys.forEach(key => localStorage.removeItem(key))
          
          // Redirect to login if we're not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            console.log('🔄 Redirecting to login due to authentication failure on auth endpoint')
            window.location.href = '/login'
          }
        } else {
          // For other 401 errors (likely permission issues), just log but don't redirect
          console.warn('⚠️ 401 error on non-auth endpoint - likely a permission issue, not redirecting:', cleanUrl)
        }
      } catch (e) {
        console.error('❌ 401 Unauthorized - Could not read error text:', e)
        ;(response as any).errorDetail = 'Authentication failed'
        ;(response as any).isAuthError = true
        
        // Only redirect if it's an auth endpoint
        const isAuthEndpoint = cleanUrl.includes('/auth/') || cleanUrl.includes('/me') || cleanUrl.includes('/user/profile')
        if (isAuthEndpoint) {
          const tokenKeys = ['tapeout_token', 'token', 'authToken', 'access_token']
          tokenKeys.forEach(key => localStorage.removeItem(key))
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
      }
    }
  
    return response
  } catch (fetchError: any) {
    console.error('❌ authenticatedFetch - Network error:', fetchError)
    // Create a mock response for network errors
    const errorResponse = new Response(
      JSON.stringify({ detail: 'Network error: ' + (fetchError.message || 'Failed to fetch') }),
      { status: 0, statusText: 'Network Error' }
    )
    ;(errorResponse as any).errorDetail = fetchError.message || 'Network error'
    ;(errorResponse as any).isNetworkError = true
    throw errorResponse
  }
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
  
  // Handle errors - read response body only once
  if (!specsRes.ok) {
    let errorMessage = 'Failed to load specs'
    try {
      const errorText = await specsRes.text()
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorText
      } catch {
        errorMessage = errorText || errorMessage
      }
    } catch (e) {
      console.error('Failed to read specs error:', e)
    }
    throw new Error(errorMessage)
  }
  
  if (!checklistsRes.ok) {
    let errorMessage = 'Failed to load checklists'
    try {
      const errorText = await checklistsRes.text()
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.detail || errorData.message || errorText
      } catch {
        errorMessage = errorText || errorMessage
      }
    } catch (e) {
      console.error('Failed to read checklists error:', e)
    }
    throw new Error(errorMessage)
  }
  
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
    // Only read error text if we haven't already read the body
    try {
      const errorText = await qualityScoreRes.clone().text().catch(() => 'Unknown error')
      console.warn('⚠️ Quality score API returned error:', qualityScoreRes.status, errorText)
    } catch (e) {
      console.warn('⚠️ Quality score API returned error:', qualityScoreRes.status)
    }
  }
  
  // Parse successful responses
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