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
  
  // Smart URL normalization:
  // - Profile endpoint should NOT have trailing slash (causes network error)
  // - Checklist endpoints should NOT have trailing slash (backend requirement)
  // - Some endpoints (lint-results, settings) NEED trailing slash (to avoid 307 redirects)
  // - Preserve query parameters
  let finalUrl = url
  
  // Remove trailing slash if it's a profile endpoint
  if (finalUrl.includes('/user/profile') && finalUrl.endsWith('/')) {
    finalUrl = finalUrl.slice(0, -1)
    console.log('🔧 authenticatedFetch - Removed trailing slash from profile endpoint')
  }
  // Remove trailing slash from checklist endpoints (backend requirement)
  else if (finalUrl.includes('/checklists') && finalUrl.endsWith('/')) {
    finalUrl = finalUrl.slice(0, -1)
    console.log('🔧 authenticatedFetch - Removed trailing slash from checklist endpoint')
  }
  // Add trailing slash for specific list endpoints that need it (except if query params exist or it's a specific resource)
  else if (
    (finalUrl.includes('/lint-results') || 
     finalUrl.startsWith('/api/v1/settings/') ||
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
  
  // Use the URL as-is (Vite proxy will handle /api/v1/* requests)
  const cleanUrl = finalUrl
  
  // Validate and add token FIRST - Check both authStore and localStorage
  // IMPORTANT: Check all possible token storage keys (prioritize access_token as per backend)
  const tokenKeys = ['access_token', 'tapeout_token', 'token', 'authToken', 'accessToken']
  let token: string | null = null
  
  // First, try authStore.token (most up-to-date)
  if (authStore && authStore.token && authStore.token !== 'undefined' && authStore.token !== 'null' && authStore.token.trim() !== '') {
    token = authStore.token
    console.log('🔑 authenticatedFetch - Token retrieved from authStore:', token.substring(0, 20) + '...')
  }
  
  // Fallback to localStorage if authStore didn't have it
  // Check access_token FIRST (as per backend standard)
  if (!token) {
    for (const key of tokenKeys) {
      try {
        const storedToken = localStorage.getItem(key)
        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedToken.trim() !== '') {
          token = storedToken
          console.log('🔑 authenticatedFetch - Token retrieved from localStorage:', key, token.substring(0, 20) + '...')
          // Also update authStore for future use
          if (authStore) {
            authStore.token = storedToken
          }
          break
        }
      } catch (e) {
        console.warn('⚠️ Error reading localStorage key:', key, e)
      }
    }
  }
  
  // If still no token, try to get it from authStore one more time (in case it was just updated)
  if (!token && authStore && authStore.token) {
    const storeToken = authStore.token
    if (storeToken && storeToken !== 'undefined' && storeToken !== 'null' && storeToken.trim() !== '') {
      token = storeToken
      console.log('🔑 authenticatedFetch - Token retrieved from authStore (retry):', token.substring(0, 20) + '...')
    }
  }
  
  // Debug: Log what we found
  console.log('🔍 authenticatedFetch - Token search result:', {
    foundToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
    localStorageKeys: tokenKeys.map(k => ({ key: k, exists: !!localStorage.getItem(k) })),
    authStoreToken: !!authStore.token
  })
  
  // Early check: if no token, don't make the request
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    console.error('❌ authenticatedFetch - No valid token found, aborting request:', cleanUrl)
    console.error('❌ Checked authStore.token and localStorage keys: tapeout_token, token, authToken, access_token')
    console.error('❌ localStorage values:', {
      tapeout_token: localStorage.getItem('tapeout_token') ? 'EXISTS' : 'MISSING',
      token: localStorage.getItem('token') ? 'EXISTS' : 'MISSING',
      authToken: localStorage.getItem('authToken') ? 'EXISTS' : 'MISSING',
      access_token: localStorage.getItem('access_token') ? 'EXISTS' : 'MISSING',
      authStoreToken: authStore.token ? 'EXISTS' : 'MISSING'
    })
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
  
  // Ensure token has "Bearer " prefix (remove if already present to avoid duplication)
  const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token.trim()
  const authToken = `Bearer ${cleanToken}`
  
  console.log('🔐 authenticatedFetch - Preparing Authorization header:', {
    originalToken: token.substring(0, 20) + '...',
    cleanToken: cleanToken.substring(0, 20) + '...',
    authToken: authToken.substring(0, 30) + '...',
    url: cleanUrl,
    tokenLength: token.length,
    cleanTokenLength: cleanToken.length
  })
  
  // Prepare headers - SET Authorization FIRST, then merge other headers
  // CRITICAL: Use plain object (not Object.create(null)) for maximum fetch compatibility
  const headers: Record<string, string> = {
    'Authorization': authToken // CRITICAL: Set Authorization header first
  }
  
  // Verify Authorization header is set correctly
  if (!headers['Authorization'] || !headers['Authorization'].startsWith('Bearer ')) {
    console.error('❌ CRITICAL: Authorization header not set correctly!', {
      hasHeader: !!headers['Authorization'],
      headerValue: headers['Authorization'] || 'MISSING',
      tokenExists: !!token,
      headersObject: headers
    })
    throw new Error('Failed to set Authorization header')
  }
  
  console.log('✅ Authorization header prepared:', {
    headerKey: 'Authorization',
    headerValue: headers['Authorization'].substring(0, 30) + '...',
    headerLength: headers['Authorization'].length
  })
  
  // Merge any existing headers from options (but Authorization takes precedence - already set above)
  const existingHeaders = (options.headers as Record<string, string>) || {}
  for (const key in existingHeaders) {
    if (key.toLowerCase() !== 'authorization') { // Skip Authorization to avoid overwriting
      headers[key] = existingHeaders[key]
    }
  }
  
  // Validate token for logging purposes only
  const validation = validateToken(cleanToken)
  if (validation.valid) {
    console.log('✅ authenticatedFetch - Authorization header added (token valid)')
  } else {
    console.warn('⚠️ authenticatedFetch - Token validation warning:', validation.reason, '- Still sending token to backend')
  }
  
  // Log the actual header being sent (first 30 chars only for security)
  console.log('📤 Authorization header:', `Bearer ${cleanToken.substring(0, 30)}...`)
  
  // Don't set Content-Type for FormData (browser will set it automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  
  // CRITICAL: Double-check Authorization header is set
  if (!headers['Authorization'] || !headers['Authorization'].startsWith('Bearer ')) {
    console.error('❌ CRITICAL ERROR: Authorization header is missing or invalid!', {
      hasHeader: !!headers['Authorization'],
      headerValue: headers['Authorization'] || 'MISSING',
      tokenExists: !!token
    })
    const errorResponse = new Response(
      JSON.stringify({ detail: 'Authorization header is missing. Please log in again.' }),
      { status: 401, statusText: 'Unauthorized' }
    )
    ;(errorResponse as any).errorDetail = 'Authorization header is missing. Please log in again.'
    ;(errorResponse as any).isAuthError = true
    return errorResponse
  }
  
  console.log('📤 authenticatedFetch - Request details:', {
    originalUrl: url,
    cleanUrl: cleanUrl,
    method: options.method || 'GET',
    hasAuthHeader: !!headers['Authorization'],
    authHeaderValue: headers['Authorization'] ? `${headers['Authorization'].substring(0, 30)}...` : 'MISSING',
    authHeaderLength: headers['Authorization']?.length || 0,
    headerKeys: Object.keys(headers),
    allHeaders: Object.keys(headers).reduce((acc, key) => {
      acc[key] = key === 'Authorization' ? `${headers[key].substring(0, 30)}...` : headers[key]
      return acc
    }, {} as Record<string, string>)
  })
  
  try {
    // Use the headers object we already created and verified above
    // It already has Authorization header set and Content-Type added if needed
    // Just ensure it's a plain object (not Headers instance) for maximum compatibility
    
    // Build fetch options - use the verified headers object directly
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: headers, // Use the headers object we created and verified above
      redirect: 'follow' as RequestRedirect,
    }
    
    // Add optional properties
    if (options.body) fetchOptions.body = options.body
    if (options.signal) fetchOptions.signal = options.signal
    if (options.cache) fetchOptions.cache = options.cache
    if (options.credentials) fetchOptions.credentials = options.credentials
    if (options.mode) fetchOptions.mode = options.mode
    
    // Final verification before sending - headers should still have Authorization
    const finalCheckHeaders = fetchOptions.headers as Record<string, string>
    if (!finalCheckHeaders || !finalCheckHeaders['Authorization']) {
      console.error('❌ CRITICAL: Authorization header lost in fetchOptions!', {
        hasHeaders: !!fetchOptions.headers,
        headersType: typeof fetchOptions.headers,
        isHeadersInstance: fetchOptions.headers instanceof Headers,
        headerKeys: fetchOptions.headers ? Object.keys(finalCheckHeaders) : []
      })
      throw new Error('Authorization header is missing')
    }
    
    if (!finalCheckHeaders['Authorization'].startsWith('Bearer ')) {
      console.error('❌ CRITICAL: Authorization header missing Bearer prefix in fetchOptions!')
      throw new Error('Authorization header must start with "Bearer "')
    }
    
    // CRITICAL: Verify headers one more time right before fetch
    // Convert to plain object if it's a Headers instance (shouldn't be, but just in case)
    let finalHeadersForFetch: Record<string, string>
    if (fetchOptions.headers instanceof Headers) {
      finalHeadersForFetch = {}
      fetchOptions.headers.forEach((value, key) => {
        finalHeadersForFetch[key] = value
      })
      fetchOptions.headers = finalHeadersForFetch
    } else {
      finalHeadersForFetch = fetchOptions.headers as Record<string, string>
    }
    
    // Final verification - Authorization MUST be present
    if (!finalHeadersForFetch || !finalHeadersForFetch['Authorization']) {
      console.error('❌ CRITICAL: Authorization header missing right before fetch!', {
        hasHeaders: !!fetchOptions.headers,
        headersType: typeof fetchOptions.headers,
        isHeadersInstance: fetchOptions.headers instanceof Headers,
        headerKeys: fetchOptions.headers ? Object.keys(finalHeadersForFetch) : []
      })
      throw new Error('Authorization header is missing')
    }
    
    if (!finalHeadersForFetch['Authorization'].startsWith('Bearer ')) {
      console.error('❌ CRITICAL: Authorization header missing Bearer prefix right before fetch!')
      throw new Error('Authorization header must start with "Bearer "')
    }
    
    console.log('🚀 authenticatedFetch - Sending request:', {
      url: cleanUrl,
      method: fetchOptions.method,
      hasAuthHeader: !!finalHeadersForFetch['Authorization'],
      authHeaderValue: finalHeadersForFetch['Authorization']?.substring(0, 30) + '...',
      authHeaderLength: finalHeadersForFetch['Authorization']?.length,
      allHeaderKeys: Object.keys(finalHeadersForFetch),
      headersType: typeof fetchOptions.headers,
      isHeadersInstance: fetchOptions.headers instanceof Headers,
      fullAuthHeader: finalHeadersForFetch['Authorization'] // Log full header for debugging (first 50 chars)
    })
    
    // Make the fetch request directly with fetchOptions
    // Don't use Request object - pass fetchOptions directly to ensure headers are preserved
    // The Vite proxy should forward all headers correctly
    
    // Final log before fetch - verify Authorization header format
    const authHeader = finalHeadersForFetch['Authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ CRITICAL: Authorization header format is incorrect!', {
        headerValue: authHeader || 'MISSING',
        expectedFormat: 'Bearer <token>'
      })
      throw new Error('Authorization header must be in format: Bearer <token>')
    }
    
    console.log('🚀 Final fetch call:', {
      url: cleanUrl,
      method: fetchOptions.method,
      headers: Object.keys(finalHeadersForFetch),
      hasAuthorization: !!authHeader,
      authHeaderFormat: authHeader.startsWith('Bearer ') ? 'CORRECT' : 'INCORRECT',
      authHeaderPreview: authHeader.substring(0, 40) + '...',
      authHeaderLength: authHeader.length
    })
    
    // Make the fetch request - headers should be properly formatted
    const response = await fetch(cleanUrl, fetchOptions)
    
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
          // This prevents auto-logout when clicking on pages like Checklists
          return response
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