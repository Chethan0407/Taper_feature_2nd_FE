<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Checklists</h1>
          <p class="text-gray-500 dark:text-gray-400">Build, reuse and sign-off tapeout checklists</p>
        </div>

        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <!-- Checklist Templates -->
          <div class="xl:col-span-2 w-full">
            <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl h-[480px] flex flex-col">
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-dark-700">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Checklist Templates</h2>
                <button class="btn-primary" @click="showCreateTemplateModal = true">Create Template</button>
              </div>
              
              <div class="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4">
                <div v-if="checklistsStore.loading" class="text-center py-8">
                  <div class="text-gray-500 dark:text-gray-400">Loading templates...</div>
                </div>
                
                <div v-else-if="checklistsStore.error" class="text-center py-8">
                  <div class="text-red-500">{{ checklistsStore.error }}</div>
                </div>
                
                <div v-else-if="checklistsStore.list.length === 0" class="text-center py-8">
                  <div class="text-gray-500 dark:text-gray-400">No templates found. Create your first template!</div>
                </div>
                
                <div v-else class="space-y-2">
                  <div v-for="template in checklistsStore.list.filter(t => t)" :key="template.id" class="bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors p-4">
                    <div class="flex items-center gap-2">
                      <div class="flex-1">
                        <h3 class="font-medium text-gray-900 dark:text-white text-base">{{ template.name || `Template ${template.id}` }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          {{ template.items?.length || 0 }} items
                          <span v-if="template.description">• {{ template.description }}</span>
                        </p>
                      </div>
                      <button class="btn-secondary flex-shrink-0 text-sm px-3 py-1.5" @click="useTemplate(template.id)">Use Template</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Checklists -->
          <div class="w-full bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl h-[480px] flex flex-col">
            <div class="p-6 pb-4 border-b border-gray-200 dark:border-dark-700">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Active Checklists</h2>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4">
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
                <div
                  v-for="checklist in activeChecklists"
                  :key="checklist.id"
                  class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  <!-- Show the template name that this active checklist was created from -->
                  <h3 class="font-medium text-gray-900 dark:text-white mb-2">
                    {{
                      checklist.template_name ||
                      checklist.template?.name ||
                      checklist.name ||
                      checklist.title ||
                      `Checklist ${checklist.id}`
                    }}
                  </h3>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">
                      <template v-if="checklistCompletion[checklist.id]?.loading">
                        Loading progress...
                      </template>
                      <template v-else>
                        {{ checklistCompletion[checklist.id]?.progress }}/{{ checklistCompletion[checklist.id]?.total }} completed
                      </template>
                    </span>
                    <span :class="getProgressClassFromPercent(checklistCompletion[checklist.id]?.percent ?? 0)" class="px-2 py-1 rounded text-xs font-semibold">
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
                      :disabled="approving === checklist.id || isChecklistApproved(checklist)"
                    >
                      {{ isChecklistApproved(checklist) ? 'Approved' : (approving === checklist.id ? 'Approving...' : 'Approve') }}
                    </button>
                    <span v-if="isChecklistApproved(checklist)" class="bg-green-500/20 text-green-500 px-3 py-1 rounded text-xs font-semibold ml-2">Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Section -->
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Total Templates</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ checklistsStore.stats?.total_templates ?? (checklistsStore.statsLoading ? '...' : checklistsStore.list.length) }}
                </p>
              </div>
              <div class="p-3 bg-blue-500/10 rounded-lg">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Active Checklists</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ checklistsStore.stats?.active_checklists ?? (checklistsStore.statsLoading ? '...' : activeChecklists.length) }}
                </p>
              </div>
              <div class="p-3 bg-green-500/10 rounded-lg">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ checklistsStore.stats?.approved_checklists ?? (checklistsStore.statsLoading ? '...' : approvedCount) }}
                </p>
              </div>
              <div class="p-3 bg-purple-500/10 rounded-lg">
                <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Avg. Completion</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {{ checklistsStore.stats ? `${Math.round(checklistsStore.stats.avg_completion_rate)}%` : (checklistsStore.statsLoading ? '...' : `${averageCompletion}%`) }}
                </p>
              </div>
              <div class="p-3 bg-orange-500/10 rounded-lg">
                <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
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
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChecklistsStore } from '@/stores/checklists'
import CreateTemplateModal from '@/components/Checklist/CreateTemplateModal.vue'
import { authenticatedFetch } from '@/utils/auth-requests'

const router = useRouter()

interface Checklist {
  id: string
  // Template name used to create this active checklist (preferred label)
  template_name?: string
  // Reference to the originating template
  template_id?: string | number
  // Fallbacks if backend sends different fields
  name?: string
  title?: string
  template?: { name?: string }
  progress: number
  total: number
  status?: string
  // Some backends expose explicit approval flags
  is_approved?: boolean
  approved?: boolean
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

// Computed properties for statistics
// Helper: determine if a checklist should be treated as approved in the UI
const isChecklistApproved = (checklist: Checklist) => {
  const status = checklist.status?.toLowerCase()
  const completion = checklistCompletion.value[checklist.id]
  const percent = completion?.percent ?? 0
  return status === 'approved' || status === 'done' || percent === 100
}

const approvedCount = computed(() => {
  return activeChecklists.value.filter(c => isChecklistApproved(c)).length
})

const averageCompletion = computed(() => {
  const completions = Object.values(checklistCompletion.value).filter(c => !c.loading)
  if (completions.length === 0) return 0
  const sum = completions.reduce((acc, c) => acc + c.percent, 0)
  return Math.round(sum / completions.length)
})

const fetchTemplates = async () => {
  try {
    await checklistsStore.fetchTemplates()
  } catch (e: any) {
    // Don't auto-logout - just show the error
    // The user can manually refresh or try again
    console.error('Error fetching templates:', e)
  }
}

const fetchActiveChecklists = async () => {
  activeChecklistsLoading.value = true
  activeChecklistsError.value = ''
  try {
    const data = await checklistsStore.fetchActiveChecklists()
    // Normalize active checklist data, especially status casing/field name
    activeChecklists.value = (data || []).map((checklist: any) => {
      // If backend exposes a boolean approved flag, treat that as source of truth
      const approvedFlag = checklist.is_approved ?? checklist.approved
      const rawStatus =
        (approvedFlag === true ? 'approved' : undefined) ??
        checklist.status ??
        checklist.approval_status ??
        checklist.review_status ??
        'pending'
      const status = String(rawStatus).toLowerCase()

      // Try to determine the originating template ID
      const templateId =
        checklist.template_id ??
        checklist.template?.id ??
        checklist.template?.template_id

      // If we know the template ID, look it up from the templates list in the store
      const templateFromStore = templateId
        ? checklistsStore.list.find((t: any) => String(t.id) === String(templateId))
        : undefined

      // Derive a stable display name for the card, preferring the TEMPLATE name
      const templateName =
        checklist.template_name ||
        checklist.template?.name ||
        templateFromStore?.name ||
        checklist.name ||
        checklist.title ||
        (templateId ? `Checklist from template ${templateId}` : undefined)

      return {
        ...checklist,
        status,
        template_name: templateName,
        template_id: templateId
      }
    })

    // Recompute completion after any refresh of active checklists.
    // Fire these requests in parallel so we don't block the UI.
    const ids = activeChecklists.value.map((checklist) => checklist.id)
    ids.forEach((id) => {
      fetchChecklistCompletion(id)
    })
  } catch (e: any) {
    activeChecklistsError.value = e.message || 'Failed to fetch active checklists'
    // Don't auto-logout - just show the error
    // The user can manually refresh or try again
    console.error('Error fetching active checklists:', e)
  } finally {
    activeChecklistsLoading.value = false
  }
}

const fetchChecklistCompletion = async (checklistId: string) => {
  checklistCompletion.value[checklistId] = { progress: 0, total: 0, percent: 0, loading: true }
  try {
    // Remove trailing slash - backend doesn't accept trailing slashes
    const res = await authenticatedFetch(`/api/v1/checklists/active/${checklistId}/completion`)
    if (!res.ok) {
      console.error(`Failed to fetch completion for checklist ${checklistId}:`, res.status, res.statusText)
      throw new Error('Failed to fetch completion')
    }
    const data = await res.json()
    console.log(`Completion data for checklist ${checklistId}:`, data)
    const percent = data.total > 0 ? Math.round((data.progress / data.total) * 100) : 0
    checklistCompletion.value[checklistId] = {
      progress: data.progress || 0,
      total: data.total || 0,
      percent,
      loading: false
    }
  } catch (e: any) {
    console.error(`Error fetching completion for checklist ${checklistId}:`, e)
    checklistCompletion.value[checklistId] = { progress: 0, total: 0, percent: 0, loading: false }
  }
}

const handleTemplateCreated = async () => {
  await Promise.all([
    fetchTemplates(),
    checklistsStore.fetchStats() // Refresh statistics after creating template
  ])
  toast.value = { message: 'Template created successfully!', type: 'success' }
  setTimeout(() => { toast.value = null }, 2500)
}

const useTemplate = async (templateId: string | number) => {
  try {
    const res = await authenticatedFetch('/api/v1/checklists/active', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId })
    })
    if (!res.ok) throw new Error('Failed to create active checklist')
    const activeChecklist = await res.json()
    toast.value = { message: 'Checklist instantiated!', type: 'success' }
    await Promise.all([
      fetchActiveChecklists(),
      checklistsStore.fetchStats() // Refresh statistics after creating active checklist
    ])
    // Optionally, you could redirect to the new checklist here
    // router.push(`/checklists/active/${activeChecklist.id}`)
  } catch (e: any) {
    toast.value = { message: e.message || 'Failed to create active checklist', type: 'error' }
  } finally {
    setTimeout(() => { toast.value = null }, 2500)
  }
}

onMounted(async () => {
  // Ensure user is authenticated before fetching
  const authStore = useAuthStore()
  
  // Always check auth first to ensure token is loaded
  const authResult = await authStore.checkAuth()
  if (!authResult) {
    console.warn('⚠️ Authentication check failed. User may need to log in again.')
    // Don't auto-logout, just show error
    return
  }
  
  // Verify token exists before making requests
  if (!authStore.token) {
    console.error('❌ No token available after auth check')
    return
  }
  
  console.log('✅ Authentication verified, token available:', !!authStore.token)
  
  await Promise.all([
    fetchTemplates(),
    fetchActiveChecklists(),
    checklistsStore.fetchStats() // Fetch statistics on page load
  ])
})

// Get progress class based on percentage (0-100)
const getProgressClassFromPercent = (percentage: number) => {
  if (percentage >= 80) return 'bg-green-500/20 text-green-400'
  if (percentage >= 50) return 'bg-yellow-500/20 text-yellow-400'
  if (percentage > 0) return 'bg-orange-500/20 text-orange-400'
  // 0% - show in gray to indicate "not started" rather than error
  return 'bg-gray-500/20 text-gray-400'
}

// Legacy function for backward compatibility (if used elsewhere)
const getProgressClass = (progress: number, total: number) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0
  return getProgressClassFromPercent(percentage)
}

const approveChecklist = async (id: string) => {
  approving.value = id
  try {
    // IMPORTANT: Backend expects the active checklist ID here, with NO trailing slash
    const res = await authenticatedFetch(`/api/v1/checklists/active/${id}/approve`, {
      method: 'POST'
    })
    if (!res.ok) {
      // Handle 401 / token expiry explicitly so user gets a clear message
      if (res.status === 401) {
        let errorText = ''
        try {
          errorText = await res.text()
        } catch {
          // ignore
        }
        const msg = errorText || 'Token has expired. Please login again.'
        toast.value = { message: msg, type: 'error' }
        // Redirect to login after short delay
        setTimeout(() => {
          toast.value = null
          router.push('/login')
        }, 2000)
        return
      }

      // For other errors, try to surface backend detail
      let fallback = 'Approval failed'
      try {
        const text = await res.text()
        if (text) {
          try {
            const data = JSON.parse(text)
            fallback = data.detail || data.message || fallback
          } catch {
            fallback = text
          }
        }
      } catch {
        // ignore, keep fallback
      }
      throw new Error(fallback)
    }
    const updatedChecklist = await res.json()
    // Normalize status from response (status / approval_status / review_status / is_approved)
    const approvedFlag = updatedChecklist.is_approved ?? updatedChecklist.approved
    const rawStatus =
      (approvedFlag === true ? 'approved' : undefined) ??
      updatedChecklist.status ??
      updatedChecklist.approval_status ??
      updatedChecklist.review_status ??
      activeChecklists.value.find(c => c.id === id)?.status ??
      'approved'
    const normalizedStatus = String(rawStatus).toLowerCase()

    // Update the checklist in local state immediately for a snappy UX
    const idx = activeChecklists.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      activeChecklists.value[idx] = {
        ...activeChecklists.value[idx],
        ...updatedChecklist,
        status: normalizedStatus
      }
    }
    // Kick off background refresh of active checklists and statistics
    // without blocking the button/UI.
    fetchActiveChecklists().catch((err) => {
      console.error('Background refresh of active checklists failed:', err)
    })
    checklistsStore.fetchStats().catch((err: any) => {
      console.error('Background refresh of checklist stats failed:', err)
    })

    // Let the notifications bell know there may be a new notification
    try {
      window.dispatchEvent(new CustomEvent('notifications:refresh'))
    } catch (e) {
      console.error('Failed to dispatch notifications refresh event:', e)
    }

    toast.value = { message: 'Checklist approved!', type: 'success' }
  } catch (e: any) {
    toast.value = { message: e.message || 'Approval failed', type: 'error' }
  } finally {
    approving.value = null
    setTimeout(() => { toast.value = null }, 2000)
  }
}
</script> 

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #b0b4ba; /* soft light gray */
  border-radius: 6px;
  min-height: 40px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #b0b4ba transparent;
}
</style> 