import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'lead' | 'engineer' | 'manager'
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('tapeout_token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        role: 'lead'
      }
      
      const mockToken = 'mock_jwt_token_' + Date.now()
      
      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('tapeout_token', mockToken)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Invalid credentials' }
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async () => {
    isLoading.value = true
    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock Google user data
      const mockUser: User = {
        id: '2',
        email: 'john.doe@gmail.com',
        name: 'John Doe',
        role: 'lead',
        avatar: 'https://via.placeholder.com/40'
      }
      
      const mockToken = 'mock_google_token_' + Date.now()
      
      user.value = mockUser
      token.value = mockToken
      localStorage.setItem('tapeout_token', mockToken)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Google login failed' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('tapeout_token')
  }

  const checkAuth = async () => {
    if (!token.value) return false
    
    try {
      // Simulate token validation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock user data for demo
      user.value = {
        id: '1',
        email: 'john.doe@company.com',
        name: 'John Doe',
        role: 'lead'
      }
      
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
    checkAuth
  }
}) 