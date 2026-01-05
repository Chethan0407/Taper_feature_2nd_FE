import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { authenticatedFetch } from '@/utils/auth-requests'

export interface ChecklistItem {
  id?: number
  title: string
  description: string
  order: number
  required?: boolean
}

export interface Checklist {
  id: number
  name: string
  description?: string
  items: ChecklistItem[]
  status?: string
  created_by?: any
  assigned_to?: any[]
  created_at?: string
  updated_at?: string
  is_template?: boolean
}

export interface ChecklistStats {
  total_templates: number
  active_checklists: number
  approved_checklists: number
  avg_completion_rate: number
}

export const useChecklistsStore = defineStore('checklists', () => {
  const list = ref<Checklist[]>([])
  const details = ref<Checklist | null>(null)
  const loading = ref(false)
  const error = ref('')
  const stats = ref<ChecklistStats | null>(null)
  const statsLoading = ref(false)
  const statsError = ref('')
  const authStore = useAuthStore()

  // 1. List all templates
  async function fetchTemplates() {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch('/api/v1/checklists/templates')
      
      // Clone the response to avoid consuming it multiple times
      const responseClone = res.clone()
      
      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to fetch templates'
        try {
          const errorData = await responseClone.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          const errorText = await responseClone.text().catch(() => '')
          if (errorText) errorMessage = errorText
        }
        
        // Check if it's an authentication error
        if (res.status === 401) {
          errorMessage = 'Authentication required. Please log in again.'
        }
        
        throw new Error(errorMessage)
      }
      
      // Parse the response JSON
      const data = await res.json()
      console.log('📋 Templates API Response:', data)
      console.log('📋 Templates API Response Type:', typeof data, 'Is Array:', Array.isArray(data))
      console.log('📋 Templates API Response Keys:', data ? Object.keys(data) : 'null/undefined')
      
      // Handle different response formats:
      // 1. Direct array: [{...}, {...}]
      // 2. Object with items array: {items: [...]} - items are checklist items, not templates
      // 3. Single template object: {name: "...", id: ..., items: [...]}
      // 4. Object with templates array: {templates: [...]} or {results: [...]}
      let templates: any[] = []
      
      if (Array.isArray(data)) {
        // Response is an array of templates (expected format after backend fix)
        // Each template should have: {id, name, created_by, items: [...]}
        templates = data
        console.log('✅ Response is an array with', templates.length, 'templates')
        
        // Verify each template has the expected structure and items
        templates.forEach((template, index) => {
          if (template.items && Array.isArray(template.items)) {
            console.log(`✅ Template ${index + 1} (${template.name || template.id}) has ${template.items.length} items`)
          } else {
            console.warn(`⚠️ Template ${index + 1} (${template.name || template.id}) has no items array`)
          }
        })
      } else if (data && typeof data === 'object' && data !== null) {
        // Check for common array properties
        if (data.templates && Array.isArray(data.templates)) {
          // Response has templates array
          templates = data.templates
          console.log('✅ Response has templates array with', templates.length, 'templates')
        } else if (data.results && Array.isArray(data.results)) {
          // Response has results array
          templates = data.results
          console.log('✅ Response has results array with', templates.length, 'templates')
        } else if (data.items && Array.isArray(data.items)) {
          // Check if this is a template object with items inside
          if (data.id || data.name || data.created_by) {
            // It's a single template object with items array inside
            templates = [data]
            console.log('✅ Response is a single template object with items array inside')
          } else {
            // Response only has items array - check if items might be templates
            // If we're on the templates endpoint, items with title/order might actually be templates
            // But typically templates have name, not title
            const firstItem = data.items[0]
            if (firstItem && (firstItem.name || firstItem.created_by)) {
              // Items appear to be templates (have name or created_by)
              templates = data.items
              console.log('✅ Response has items array that are templates, count:', templates.length)
          } else {
            // Items have title/order - these are checklist items, not templates
            // But if we're on the templates endpoint and only get items, 
            // it might be a template response missing metadata
            // Check if there are other properties that indicate it's a template
            if (data.id && (data.name || data.created_by)) {
              // It has template metadata, treat as template
              templates = [data]
              console.log('✅ Response is a template object with items (metadata found)')
            } else if (data.items && data.items.length > 0) {
              // Only items array - this is likely a template but missing wrapper
              // Create a template wrapper from the items
              // Use the first item's created_at or a generated ID
              const firstItem = data.items[0]
              templates = [{
                id: data.id || firstItem?.id || Date.now(),
                name: data.name || firstItem?.title || 'Template',
                items: data.items,
                created_by: data.created_by || null,
                created_at: data.created_at || firstItem?.created_at || new Date().toISOString()
              }]
              console.log('⚠️ Response has items but no template metadata. Created template wrapper from items.')
            } else {
              console.warn('⚠️ Response has empty or missing items array. No templates found.')
              templates = []
            }
          }
          }
        } else if (data.id || data.name || data.created_by) {
          // It's a single template object, wrap it in array
          templates = [data]
          console.log('✅ Response is a single template object, wrapped in array')
        } else {
          // Unknown structure, log and use empty array
          console.warn('⚠️ Unexpected response format:', data, 'Type:', typeof data, 'Keys:', Object.keys(data))
          templates = []
        }
      } else {
        // If it's something else, log and use empty array
        console.warn('⚠️ Unexpected response format:', data, 'Type:', typeof data)
        templates = []
      }
      
      // Map templates to ensure they have required fields
      const processedTemplates = templates
        .filter(t => t != null) // Remove any null/undefined entries
        .map((t: any) => ({
          ...t,
          name: t.name || t.title || `Template ${t.id}` || 'Unnamed Template',
          id: t.id || t.template_id || `temp-${Date.now()}`
        }))
      
      // Update the store
      list.value = processedTemplates
      
      console.log('✅ Processed templates:', processedTemplates)
      console.log('✅ Templates count:', processedTemplates.length)
      console.log('✅ Store list.value length:', list.value.length)
      
      // Verify the store was updated
      if (list.value.length === 0 && templates.length > 0) {
        console.error('❌ CRITICAL: Templates were processed but store is empty!', {
          processedCount: processedTemplates.length,
          storeCount: list.value.length,
          templates: templates
        })
      }
    } catch (e: any) {
      console.error('❌ Error fetching templates:', e)
      error.value = e.message || 'Failed to fetch templates'
      // Clear the list on error to avoid showing stale data
      list.value = []
    } finally {
      loading.value = false
    }
  }
  
  // 2. Create a new template
  async function createTemplate(data: {
    name: string
    description?: string
    created_by: string | number
    items?: Array<{
      title: string
      description: string
      order: number
    }>
  }) {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch('/api/v1/checklists/templates', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to create template')
      }
      
      const createdTemplate = await res.json()
      await fetchTemplates() // Refresh the list
      return createdTemplate
    } catch (e: any) {
      error.value = e.message || 'Failed to create template'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 3. Add item to template
  async function addItemToTemplate(templateId: string | number, item: any) {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch(`/api/v1/checklists/templates/${templateId}/items/`, {
        method: 'POST',
        body: JSON.stringify(item)
      })
      if (!res.ok) throw new Error('Failed to add item to template')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to add item to template'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 4. Get items of a template
  async function fetchTemplateItems(templateId: string | number) {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch(`/api/v1/checklists/templates/${templateId}/items/`)
      if (!res.ok) throw new Error('Failed to fetch template items')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch template items'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 5. Create active checklist from template
  async function createActiveChecklist(data: any) {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch('/api/v1/checklists/active', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create active checklist')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to create active checklist'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 6. List all active checklists
  async function fetchActiveChecklists() {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch('/api/v1/checklists/active')
      if (!res.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to fetch active checklists'
        try {
          const errorData = await res.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          const errorText = await res.text().catch(() => '')
          if (errorText) errorMessage = errorText
        }
        
        // Check if it's an authentication error
        if (res.status === 401) {
          errorMessage = 'Authentication required. Please log in again.'
        }
        
        throw new Error(errorMessage)
      }
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch active checklists'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 7. Get items in an active checklist
  async function fetchActiveChecklistItems(checklistId: string | number) {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch(`/api/v1/checklists/active/${checklistId}/items/`)
      if (!res.ok) throw new Error('Failed to fetch active checklist items')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch active checklist items'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 8. Update an active checklist item
  async function updateActiveChecklistItem(checklistId: string | number, itemId: string | number, data: any) {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch(`/api/v1/checklists/active/${checklistId}/items/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update active checklist item')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to update active checklist item'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 9. Upload evidence for an item
  async function uploadEvidence(checklistId: string | number, itemId: string | number, file: File) {
    loading.value = true
    error.value = ''
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await authenticatedFetch(`/api/v1/checklists/active/${checklistId}/items/${itemId}/evidence/`, {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('Failed to upload evidence')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to upload evidence'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // 10. Get checklist completion percent
  async function fetchChecklistCompletion(checklistId: string | number) {
    loading.value = true
    error.value = ''
    try {
      const res = await authenticatedFetch(`/api/v1/checklists/active/${checklistId}/completion/`)
      if (!res.ok) throw new Error('Failed to fetch checklist completion')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch checklist completion'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 11. Get checklist statistics
  async function fetchStats() {
    statsLoading.value = true
    statsError.value = ''
    try {
      const res = await authenticatedFetch('/api/v1/checklists/stats')
      
      if (!res.ok) {
        let errorMessage = 'Failed to fetch checklist statistics'
        try {
          const errorData = await res.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          const errorText = await res.text().catch(() => '')
          if (errorText) errorMessage = errorText
        }
        
        if (res.status === 401) {
          errorMessage = 'Authentication required. Please log in again.'
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await res.json()
      stats.value = {
        total_templates: data.total_templates || 0,
        active_checklists: data.active_checklists || 0,
        approved_checklists: data.approved_checklists || 0,
        avg_completion_rate: data.avg_completion_rate || 0.0
      }
      
      return stats.value
    } catch (e: any) {
      statsError.value = e.message || 'Failed to fetch checklist statistics'
      throw e
    } finally {
      statsLoading.value = false
    }
  }

  return {
    list,
    details,
    loading,
    error,
    stats,
    statsLoading,
    statsError,
    fetchTemplates,
    createTemplate,
    addItemToTemplate,
    fetchTemplateItems,
    createActiveChecklist,
    fetchActiveChecklists,
    fetchActiveChecklistItems,
    updateActiveChecklistItem,
    uploadEvidence,
    fetchChecklistCompletion,
    fetchStats
  }
}) 