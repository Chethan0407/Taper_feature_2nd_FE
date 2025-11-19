/**
 * Unified API client for all authenticated requests
 * Reads token directly from localStorage and ensures Authorization header is always included
 */

const TOKEN_KEY = 'tapeout_token'

/**
 * Get the authentication token from localStorage
 */
function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return null
  }
  return token
}

/**
 * Unified API client for all authenticated requests
 * @param url - API endpoint (relative path, e.g., '/settings/branding/')
 * @param options - Fetch options
 * @returns Response object
 */
export async function apiClient(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token directly from localStorage
  const token = getToken()
  
  if (!token) {
    console.error('❌ apiClient - No token found in localStorage')
    // Don't redirect automatically - let the router or component handle it
    // Just return an error response
    const errorResponse = new Response(
      JSON.stringify({ detail: 'No authentication token found. Please log in.' }),
      { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } }
    )
    ;(errorResponse as any).errorDetail = 'No authentication token found. Please log in.'
    ;(errorResponse as any).isAuthError = true
    return errorResponse
  }
  
  // Smart URL normalization:
  // - Profile endpoint should NOT have trailing slash (causes network error)
  // - Settings endpoints NEED trailing slash (to avoid 307 redirects)
  // - Preserve query parameters
  let finalUrl = url
  
  // Remove trailing slash if it's a profile endpoint
  if (finalUrl.includes('/user/profile') && finalUrl.endsWith('/')) {
    finalUrl = finalUrl.slice(0, -1)
    console.log('🔧 apiClient - Removed trailing slash from profile endpoint')
  }
  // Add trailing slash for settings endpoints (except if query params exist)
  else if (finalUrl.startsWith('/settings/') && !finalUrl.includes('?') && !finalUrl.endsWith('/')) {
    finalUrl = finalUrl + '/'
    console.log('🔧 apiClient - Added trailing slash to settings endpoint')
  }
  // For other endpoints, preserve as-is (don't auto-add trailing slash)
  
  const fullUrl = `/api/v1${finalUrl}`
  
  // Ensure token doesn't have "Bearer " prefix (we'll add it)
  const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token
  const authToken = `Bearer ${cleanToken}`
  
  // Prepare headers - ALWAYS include Authorization header first
  const headers: Record<string, string> = {
    'Authorization': authToken, // Always include Authorization header - CRITICAL
  }
  
  // Merge any existing headers from options (but Authorization takes precedence)
  const existingHeaders = options.headers as Record<string, string> || {}
  for (const key in existingHeaders) {
    if (key.toLowerCase() !== 'authorization') {
      headers[key] = existingHeaders[key]
    }
  }
  
  // Don't set Content-Type for FormData (browser will set it automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  
  console.log('📤 apiClient - Request:', {
    originalUrl: url,
    finalUrl: finalUrl,
    fullUrl: fullUrl,
    method: options.method || 'GET',
    hasAuthHeader: !!headers['Authorization'],
    authHeaderValue: headers['Authorization'] ? `${headers['Authorization'].substring(0, 20)}...` : 'MISSING',
    tokenLength: cleanToken.length,
    allHeaders: Object.keys(headers)
  })
  
  try {
    // Use 'manual' redirect to handle it ourselves and preserve headers
    let response = await fetch(fullUrl, {
      ...options,
      headers,
      redirect: 'manual' as RequestRedirect
    })
    
    // Handle 307/308 redirects manually to preserve Authorization header
    if (response.status === 307 || response.status === 308) {
      const redirectUrl = response.headers.get('Location')
      if (redirectUrl) {
        console.log('🔄 apiClient - Handling redirect:', {
          from: fullUrl,
          to: redirectUrl,
          status: response.status
        })
        // Retry with redirect URL, preserving all headers (especially Authorization)
        response = await fetch(redirectUrl, {
          ...options,
          headers, // Headers are preserved, including Authorization
          redirect: 'follow' as RequestRedirect // Allow further redirects if needed
        })
      }
    }
    
    console.log('📥 apiClient - Response:', {
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })
    
    // Handle 401 errors - but don't automatically redirect
    // Let the calling component decide what to do
    if (response.status === 401) {
      console.error('❌ apiClient - 401 Unauthorized:', {
        url: fullUrl,
        tokenExists: !!token,
        tokenLength: cleanToken.length,
        hasAuthHeader: !!headers['Authorization'],
        authHeaderPresent: headers['Authorization'] ? 'YES' : 'NO',
        authHeaderPrefix: headers['Authorization']?.substring(0, 15) || 'MISSING',
        requestHeaders: Object.keys(headers),
        method: options.method || 'GET'
      })
      
      // Log the actual request that was sent for debugging
      console.error('🔍 Request details:', {
        url: fullUrl,
        method: options.method || 'GET',
        headers: headers,
        body: options.body instanceof FormData ? '[FormData]' : options.body
      })
      
      // Try to get error message from response
      let errorDetail = 'Authentication failed'
      try {
        const errorText = await response.clone().text()
        try {
          const errorData = JSON.parse(errorText)
          errorDetail = errorData.detail || errorData.message || errorText
        } catch {
          errorDetail = errorText || errorDetail
        }
      } catch (e) {
        console.error('Failed to read error response:', e)
      }
      
      // Add error information to response
      // Components can check response.isAuthError to decide if they should redirect
      ;(response as any).errorDetail = errorDetail
      ;(response as any).isAuthError = true
      
      // Don't clear token or redirect here - let the calling component decide
      // The component can check the error message and decide if it's a real auth failure
      // or just a permission issue
    }
    
    return response
  } catch (networkError: any) {
    console.error('💥 apiClient - Network error:', networkError)
    // Create a mock response for network errors
    const errorResponse = new Response(
      JSON.stringify({ detail: networkError.message || 'Network error' }),
      { status: 500, statusText: 'Network Error', headers: { 'Content-Type': 'application/json' } }
    )
    ;(errorResponse as any).errorDetail = networkError.message || 'Network error'
    ;(errorResponse as any).isNetworkError = true
    return errorResponse
  }
}

/**
 * Helper to parse error messages from API responses
 */
export async function parseApiError(response: Response, defaultMessage: string): Promise<string> {
  try {
    const errorText = await response.text()
    try {
      const errorData = JSON.parse(errorText)
      return errorData.detail || errorData.message || errorText || defaultMessage
    } catch {
      return errorText || defaultMessage
    }
  } catch (e) {
    console.error('Failed to read error:', e)
    return defaultMessage
  }
}

