<template>
  <div class="min-h-screen bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Checklists</h1>
          <p class="text-gray-400">Build, reuse and sign-off tapeout checklists</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Checklist Templates -->
          <div class="lg:col-span-2">
            <div class="card">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-white">Checklist Templates</h2>
                <button class="btn-primary">Create Template</button>
              </div>
              
              <div class="space-y-4">
                <div v-for="template in templates" :key="template.id" class="p-4 bg-dark-800 rounded-lg border border-dark-600">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium text-white">{{ template.name }}</h3>
                      <p class="text-sm text-gray-400">{{ template.items }} items • {{ template.category }}</p>
                    </div>
                    <button class="btn-secondary">Use Template</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Checklists -->
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">Active Checklists</h2>
            <div class="space-y-4">
              <div v-for="checklist in activeChecklists" :key="checklist.id" class="p-4 bg-dark-800 rounded-lg border border-dark-600">
                <h3 class="font-medium text-white mb-2">{{ checklist.name }}</h3>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-400">{{ checklist.progress }}/{{ checklist.total }} completed</span>
                  <span :class="getProgressClass(checklist.progress, checklist.total)" class="px-2 py-1 rounded text-xs">
                    {{ Math.round((checklist.progress / checklist.total) * 100) }}%
                  </span>
                </div>
                <button class="btn-secondary" @click="approveChecklist(checklist.id)">Approve</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Template {
  id: string
  name: string
  items: number
  category: string
}

interface Checklist {
  id: string
  name: string
  progress: number
  total: number
}

const templates = ref<Template[]>([])
const activeChecklists = ref<Checklist[]>([])
const approving = ref<string | null>(null)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const authStore = useAuthStore()

// Add modal and state for create/update
const showChecklistModal = ref(false)
const editingChecklist = ref<Checklist | null>(null)
const checklistForm = ref({ name: '', progress: 0, total: 0 })
const deleting = ref<string | null>(null)
const exporting = ref<string | null>(null)
const assigning = ref<string | null>(null)
const checklistDetails = ref<Checklist | null>(null)

onMounted(async () => {
  const templatesRes = await fetch('/api/v1/checklists/templates')
  if (templatesRes.ok) {
    templates.value = await templatesRes.json()
  }
  const activeRes = await fetch('/api/v1/checklists/')
  if (activeRes.ok) {
    activeChecklists.value = await activeRes.json()
  }
})

const getProgressClass = (progress: number, total: number) => {
  const percentage = (progress / total) * 100
  if (percentage >= 80) return 'bg-green-500/20 text-green-400'
  if (percentage >= 50) return 'bg-yellow-500/20 text-yellow-400'
  return 'bg-red-500/20 text-red-400'
}

const approveChecklist = async (id: string) => {
  approving.value = id
  try {
    const res = await fetch(`/api/v1/checklists/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error('Approval failed')
    toast.value = { message: 'Checklist approved!', type: 'success' }
    // Optionally refresh list
    const activeRes = await fetch('/api/v1/checklists/')
    if (activeRes.ok) {
      activeChecklists.value = await activeRes.json()
    }
  } catch (e) {
    toast.value = { message: 'Approval failed', type: 'error' }
  } finally {
    approving.value = null
    setTimeout(() => { toast.value = null }, 2000)
  }
}

const openCreateModal = () => {
  editingChecklist.value = null
  checklistForm.value = { name: '', progress: 0, total: 0 }
  showChecklistModal.value = true
}
const openEditModal = (checklist: Checklist) => {
  editingChecklist.value = checklist
  checklistForm.value = { ...checklist }
  showChecklistModal.value = true
}
const closeChecklistModal = () => {
  showChecklistModal.value = false
}
const saveChecklist = async () => {
  if (editingChecklist.value) {
    // Update
    await fetch(`/api/v1/checklists/${editingChecklist.value.id}`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checklistForm.value)
    })
  } else {
    // Create
    await fetch('/api/v1/checklists/', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checklistForm.value)
    })
  }
  closeChecklistModal()
  const activeRes = await fetch('/api/v1/checklists/')
  if (activeRes.ok) activeChecklists.value = await activeRes.json()
}
const confirmDeleteChecklist = (id: string) => {
  deleting.value = id
}
const deleteChecklist = async (id: string) => {
  await fetch(`/api/v1/checklists/${id}`, { method: 'DELETE' })
  deleting.value = null
  const activeRes = await fetch('/api/v1/checklists/')
  if (activeRes.ok) activeChecklists.value = await activeRes.json()
}
const assignChecklist = async (id: string) => {
  assigning.value = id
  await fetch(`/api/v1/checklists/${id}/assign`, { method: 'POST' })
  assigning.value = null
}
const exportChecklist = async (id: string) => {
  exporting.value = id
  const res = await fetch(`/api/v1/checklists/${id}/export`)
  if (res.ok) {
    // Download logic here
  }
  exporting.value = null
}
const viewChecklistDetails = async (id: string) => {
  const res = await fetch(`/api/v1/checklists/${id}`)
  if (res.ok) checklistDetails.value = await res.json()
}
</script> 