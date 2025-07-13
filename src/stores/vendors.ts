import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useAuthStore } from './auth'

export interface Vendor {
  id: string
  name: string
  type: string
  status: 'active' | 'pending' | 'inactive'
  nda_url?: string
  linked_specs?: string[]
  linked_checklists?: string[]
  // Add more fields as needed
}

export interface VendorActivity {
  id: string
  message: string
  time: string
}

export const useVendorsStore = defineStore('vendors', () => {
  const vendors: Ref<Vendor[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  const API_BASE = '/api/v1/vendors/'

  // List all vendors
  const fetchVendors = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(API_BASE, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      if (!res.ok) throw new Error('Failed to load vendors')
      vendors.value = await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to load vendors'
    } finally {
      loading.value = false
    }
  }

  // Create a new vendor
  const createVendor = async (data: { name: string; type: string; status: string }) => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create vendor')
      const newVendor = await res.json()
      vendors.value.push(newVendor)
      return newVendor
    } catch (e: any) {
      error.value = e.message || 'Failed to create vendor'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Get vendor details
  const getVendor = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}${id}`, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      if (!res.ok) throw new Error('Failed to fetch vendor details')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch vendor details'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update vendor
  const updateVendor = async (id: string, data: { name: string; type: string; status: string }) => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update vendor')
      const updatedVendor = await res.json()
      const idx = vendors.value.findIndex(v => v.id === updatedVendor.id)
      if (idx !== -1) vendors.value[idx] = updatedVendor
      return updatedVendor
    } catch (e: any) {
      error.value = e.message || 'Failed to update vendor'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Delete vendor
  const deleteVendor = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}${id}`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      if (!res.ok) throw new Error('Failed to delete vendor')
      vendors.value = vendors.value.filter(v => v.id !== id)
    } catch (e: any) {
      error.value = e.message || 'Failed to delete vendor'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Upload NDA/contract
  const uploadNDA = async (id: string, file: File) => {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}${id}/nda`, {
        method: 'POST',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined,
        body: formData
      })
      if (!res.ok) throw new Error('Failed to upload NDA')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to upload NDA'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Get vendor timeline
  const fetchTimeline = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}${id}/timeline`, {
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
      if (!res.ok) throw new Error('Failed to fetch timeline')
      return await res.json() as VendorActivity[]
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch timeline'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Acknowledge spec/document
  const acknowledge = async (id: string, payload: any) => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}${id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to acknowledge')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to acknowledge'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    vendors,
    loading,
    error,
    fetchVendors,
    createVendor,
    getVendor,
    updateVendor,
    deleteVendor,
    uploadNDA,
    fetchTimeline,
    acknowledge
  }
}) 