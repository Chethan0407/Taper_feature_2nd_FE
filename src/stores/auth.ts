import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'lead' | 'engineer' | 'manager'
  avatar?: string
}

// Use relative path to go through Vite proxy
const API_BASE = '/api/v1/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  // Load token from localStorage, but filter out invalid values
  const storedToken = localStorage.getItem('tapeout_token')
  const token = ref<string | null>(
    storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedToken.trim() !== '' 
      ? storedToken 
      : null
  )
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
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Invalid credentials')
      }
      const data = await response.json()
      const receivedToken = data.token || data.access_token
      
      // Validate token before storing
      if (!receivedToken || receivedToken === 'undefined' || receivedToken === 'null' || receivedToken.trim() === '') {
        throw new Error('No valid token received from server')
      }
      
      // Store token first
      token.value = receivedToken
      localStorage.setItem('tapeout_token', receivedToken)
      console.log('✅ Token stored after login')
      
      // Then fetch user profile
      const authHeaders = { 'Authorization': `Bearer ${receivedToken}` }
      const profileRes = await fetch(`${API_BASE}/me`, { headers: authHeaders })
      if (!profileRes.ok) {
        const errorText = await profileRes.text()
        throw new Error(`Failed to fetch profile: ${errorText}`)
      }
      user.value = await profileRes.json()
      console.log('✅ User profile loaded after login:', user.value?.email)
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      // Clear any partial state on error
      token.value = null
      user.value = null
      localStorage.removeItem('tapeout_token')
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
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(`${API_BASE}/me`, {
        ...(authHeaders ? { headers: authHeaders } : {}),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Auth check failed:', response.status, errorText)
        // Only logout if it's a clear 401/403 - don't logout on network errors
        if (response.status === 401 || response.status === 403) {
          console.log('🚪 Token is invalid, clearing auth state')
          user.value = null
          token.value = null
          localStorage.removeItem('tapeout_token')
        }
        return false
      }
      
      const userData = await response.json()
      console.log('✅ Auth check successful, user data:', userData)
      user.value = userData
      return true
    } catch (error: any) {
      console.log('💥 Auth check error:', error)
      // Don't logout on network errors or timeouts - just return false
      if (error.name === 'AbortError') {
        console.log('⏱️ Auth check timed out after 5 seconds')
      }
      console.log('⚠️ Network or other error during auth check - not clearing token')
      return false
    }
  }

  // Auto-load user data if token exists but user is missing
  const initializeAuth = async () => {
    try {
      if (token.value && token.value !== 'undefined' && token.value !== 'null' && !user.value) {
        console.log('🔄 Auto-loading user data for existing token')
        const result = await checkAuth()
        if (!result) {
          console.log('⚠️ Auth initialization failed - token may be invalid')
          // Don't clear token here - let the router guard handle it
        }
      }
    } catch (error) {
      console.error('⚠️ Error during auth initialization:', error)
      // Don't throw - allow app to continue loading
      // Don't clear token on initialization errors
    }
  }
  
  // Initialize auth on store creation (don't block app loading)
  // Only initialize if we have a token and no user - don't run if user is already set
  // Use setTimeout to ensure it doesn't block app initialization
  if (token.value && token.value !== 'undefined' && token.value !== 'null' && !user.value) {
    setTimeout(() => {
      initializeAuth().catch(err => {
        console.error('⚠️ Auth initialization failed:', err)
      })
    }, 100) // Delay to ensure app loads first
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
    getAuthHeader,
    initializeAuth
  }
}) 