import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  applyBrandTheme,
  DEFAULT_BRAND_PRIMARY,
  DEFAULT_BRAND_SECONDARY,
} from '@/utils/brand-theme'

export const useBrandingStore = defineStore('branding', () => {
  const logo_url = ref('')
  const company_name = ref('')
  const brand_color = ref(DEFAULT_BRAND_PRIMARY)
  const primary_color = ref(DEFAULT_BRAND_PRIMARY)
  const secondary_color = ref(DEFAULT_BRAND_SECONDARY)
  const loading = ref(false)
  const error = ref('')

  const syncTheme = () => {
    applyBrandTheme({
      primary_color: primary_color.value,
      secondary_color: secondary_color.value,
      brand_color: brand_color.value,
    })
  }

  // Fetch branding info
  const fetchBranding = async () => {
    loading.value = true
    error.value = ''
    try {
      const authStore = useAuthStore()
      const headers = authStore.token ? { Authorization: `Bearer ${authStore.token}` } : undefined
      const res = await fetch('/api/v1/settings/branding/', { headers })
      if (!res.ok) throw new Error('Failed to fetch branding')
      const data = await res.json()
      logo_url.value = data.logo_url || ''
      company_name.value = data.company_name || ''
      brand_color.value = data.brand_color || data.primary_color || DEFAULT_BRAND_PRIMARY
      primary_color.value = data.primary_color || data.brand_color || DEFAULT_BRAND_PRIMARY
      secondary_color.value = data.secondary_color || DEFAULT_BRAND_SECONDARY
      syncTheme()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch branding'
      // Keep defaults applied so UI still has consistent accents
      syncTheme()
    } finally {
      loading.value = false
    }
  }

  // Update branding info
  const updateBranding = async (payload: {
    company_name?: string
    logo_url?: string
    brand_color?: string
    primary_color?: string
    secondary_color?: string
  }) => {
    loading.value = true
    error.value = ''
    try {
      const authStore = useAuthStore()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }
      const body = {
        ...payload,
        brand_color: payload.brand_color || payload.primary_color,
      }
      const res = await fetch('/api/v1/settings/branding/', {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to update branding')

      // Optimistic local apply so accents update before refetch
      if (payload.primary_color) {
        primary_color.value = payload.primary_color
        brand_color.value = payload.primary_color
      }
      if (payload.secondary_color) secondary_color.value = payload.secondary_color
      if (payload.logo_url != null) logo_url.value = payload.logo_url
      if (payload.company_name != null) company_name.value = payload.company_name
      syncTheme()

      await fetchBranding()
    } catch (e: any) {
      error.value = e.message || 'Failed to update branding'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    logo_url,
    company_name,
    brand_color,
    primary_color,
    secondary_color,
    loading,
    error,
    fetchBranding,
    updateBranding,
    syncTheme,
  }
})
