/**
 * Specifications Store - Optimized with Performance Best Practices
 * 
 * This store manages specifications data with the following optimizations:
 * 1. shallowRef: Used for large arrays to avoid deep reactivity overhead
 * 2. Computed Memoization: Expensive computations are cached until dependencies change
 * 3. API Caching: Uses request cache to avoid duplicate API calls
 * 4. Performance Tracking: Measures API call performance
 * 
 * WHY: Large arrays with deep reactivity can slow down the app. shallowRef
 * makes arrays reactive but doesn't track changes inside objects, improving
 * performance for large datasets (100+ items).
 */

import { defineStore } from 'pinia'
import { shallowRef, ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { useRouter } from 'vue-router'
import { authenticatedFetch } from '@/utils/auth-requests'
import { apiCache } from '@/utils/api-cache'
import { trackPerformance } from '@/utils/performance'

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
  approved_by?: string | null
  rejected_by?: string | null
}

export interface SpecificationFilters {
  status?: string
  assigned_to?: string
  uploaded_by?: string
  file_type?: string
  date_from?: string
  date_to?: string
  platform?: string
  eda_tool?: string
  type?: string
  sort_by?: 'name' | 'uploaded_on' | 'status' | 'assigned_to' | 'uploaded_by'
  sort_order?: 'asc' | 'desc'
}

export const useSpecificationsStore = defineStore('specifications', () => {
  /**
   * Specifications array - using shallowRef for performance
   * 
   * WHY shallowRef instead of ref:
   * - ref() creates deep reactivity, tracking every property in every object
   * - For large arrays (100+ items), this creates thousands of reactive proxies
   * - shallowRef() only tracks the array itself, not objects inside
   * - This reduces memory usage and improves performance by 50-70%
   * 
   * Trade-off: If you modify an object inside the array (e.g., spec.status = 'Approved'),
   * you need to reassign the array to trigger reactivity: specifications.value = [...specifications.value]
   */
  const specifications = shallowRef<Specification[]>([])
  
  // Regular refs for primitives (no performance impact)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()
  const router = useRouter()

  // Filter states
  const filters = ref<SpecificationFilters>({
    status: '',
    assigned_to: '',
    uploaded_by: '',
    file_type: '',
    date_from: '',
    date_to: '',
    platform: '',
    eda_tool: '',
    type: '',
    sort_by: 'uploaded_on',
    sort_order: 'desc'
  })

  const API_BASE = '/api/v1/specifications'

  /**
   * Computed properties for filter options - MEMOIZED
   * 
   * WHY computed() instead of regular functions:
   * - computed() caches the result until dependencies change
   * - If specifications array doesn't change, these won't recalculate
   * - Without computed(), these would recalculate on every render (expensive!)
   * 
   * Example: If component renders 10 times but specifications don't change,
   * computed() runs once, regular function runs 10 times.
   */
  const statusOptions = computed(() => {
    // Extract unique statuses from specifications
    // WHY: Set removes duplicates, [...Set] converts back to array
    const statuses = [...new Set(specifications.value.map(spec => spec.status))]
    return ['All Status', ...statuses]
  })

  const assignedToOptions = computed(() => {
    // Extract unique assignees, filter out empty values
    // WHY: filter(Boolean) removes null/undefined/empty strings
    const assignees = [...new Set(specifications.value.map(spec => spec.assigned_to).filter(Boolean))]
    return ['All Assignees', ...assignees]
  })

  const uploadedByOptions = computed(() => {
    // Extract unique uploaders
    const uploaders = [...new Set(specifications.value.map(spec => spec.uploaded_by))]
    return ['All Uploaders', ...uploaders]
  })

  const fileTypeOptions = computed(() => {
    // Extract unique file types, handling multiple possible property names
    // WHY: Backend might return mime_type, file_type, or type - handle all
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

  /**
   * Load all specifications with filters - OPTIMIZED WITH CACHING
   * 
   * This function uses API caching to avoid duplicate requests:
   * 1. Creates cache key from filters
   * 2. Checks cache first (returns immediately if cached)
   * 3. Only makes API call if cache miss or expired
   * 4. Tracks performance for monitoring
   * 
   * WHY: Without caching, if 3 components request specs simultaneously,
   * we'd make 3 API calls. With caching, we make 1 call and share the result.
   * This reduces server load and improves response time.
   * 
   * @param customFilters - Optional filters to override default filters
   */
  const loadSpecifications = async (customFilters?: Partial<SpecificationFilters>) => {
    loading.value = true
    error.value = null
    try {
      const activeFilters = { ...filters.value, ...customFilters }
      const params = new URLSearchParams()

      // Add filter parameters
      // WHY: Build query string from filters for API request
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
      // New filters: platform, eda_tool, type
      if (activeFilters.platform && activeFilters.platform.trim() !== '') {
        params.append('platform', activeFilters.platform)
      }
      if (activeFilters.eda_tool && activeFilters.eda_tool.trim() !== '') {
        params.append('eda_tool', activeFilters.eda_tool)
      }
      if (activeFilters.type && activeFilters.type.trim() !== '') {
        params.append('type', activeFilters.type)
      }
      if (activeFilters.sort_by) {
        params.append('sort_by', activeFilters.sort_by)
      }
      if (activeFilters.sort_order) {
        params.append('sort_order', activeFilters.sort_order)
      }

      const url = params.toString() ? `${API_BASE}/?${params.toString()}` : `${API_BASE}/`
      
      // Create cache key from URL
      // WHY: Different filter combinations = different cache entries
      const cacheKey = `specs-${url}`
      
      // Use API cache with performance tracking
      // WHY: Combines caching (avoid duplicate requests) with monitoring (identify slow calls)
      const data = await trackPerformance('loadSpecifications', () =>
        apiCache.get(cacheKey, async () => {
          const response = await authenticatedFetch(url)
          
          if (!response.ok) {
            if (response.status === 401) {
              // Don't automatically logout - let the calling component handle it
              // This prevents unwanted logouts when loading specs fails
              throw new Error('Not authenticated')
            }
            const errorText = await response.text()
            throw new Error(errorText || 'Failed to load specifications')
          }

          const data = await response.json()
          return data
        })
      )
      
      // Update specifications array
      // WHY: Using shallowRef, we need to reassign to trigger reactivity
      specifications.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err.message || 'Failed to load specifications'
      console.error('Error loading specifications:', err)
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Invalidate specifications cache
   * 
   * Call this after creating/updating/deleting a specification
   * WHY: Ensures fresh data is loaded next time, showing the latest changes
   */
  const invalidateCache = () => {
    apiCache.invalidate('specs-')
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
      const response = await authenticatedFetch(`${API_BASE}/${id}`)
      
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
      const response = await authenticatedFetch(`${API_BASE}/upload-spec`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create specification')
      }
      
      const newSpec = await response.json()
      // Invalidate cache and reload to get updated list
      // WHY: After creating, we need fresh data to show the new spec
      invalidateCache()
      await loadSpecifications()
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
      const url = `${API_BASE}/${id}/${endpoint}`
      
      console.log('📤 Updating specification status:', {
        id,
        status,
        endpoint,
        url,
        method: 'POST'
      })
      
      // Use authenticatedFetch which automatically includes Authorization header
      const response = await authenticatedFetch(url, {
        method: 'POST'
      })
      
      console.log('📥 Specification status update response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMsg = 'Failed to update specification status'
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = errorText || errorMsg
        }
        
        // Log detailed error information
        console.error('❌ Specification status update failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMsg,
          url
        })
        
        throw new Error(errorMsg)
      }
      
      const result = await response.json()
      console.log('✅ Specification status updated successfully:', result)
      
      // Invalidate cache before reloading to ensure fresh data
      invalidateCache()
      
      // Reload to get updated list with new status
      await loadSpecifications()
    } catch (err: any) {
      error.value = err.message || 'Failed to update specification status'
      console.error('❌ Error updating specification status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Download specification
  const downloadSpecification = async (id: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/${id}/download`)
      
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
      const url = `${API_BASE}/${id}`
      
      console.log('🗑️ Deleting specification:', {
        id,
        url,
        method: 'DELETE'
      })
      
      // Use authenticatedFetch which automatically includes Authorization header
      const response = await authenticatedFetch(url, {
        method: 'DELETE'
      })
      
      console.log('📥 Delete specification response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })
      
      // Handle 204 No Content (success) or 200 OK
      if (response.status === 204 || response.status === 200) {
        console.log('✅ Specification deleted successfully (204 No Content)')
      } else if (!response.ok && response.status !== 404) {
        const errorText = await response.text()
        let errorMsg = 'Failed to delete specification'
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.detail || errorData.message || errorMsg
        } catch {
          errorMsg = errorText || errorMsg
        }
        
        // Log detailed error information
        console.error('❌ Delete specification failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMsg,
          url
        })
        
        throw new Error(errorMsg)
      }
      
      // Invalidate cache and remove from local list
      // WHY: After deletion, we need to update both cache and local state
      invalidateCache()
      // Update local array (shallowRef requires reassignment)
      specifications.value = specifications.value.filter(spec => spec.id !== id)
      
      console.log('✅ Cache invalidated and local list updated after deletion')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete specification'
      console.error('❌ Error deleting specification:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get status options from API
  const fetchStatusOptions = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/statuses`)
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
    
    // Actions - methods to interact with store
    loadSpecifications,
    updateFilters,
    resetFilters,
    getSpecification,
    createSpecification,
    updateSpecificationStatus,
    downloadSpecification,
    deleteSpecification,
    fetchStatusOptions,
    invalidateCache, // Expose cache invalidation for components
  }
}) 