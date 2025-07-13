import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

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

export const useChecklistsStore = defineStore('checklists', () => {
  const list = ref<Checklist[]>([])
  const details = ref<Checklist | null>(null)
  const loading = ref(false)
  const error = ref('')
  const authStore = useAuthStore()

  // 1. List all templates
  async function fetchTemplates() {
    loading.value = true
    error.value = ''
    try {
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const res = await fetch('/api/v1/checklists/templates', { headers })
      if (!res.ok) throw new Error('Failed to fetch templates')
      list.value = await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch templates'
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
      const headers = {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
      
      const res = await fetch('/api/v1/checklists/templates', {
        method: 'POST',
        headers,
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
      const headers = {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
      
      const res = await fetch(`/api/v1/checklists/templates/${templateId}/items`, {
        method: 'POST',
        headers,
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
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const res = await fetch(`/api/v1/checklists/templates/${templateId}/items`, { headers })
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
      const headers = {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
      
      const res = await fetch('/api/v1/checklists/active', {
        method: 'POST',
        headers,
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
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const res = await fetch('/api/v1/checklists/active', { headers })
      if (!res.ok) throw new Error('Failed to fetch active checklists')
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
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const res = await fetch(`/api/v1/checklists/active/${checklistId}/items`, { headers })
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
      const headers = {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      }
      
      const res = await fetch(`/api/v1/checklists/active/${checklistId}/items/${itemId}`, {
        method: 'PATCH',
        headers,
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
      
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      
      const res = await fetch(`/api/v1/checklists/active/${checklistId}/items/${itemId}/evidence`, {
        method: 'POST',
        headers,
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
      const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      const res = await fetch(`/api/v1/checklists/active/${checklistId}/completion`, { headers })
      if (!res.ok) throw new Error('Failed to fetch checklist completion')
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch checklist completion'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    list,
    details,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    addItemToTemplate,
    fetchTemplateItems,
    createActiveChecklist,
    fetchActiveChecklists,
    fetchActiveChecklistItems,
    updateActiveChecklistItem,
    uploadEvidence,
    fetchChecklistCompletion
  }
}) 