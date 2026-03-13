import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const TOKEN_KEY = 'tapeout_admin_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))

  const isAuthenticated = computed(() => {
    const t = token.value
    return !!t && t !== 'undefined' && t !== 'null' && t.trim() !== ''
  })

  function setToken(t: string | null) {
    token.value = t
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  }

  function logout() {
    setToken(null)
  }

  return { token, isAuthenticated, setToken, logout }
})
