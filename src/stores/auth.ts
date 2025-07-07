import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'lead' | 'engineer' | 'manager'
  avatar?: string
}

const API_BASE = 'http://localhost:8000/api/v1/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('tapeout_token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function getAuthHeader(): HeadersInit | undefined {
    if (token.value && token.value !== 'undefined' && token.value !== 'null') {
      return { 'Authorization': `Bearer ${token.value}` }
    }
    return undefined
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!response.ok) throw new Error('Invalid credentials')
      const data = await response.json()
      token.value = data.token || data.access_token
      localStorage.setItem('tapeout_token', token.value || '')
      const receivedToken = data.token || data.access_token
      if (receivedToken && receivedToken !== 'undefined' && receivedToken !== 'null') {
        const authHeaders = { 'Authorization': `Bearer ${receivedToken}` }
        const profileRes = await fetch(`${API_BASE}/me`, { headers: authHeaders })
        if (!profileRes.ok) throw new Error('Failed to fetch profile')
        user.value = await profileRes.json()
        return { success: true }
      } else {
        throw new Error('No valid token received')
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Invalid credentials' }
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async () => {
    isLoading.value = true
    try {
      const googleToken = '' // Get from Google SDK
      const response = await fetch(`${API_BASE}/login/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken })
      })
      if (!response.ok) throw new Error('Google login failed')
      const data = await response.json()
      token.value = data.token || data.access_token
      localStorage.setItem('tapeout_token', token.value || '')
      const receivedToken = data.token || data.access_token
      if (receivedToken && receivedToken !== 'undefined' && receivedToken !== 'null') {
        const authHeaders = { 'Authorization': `Bearer ${receivedToken}` }
        const profileRes = await fetch(`${API_BASE}/me`, { headers: authHeaders })
        if (!profileRes.ok) throw new Error('Failed to fetch profile')
        user.value = await profileRes.json()
        return { success: true }
      } else {
        throw new Error('No valid token received')
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Google login failed' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value && token.value !== 'undefined' && token.value !== 'null') {
        const authHeaders = getAuthHeader()
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: authHeaders
        })
      }
    } catch {}
    user.value = null
    token.value = null
    localStorage.removeItem('tapeout_token')
  }

  const checkAuth = async () => {
    if (!token.value || token.value === 'undefined' || token.value === 'null') return false
    try {
      const authHeaders = getAuthHeader()
      const response = await fetch(`${API_BASE}/me`, authHeaders ? { headers: authHeaders } : undefined)
      if (!response.ok) throw new Error('Not authenticated')
      user.value = await response.json()
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    checkAuth,
    getAuthHeader
  }
}) 