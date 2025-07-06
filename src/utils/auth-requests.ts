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
  if (authStore.token && authStore.token !== 'undefined' && authStore.token !== 'null') {
    headers['Authorization'] = `Bearer ${authStore.token}`
  }
  
  // Don't set Content-Type for FormData (browser will set it automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
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