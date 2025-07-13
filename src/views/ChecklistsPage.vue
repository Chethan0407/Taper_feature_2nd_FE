<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Checklists</h1>
          <p class="text-gray-500 dark:text-gray-400">Build, reuse and sign-off tapeout checklists</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Checklist Templates -->
          <div class="lg:col-span-2">
            <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Checklist Templates</h2>
                <button class="btn-primary" @click="showCreateTemplateModal = true">Create Template</button>
              </div>
              
              <div v-if="checklistsStore.loading" class="text-center py-8">
                <div class="text-gray-500 dark:text-gray-400">Loading templates...</div>
              </div>
              
              <div v-else-if="checklistsStore.error" class="text-center py-8">
                <div class="text-red-500">{{ checklistsStore.error }}</div>
              </div>
              
              <div v-else-if="checklistsStore.list.length === 0" class="text-center py-8">
                <div class="text-gray-500 dark:text-gray-400">No templates found. Create your first template!</div>
              </div>
              
              <div v-else class="space-y-4">
                <div v-for="template in checklistsStore.list" :key="template.id" class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-medium text-gray-900 dark:text-white">{{ template.name }}</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ template.items?.length || 0 }} items
                        <span v-if="template.description">• {{ template.description }}</span>
                      </p>
                    </div>
                    <button class="btn-secondary" @click="useTemplate(template.id)">Use Template</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Checklists -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Active Checklists</h2>
            <div v-if="activeChecklistsLoading" class="text-center py-8">
              <div class="text-gray-500 dark:text-gray-400">Loading active checklists...</div>
            </div>
            <div v-else-if="activeChecklistsError" class="text-center py-8">
              <div class="text-red-500">{{ activeChecklistsError }}</div>
            </div>
            <div v-else-if="activeChecklists.length === 0" class="text-center py-8">
              <div class="text-gray-500 dark:text-gray-400">No active checklists found.</div>
            </div>
            <div v-else class="space-y-4">
              <div v-for="checklist in activeChecklists" :key="checklist.id" class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                <h3 class="font-medium text-gray-900 dark:text-white mb-2">{{ checklist.name }}</h3>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">
                    <template v-if="checklistCompletion[checklist.id]?.loading">
                      Loading progress...
                    </template>
                    <template v-else>
                      {{ checklistCompletion[checklist.id]?.progress }}/{{ checklistCompletion[checklist.id]?.total }} completed
                    </template>
                  </span>
                  <span :class="getProgressClass(checklistCompletion[checklist.id]?.percent || 0, 100)" class="px-2 py-1 rounded text-xs">
                    <template v-if="checklistCompletion[checklist.id]?.loading">
                      ...
                    </template>
                    <template v-else>
                      {{ checklistCompletion[checklist.id]?.percent ?? 0 }}%
                    </template>
                  </span>
                </div>
                <div class="mt-2 flex items-center gap-2">
                  <button 
                    class="btn-secondary" 
                    @click="approveChecklist(checklist.id)"
                    :disabled="approving === checklist.id || checklist.status === 'approved'"
                  >
                    {{ checklist.status === 'approved' ? 'Approved' : (approving === checklist.id ? 'Approving...' : 'Approve') }}
                  </button>
                  <span v-if="checklist.status === 'approved'" class="bg-green-500/20 text-green-500 px-3 py-1 rounded text-xs font-semibold ml-2">Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <CreateTemplateModal v-if="showCreateTemplateModal" @close="showCreateTemplateModal = false" @created="handleTemplateCreated" />
    </div>
    <div v-if="toast" :class="['fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-xl', toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white']">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChecklistsStore } from '@/stores/checklists'
import CreateTemplateModal from '@/components/Checklist/CreateTemplateModal.vue'

interface Checklist {
  id: string
  name: string
  progress: number
  total: number
  status?: string
}

const checklistsStore = useChecklistsStore()
const authStore = useAuthStore()

const activeChecklists = ref<Checklist[]>([])
const activeChecklistsLoading = ref(false)
const activeChecklistsError = ref('')
const approving = ref<string | null>(null)
const showCreateTemplateModal = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

// Store completion percentages for each checklist
const checklistCompletion = ref<Record<string, { progress: number; total: number; percent: number; loading: boolean }>>({})

const fetchTemplates = async () => {
  await checklistsStore.fetchTemplates()
}

const fetchActiveChecklists = async () => {
  activeChecklistsLoading.value = true
  activeChecklistsError.value = ''
  try {
    const data = await checklistsStore.fetchActiveChecklists()
    activeChecklists.value = data || []
    // Fetch completion for each checklist
    for (const checklist of activeChecklists.value) {
      fetchChecklistCompletion(checklist.id)
    }
  } catch (e: any) {
    activeChecklistsError.value = e.message || 'Failed to fetch active checklists'
  } finally {
    activeChecklistsLoading.value = false
  }
}

const fetchChecklistCompletion = async (checklistId: string) => {
  checklistCompletion.value[checklistId] = { progress: 0, total: 0, percent: 0, loading: true }
  try {
    const res = await fetch(`/api/v1/checklists/active/${checklistId}/completion`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    if (!res.ok) throw new Error('Failed to fetch completion')
    const data = await res.json()
    const percent = data.total > 0 ? Math.round((data.progress / data.total) * 100) : 0
    checklistCompletion.value[checklistId] = {
      progress: data.progress,
      total: data.total,
      percent,
      loading: false
    }
  } catch (e) {
    checklistCompletion.value[checklistId] = { progress: 0, total: 0, percent: 0, loading: false }
  }
}

const handleTemplateCreated = async () => {
  await fetchTemplates()
  // Show success message
  console.log('Template created successfully!')
}

const useTemplate = async (templateId: string | number) => {
  try {
    const res = await fetch('/api/v1/checklists/active', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify({ template_id: templateId })
    })
    if (!res.ok) throw new Error('Failed to create active checklist')
    const activeChecklist = await res.json()
    toast.value = { message: 'Checklist instantiated!', type: 'success' }
    await fetchActiveChecklists()
    // Optionally, you could redirect to the new checklist here
    // router.push(`/checklists/active/${activeChecklist.id}`)
  } catch (e: any) {
    toast.value = { message: e.message || 'Failed to create active checklist', type: 'error' }
  } finally {
    setTimeout(() => { toast.value = null }, 2500)
  }
}

onMounted(async () => {
  await Promise.all([
    fetchTemplates(),
    fetchActiveChecklists()
  ])
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
    const res = await fetch(`/api/v1/checklists/active/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error('Approval failed')
    const updatedChecklist = await res.json()
    // Update the checklist in local state
    const idx = activeChecklists.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      activeChecklists.value[idx] = { ...activeChecklists.value[idx], ...updatedChecklist }
    }
    toast.value = { message: 'Checklist approved!', type: 'success' }
  } catch (e) {
    toast.value = { message: 'Approval failed', type: 'error' }
  } finally {
    approving.value = null
    setTimeout(() => { toast.value = null }, 2000)
  }
}
</script> 