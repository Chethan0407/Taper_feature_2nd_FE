import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { resolveApiUrl } from '@/config/api'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'lead' | 'engineer' | 'manager'
  /** Canonical profile photo URL (from avatar_url || avatar on /me). */
  avatar?: string
  avatar_url?: string
  is_superuser?: boolean
}

/** Accept boolean / 1 / "true" from varied backend payloads. */
function isTruthyFlag(v: unknown): boolean {
  if (v === true || v === 1) return true
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    return s === 'true' || s === '1' || s === 'yes'
  }
  return false
}

/** Backend role / flags vary; normalize so /admin/usage works in prod. */
function userHasAdminAccess(u: Record<string, unknown> | null | undefined): boolean {
  if (!u) return false
  if (isTruthyFlag(u.is_superuser)) return true
  if (isTruthyFlag(u.is_admin)) return true
  const r = u.role
  if (r == null || r === '') return false
  const role = String(r).toLowerCase().trim()
  return (
    role === 'admin' ||
    role === 'superuser' ||
    role === 'super_admin' ||
    role === 'superadmin' ||
    role === 'administrator'
  )
}

function pickAvatarUrl(raw: Record<string, unknown>): string | undefined {
  const url = raw.avatar_url || raw.avatar
  return typeof url === 'string' && url.trim() ? url.trim() : undefined
}

function normalizeUser(raw: Record<string, unknown> | null | undefined): User | null {
  if (!raw || typeof raw !== 'object') return null
  const avatar = pickAvatarUrl(raw)
  return {
    ...(raw as unknown as User),
    is_superuser: isTruthyFlag(raw.is_superuser),
    avatar,
    avatar_url: avatar,
  }
}

const USER_CACHE_KEY = 'tapeout_user_cache'

function readCachedUser(): User | null {
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    return normalizeUser(JSON.parse(raw))
  } catch {
    return null
  }
}

function writeCachedUser(u: User | null) {
  try {
    if (!u) {
      sessionStorage.removeItem(USER_CACHE_KEY)
      return
    }
    sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(u))
  } catch {
    /* ignore quota */
  }
}

const API_BASE = resolveApiUrl('/api/v1/auth')

export const useAuthStore = defineStore('auth', () => {
  // Instant paint on refresh: reuse last /me profile while a fresh check runs in the background
  const cachedUser = readCachedUser()
  const user = ref<User | null>(cachedUser)
  // Load token from localStorage, but filter out invalid values
  const storedToken = localStorage.getItem('tapeout_token')
  const token = ref<string | null>(
    storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedToken.trim() !== '' 
      ? storedToken 
      : null
  )
  // Drop stale cache if there is no token
  if (!token.value && user.value) {
    user.value = null
    writeCachedUser(null)
  }
  const isLoading = ref(false)
  let authCheckInProgress = false // Flag to prevent multiple simultaneous auth checks
  let authCheckPromise: Promise<boolean> | null = null

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

  /** True if user has admin or super-admin role (for admin-only routes like System Usage). */
  const isAdmin = computed(() => userHasAdminAccess(user.value as Record<string, unknown> | null))

  /** True when /me reports is_superuser (System Usage). */
  const isSuperuser = computed(() => user.value?.is_superuser === true)

  /**
   * Bulk export / import (Settings → Data transfer).
   * Gate: profile.role === "admin" || profile.is_superuser === true
   */
  const canManageDataTransfer = computed(() => {
    if (!user.value) return false
    if (user.value.is_superuser === true) return true
    return String(user.value.role || '').toLowerCase().trim() === 'admin'
  })

  function getAuthHeader(): HeadersInit | undefined {
    if (token.value && token.value !== 'undefined' && token.value !== 'null') {
      // Ensure token has "Bearer " prefix (remove if already present to avoid duplication)
      const cleanToken = token.value.startsWith('Bearer ') ? token.value.substring(7) : token.value
      return { 'Authorization': `Bearer ${cleanToken}` }
    }
    return undefined
  }

  const applyAccessToken = async (receivedToken: string) => {
    let clean = receivedToken
    if (clean.startsWith('Bearer ')) clean = clean.substring(7)
    if (!clean || clean === 'undefined' || clean === 'null') {
      throw new Error('No valid token received from server')
    }
    token.value = clean
    localStorage.setItem('tapeout_token', clean)
    localStorage.setItem('access_token', clean)
    const authHeaders = { Authorization: `Bearer ${clean}` }
    const profileRes = await fetch(`${API_BASE}/me`, { headers: authHeaders })
    if (!profileRes.ok) {
      const errorText = await profileRes.text()
      throw new Error(`Failed to fetch profile: ${errorText}`)
    }
    user.value = normalizeUser(await profileRes.json())
    writeCachedUser(user.value)
  }

  const clearAuthStorage = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('tapeout_token')
    localStorage.removeItem('access_token')
    writeCachedUser(null)
  }

  const login = async (email: string, password: string, mfaCode?: string) => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Email is required' }
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'Password is required' }
    }
    if (isLoading.value) {
      return { success: false, error: 'Login already in progress' }
    }

    isLoading.value = true
    try {
      const body: Record<string, string> = {
        email: email.trim(),
        password,
      }
      if (mfaCode?.trim()) body.mfa_code = mfaCode.trim()

      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error:
            errorData.detail ||
            errorData.message ||
            'Email not verified. Please verify your email address first.',
          requiresVerification: true,
          email: email.trim(),
        }
      }

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.detail || errorData.message || 'Invalid email or password',
        }
      }

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error:
            errorData.detail ||
            errorData.message ||
            'Account temporarily locked due to too many failed login attempts. Please try again later.',
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Invalid credentials'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.detail || errorData.message || errorText || 'Invalid credentials'
        } catch {
          errorMessage = errorText || 'Invalid credentials'
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (data.requires_mfa === true && data.mfa_token) {
        return {
          success: false,
          requiresMfa: true,
          mfaToken: data.mfa_token as string,
          email: email.trim(),
        }
      }

      const receivedToken = data.token || data.access_token
      if (!receivedToken) {
        throw new Error('No valid token received from server')
      }
      await applyAccessToken(receivedToken)
      return { success: true }
    } catch (error: any) {
      clearAuthStorage()
      return { success: false, error: error.message || 'Invalid credentials' }
    } finally {
      isLoading.value = false
    }
  }

  /** Complete MFA after password step (POST /auth/mfa/verify). */
  const verifyMfa = async (mfaToken: string, mfaCode: string) => {
    if (!mfaToken || !mfaCode?.trim()) {
      return { success: false, error: 'MFA code is required' }
    }
    if (isLoading.value) {
      return { success: false, error: 'Login already in progress' }
    }
    isLoading.value = true
    try {
      const response = await fetch(`${API_BASE}/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfa_token: mfaToken, mfa_code: mfaCode.trim() }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.detail || errorData.message || 'Invalid MFA code',
        }
      }
      const data = await response.json()
      const receivedToken = data.token || data.access_token
      if (!receivedToken) {
        throw new Error('No valid token received from server')
      }
      await applyAccessToken(receivedToken)
      return { success: true }
    } catch (error: any) {
      clearAuthStorage()
      return { success: false, error: error.message || 'Invalid MFA code' }
    } finally {
      isLoading.value = false
    }
  }

  const verifyEmail = async (email: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = errorData.detail || errorData.message || 'Invalid or expired OTP. Please check your email and try again, or request a new OTP.'
        
        // Handle 404 - User not found
        if (response.status === 404) {
          errorMessage = 'User not found'
        }
        // Handle 400 - Invalid or expired OTP
        else if (response.status === 400) {
          if (errorMessage.toLowerCase().includes('expired')) {
            errorMessage = 'Invalid or expired OTP. Please check your email and try again, or request a new OTP.'
          } else if (errorMessage.toLowerCase().includes('invalid')) {
            errorMessage = 'Invalid or expired OTP. Please check your email and try again, or request a new OTP.'
          }
        }
        
        return { success: false, error: errorMessage }
      }

      const data = await response.json()
      let receivedToken = data.access_token || data.token

      // Validate token before storing
      if (!receivedToken || receivedToken === 'undefined' || receivedToken === 'null' || receivedToken.trim() === '') {
        return { success: false, error: 'No valid token received from server' }
      }

      // Remove "Bearer " prefix if present
      if (receivedToken.startsWith('Bearer ')) {
        receivedToken = receivedToken.substring(7)
      }

      // Store token
      token.value = receivedToken
      localStorage.setItem('tapeout_token', receivedToken)
      console.log('✅ Token stored after email verification')

      // Set user data from response
      if (data.user) {
        user.value = normalizeUser(data.user)
        writeCachedUser(user.value)
        console.log('✅ User data set after email verification:', user.value?.email)
      } else {
        // Fetch user profile if not included in response
        const authHeaders = { 'Authorization': `Bearer ${receivedToken}` }
        const profileRes = await fetch(`${API_BASE}/me`, { headers: authHeaders })
        if (profileRes.ok) {
          user.value = normalizeUser(await profileRes.json())
          writeCachedUser(user.value)
          console.log('✅ User profile loaded after verification')
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error('❌ Email verification error:', error)
      return { success: false, error: error.message || 'Verification failed. Please try again.' }
    }
  }

  const resendOTP = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = errorData.detail || errorData.message || 'Failed to resend OTP. Please try again.'
        
        // Handle specific error: email already verified
        if (response.status === 400 && 
            (errorMessage.toLowerCase().includes('already verified') ||
             errorMessage.toLowerCase().includes('email already'))) {
          errorMessage = 'Email already verified. Please log in.'
        }
        
        return { success: false, error: errorMessage }
      }

      // Success response - message is optional
      const data = await response.json().catch(() => ({}))
      return { success: true, message: data.message || 'New OTP sent to your email' }
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error)
      return { success: false, error: error.message || 'Failed to resend OTP. Please try again.' }
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
        user.value = normalizeUser(await profileRes.json())
        writeCachedUser(user.value)
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

  const logout = async (opts?: { redirectTo?: string }) => {
    const redirectTo = opts?.redirectTo ?? '/login'
    // Capture token before wipe so we can still revoke server-side
    const previousToken = token.value
    const authHeaders =
      previousToken && previousToken !== 'undefined' && previousToken !== 'null'
        ? {
            Authorization: `Bearer ${
              previousToken.startsWith('Bearer ') ? previousToken.substring(7) : previousToken
            }`,
          }
        : undefined

    // Clear client session first so protected UI cannot linger with a half-logged-out state
    clearAuthStorage()

    // Best-effort server revoke — never block leaving the app
    if (authHeaders) {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
      const timeoutId = controller
        ? window.setTimeout(() => controller.abort(), 3000)
        : null
      try {
        await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          headers: authHeaders,
          ...(controller ? { signal: controller.signal } : {}),
        })
      } catch {
        /* discard client token even if revoke fails / times out */
      } finally {
        if (timeoutId != null) window.clearTimeout(timeoutId)
      }
    }

    // Hard navigation: router.push can fail to leave a mounted Settings shell
    if (typeof window !== 'undefined') {
      window.location.assign(redirectTo)
    }
  }

  const checkAuth = async () => {
    // Share one in-flight /me check across Dashboard/Stats/Checklists/router
    if (authCheckPromise) {
      console.log('⏸️ Auth check already in progress, joining in-flight promise')
      return authCheckPromise
    }

    console.log('🔍 checkAuth called')
    console.log('Token exists:', !!token.value)
    console.log('Token value:', token.value)

    if (!token.value || token.value === 'undefined' || token.value === 'null') {
      console.log('❌ No valid token found')
      return false
    }

    authCheckInProgress = true
    authCheckPromise = (async () => {
      try {
        const authHeaders = getAuthHeader()
        console.log('🔗 Making auth check request to:', `${API_BASE}/me`)
        console.log('📋 Headers:', authHeaders)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(`${API_BASE}/me`, {
          ...(authHeaders ? { headers: authHeaders } : {}),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        console.log('📡 Response status:', response.status)
        console.log('📡 Response ok:', response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.log('❌ Auth check failed:', response.status, errorText)
          if (response.status === 401 || response.status === 403) {
            console.log('🚪 Token is invalid, clearing auth state')
            user.value = null
            token.value = null
            localStorage.removeItem('tapeout_token')
            writeCachedUser(null)
          }
          return false
        }

        const userData = await response.json()
        console.log('✅ Auth check successful, user data:', userData)
        user.value = normalizeUser(userData)
        writeCachedUser(user.value)
        console.log('🔑 is_superuser normalized:', user.value?.is_superuser)
        return true
      } catch (error: any) {
        console.log('💥 Auth check error:', error)
        if (error.name === 'AbortError') {
          console.log('⏱️ Auth check timed out after 5 seconds')
        }
        console.log('⚠️ Network or other error during auth check - not clearing token')
        return false
      } finally {
        authCheckInProgress = false
        authCheckPromise = null
      }
    })()

    return authCheckPromise
  }

  /** Update profile photo everywhere that reads authStore.user.avatar */
  const setUserAvatar = (url: string) => {
    if (!user.value) return
    const next = url.trim()
    user.value = {
      ...user.value,
      avatar: next || undefined,
      avatar_url: next || undefined,
    }
    writeCachedUser(user.value)
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
  // DISABLED: Don't auto-initialize on store creation to prevent repeated failed requests
  // Components should call initializeAuth() explicitly when needed
  // if (token.value && token.value !== 'undefined' && token.value !== 'null' && !user.value) {
  //   setTimeout(() => {
  //     initializeAuth().catch(err => {
  //       console.error('⚠️ Auth initialization failed:', err)
  //     })
  //   }, 100) // Delay to ensure app loads first
  // }
  
  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isSuperuser,
    canManageDataTransfer,
    login,
    verifyMfa,
    loginWithGoogle,
    logout,
    checkAuth,
    getAuthHeader,
    initializeAuth,
    setUserAvatar,
    verifyEmail,
    resendOTP
  }
}) 