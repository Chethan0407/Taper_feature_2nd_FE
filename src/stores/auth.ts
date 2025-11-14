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

  const isAuthenticated = computed(() => {
    const authenticated = !!token.value && !!user.value
    console.log('🔐 Authentication state changed:', {
      hasToken: !!token.value,
      hasUser: !!user.value,
      isAuthenticated: authenticated,
      tokenValue: token.value,
      userValue: user.value
    })
    return authenticated
  })

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
    console.log('🚪 LOGOUT CALLED')
    console.log('📍 Stack trace:', new Error().stack)
    console.log('👤 Current user:', user.value)
    console.log('🎫 Current token:', token.value)
    
    try {
      if (token.value && token.value !== 'undefined' && token.value !== 'null') {
        const authHeaders = getAuthHeader()
        console.log('🔗 Calling backend logout endpoint')
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: authHeaders
        })
        console.log('✅ Backend logout successful')
      }
    } catch (error) {
      console.log('⚠️ Backend logout failed:', error)
    }
    
    user.value = null
    token.value = null
    localStorage.removeItem('tapeout_token')
    
    console.log('✅ Logout completed - user and token cleared')
  }

  const checkAuth = async () => {
    console.log('🔍 checkAuth called')
    console.log('Token exists:', !!token.value)
    console.log('Token value:', token.value)
    
    if (!token.value || token.value === 'undefined' || token.value === 'null') {
      console.log('❌ No valid token found')
      return false
    }
    
    try {
      const authHeaders = getAuthHeader()
      console.log('🔗 Making auth check request to:', `${API_BASE}/me`)
      console.log('📋 Headers:', authHeaders)
      
      const response = await fetch(`${API_BASE}/me`, authHeaders ? { headers: authHeaders } : undefined)
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Auth check failed:', response.status, errorText)
        throw new Error(`Not authenticated: ${response.status} ${errorText}`)
      }
      
      const userData = await response.json()
      console.log('✅ Auth check successful, user data:', userData)
      user.value = userData
      return true
    } catch (error) {
      console.log('💥 Auth check error:', error)
      console.log('🚪 Calling logout due to auth failure')
      logout()
      return false
    }
  }

  // Auto-load user data if token exists but user is missing
  const initializeAuth = async () => {
    if (token.value && token.value !== 'undefined' && token.value !== 'null' && !user.value) {
      console.log('🔄 Auto-loading user data for existing token')
      await checkAuth()
    }
  }
  
  // Initialize auth on store creation
  initializeAuth()
  
  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    checkAuth,
    getAuthHeader,
    initializeAuth
  }
}) 