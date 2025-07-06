import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChecklistItem {
  text: string
  required: boolean
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

  // 1. List all checklists
  async function fetchList() {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch('http://localhost:8000/api/v1/checklists/')
      if (!res.ok) throw new Error('Failed to fetch checklists')
      list.value = await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch checklists'
    } finally {
      loading.value = false
    }
  }

  // 2. Create a new checklist/template
  async function createChecklist(data: Partial<Checklist>) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch('http://localhost:8000/api/v1/checklists/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to create checklist')
      await fetchList()
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to create checklist'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 3. Get checklist details
  async function fetchDetails(id: number | string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`http://localhost:8000/api/v1/checklists/${id}`)
      if (!res.ok) throw new Error('Failed to fetch checklist details')
      details.value = await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch checklist details'
    } finally {
      loading.value = false
    }
  }

  // 4. Update checklist/template
  async function updateChecklist(id: number | string, data: Partial<Checklist>) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`http://localhost:8000/api/v1/checklists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update checklist')
      await fetchList()
      return await res.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to update checklist'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 5. Delete checklist/template
  async function deleteChecklist(id: number | string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`http://localhost:8000/api/v1/checklists/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete checklist')
      await fetchList()
    } catch (e: any) {
      error.value = e.message || 'Failed to delete checklist'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 6. Assign checklist
  async function assignChecklist(id: number | string, userId: number | string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`http://localhost:8000/api/v1/checklists/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      if (!res.ok) throw new Error('Failed to assign checklist')
      await fetchDetails(id)
    } catch (e: any) {
      error.value = e.message || 'Failed to assign checklist'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 7. Approve checklist
  async function approveChecklist(id: number | string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`http://localhost:8000/api/v1/checklists/${id}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to approve checklist')
      await fetchDetails(id)
    } catch (e: any) {
      error.value = e.message || 'Failed to approve checklist'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 8. Export checklist
  async function exportChecklist(id: number | string) {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`http://localhost:8000/api/v1/checklists/${id}/export`)
      if (!res.ok) throw new Error('Failed to export checklist')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `checklist-${id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      error.value = e.message || 'Failed to export checklist'
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
    fetchList,
    createChecklist,
    fetchDetails,
    updateChecklist,
    deleteChecklist,
    assignChecklist,
    approveChecklist,
    exportChecklist
  }
}) 