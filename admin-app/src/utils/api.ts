import { useAuthStore } from '@/stores/auth'

const getBaseUrl = () => {
  const base = import.meta.env.VITE_API_BASE
  if (base && base.trim() !== '') {
    return base.replace(/\/$/, '') // no trailing slash
  }
  return '' // same origin, use proxy in dev
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authStore = useAuthStore()
  let finalUrl = url.startsWith('http') ? url : getBaseUrl() + url
  if (finalUrl.endsWith('/') && finalUrl !== '/') finalUrl = finalUrl.slice(0, -1)

  const token = authStore.token
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return new Response(JSON.stringify({ detail: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token.trim()
  const headers: Record<string, string> = {
    Authorization: `Bearer ${cleanToken}`,
    ...((options.headers as Record<string, string>) || {}),
  }
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(finalUrl, { ...options, headers })
}
