import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface Specification {
  id: string
  name: string
  file_name?: string
  version: string
  description?: string
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Updated After Rejection' | 'Archived'
  uploaded_by: string
  uploaded_on: string
  assigned_to?: string
  reviewerName?: string
  mime_type?: string
  file_type?: string
  type?: string
  file_size?: number
  created_at?: string
  updated_at?: string
}

export interface SpecificationFilters {
  status?: string
  assigned_to?: string
  uploaded_by?: string
  file_type?: string
  date_from?: string
  date_to?: string
  sort_by?: 'name' | 'uploaded_on' | 'status' | 'assigned_to' | 'uploaded_by'
  sort_order?: 'asc' | 'desc'
}

export const useSpecificationsStore = defineStore('specifications', () => {
  const specifications = ref<Specification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  // Filter states
  const filters = ref<SpecificationFilters>({
    status: '',
    assigned_to: '',
    uploaded_by: '',
    file_type: '',
    date_from: '',
    date_to: '',
    sort_by: 'uploaded_on',
    sort_order: 'desc'
  })

  const API_BASE = 'http://localhost:8000/api/v1/specifications'

  // Computed properties for filter options
  const statusOptions = computed(() => {
    const statuses = [...new Set(specifications.value.map(spec => spec.status))]
    return ['All Status', ...statuses]
  })

  const assignedToOptions = computed(() => {
    const assignees = [...new Set(specifications.value.map(spec => spec.assigned_to).filter(Boolean))]
    return ['All Assignees', ...assignees]
  })

  const uploadedByOptions = computed(() => {
    const uploaders = [...new Set(specifications.value.map(spec => spec.uploaded_by))]
    return ['All Uploaders', ...uploaders]
  })

  const fileTypeOptions = computed(() => {
    const fileTypes = [...new Set(specifications.value.map(spec => 
      spec.mime_type || spec.file_type || spec.type
    ).filter(Boolean))]
    return ['All File Types', ...fileTypes]
  })

  const sortOptions = computed(() => [
    { value: 'name', label: 'Name' },
    { value: 'uploaded_on', label: 'Upload Date' },
    { value: 'status', label: 'Status' },
    { value: 'assigned_to', label: 'Assigned To' },
    { value: 'uploaded_by', label: 'Uploaded By' }
  ])

  // Load all specifications with filters
  const loadSpecifications = async (customFilters?: Partial<SpecificationFilters>) => {
    loading.value = true
    error.value = null
    try {
      const activeFilters = { ...filters.value, ...customFilters }
      const params = new URLSearchParams()

      // Add filter parameters
      if (activeFilters.status && activeFilters.status !== 'All Status') {
        params.append('status', activeFilters.status)
      }
      if (activeFilters.assigned_to && activeFilters.assigned_to !== 'All Assignees') {
        params.append('assigned_to', activeFilters.assigned_to)
      }
      if (activeFilters.uploaded_by && activeFilters.uploaded_by !== 'All Uploaders') {
        params.append('uploaded_by', activeFilters.uploaded_by)
      }
      if (activeFilters.file_type && activeFilters.file_type !== 'All File Types') {
        params.append('file_type', activeFilters.file_type)
      }
      if (activeFilters.date_from) {
        params.append('date_from', activeFilters.date_from)
      }
      if (activeFilters.date_to) {
        params.append('date_to', activeFilters.date_to)
      }
      if (activeFilters.sort_by) {
        params.append('sort_by', activeFilters.sort_by)
      }
      if (activeFilters.sort_order) {
        params.append('sort_order', activeFilters.sort_order)
      }

      const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined

      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to load specifications')
      }
      
      const data = await response.json()
      specifications.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err.message || 'Failed to load specifications'
      console.error('Error loading specifications:', err)
    } finally {
      loading.value = false
    }
  }

  // Update filters and reload
  const updateFilters = async (newFilters: Partial<SpecificationFilters>) => {
    Object.assign(filters.value, newFilters)
    await loadSpecifications()
  }

  // Reset all filters
  const resetFilters = async () => {
    filters.value = {
      status: '',
      assigned_to: '',
      uploaded_by: '',
      file_type: '',
      date_from: '',
      date_to: '',
      sort_by: 'uploaded_on',
      sort_order: 'desc'
    }
    await loadSpecifications()
  }

  // Get single specification
  const getSpecification = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const response = await fetch(`${API_BASE}/${id}`, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to load specification')
      }
      
      return await response.json()
    } catch (err: any) {
      error.value = err.message || 'Failed to load specification'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new specification
  const createSpecification = async (formData: FormData) => {
    loading.value = true
    error.value = null
    try {
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const response = await fetch(`${API_BASE}/upload-spec`, {
        method: 'POST',
        headers,
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create specification')
      }
      
      const newSpec = await response.json()
      await loadSpecifications() // Reload to get updated list
      return newSpec
    } catch (err: any) {
      error.value = err.message || 'Failed to create specification'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update specification status
  const updateSpecificationStatus = async (id: string, status: 'approved' | 'rejected') => {
    loading.value = true
    error.value = null
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject'
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const response = await fetch(`${API_BASE}/${id}/${endpoint}`, {
        method: 'POST',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to update specification status')
      }
      
      await loadSpecifications() // Reload to get updated list
    } catch (err: any) {
      error.value = err.message || 'Failed to update specification status'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Download specification
  const downloadSpecification = async (id: string) => {
    try {
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const response = await fetch(`${API_BASE}/${id}/download`, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to download specification')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '' // Let backend set filename via headers
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.message || 'Failed to download specification'
      throw err
    }
  }

  // Delete specification
  const deleteSpecification = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers
      })
      
      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete specification')
      }
      
      // Remove from local list
      specifications.value = specifications.value.filter(spec => spec.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete specification'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get status options from API
  const fetchStatusOptions = async () => {
    try {
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const response = await fetch(`${API_BASE}/statuses`, { headers })
      if (response.ok) {
        return await response.json()
      }
    } catch (err) {
      console.error('Failed to fetch status options:', err)
    }
    return []
  }

  return {
    // State
    specifications,
    loading,
    error,
    filters,
    
    // Computed
    statusOptions,
    assignedToOptions,
    uploadedByOptions,
    fileTypeOptions,
    sortOptions,
    
    // Actions
    loadSpecifications,
    updateFilters,
    resetFilters,
    getSpecification,
    createSpecification,
    updateSpecificationStatus,
    downloadSpecification,
    deleteSpecification,
    fetchStatusOptions
  }
}) 