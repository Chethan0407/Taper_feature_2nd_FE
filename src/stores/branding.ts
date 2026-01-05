import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useBrandingStore = defineStore('branding', () => {
  const logo_url = ref('')
  const company_name = ref('')
  const brand_color = ref('#1e293b')
  const primary_color = ref('#3B82F6')
  const secondary_color = ref('#8B5CF6')
  const loading = ref(false)
  const error = ref('')

  // Fetch branding info
  const fetchBranding = async () => {
    loading.value = true
    error.value = ''
    try {
      const authStore = useAuthStore()
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const res = await fetch('/api/v1/settings/branding/', { headers })
      if (!res.ok) throw new Error('Failed to fetch branding')
      const data = await res.json()
      logo_url.value = data.logo_url || ''
      company_name.value = data.company_name || ''
      brand_color.value = data.brand_color || data.primary_color || '#1e293b'
      primary_color.value = data.primary_color || '#3B82F6'
      secondary_color.value = data.secondary_color || '#8B5CF6'
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch branding'
    } finally {
      loading.value = false
    }
  }

  // Update branding info
  const updateBranding = async (payload: { company_name?: string; logo_url?: string; brand_color?: string }) => {
    loading.value = true
    error.value = ''
    try {
      const authStore = useAuthStore()
      const headers: any = { 'Content-Type': 'application/json' }
      if (authStore.token) {
        headers['Authorization'] = `Bearer ${authStore.token}`
      }
      const res = await fetch('/api/v1/settings/branding/', {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to update branding')
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
    updateBranding
  }
}) 