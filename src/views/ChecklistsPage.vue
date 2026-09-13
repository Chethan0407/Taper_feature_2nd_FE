<template>
  <div class="min-h-screen app-page">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8 page-enter">
          <h1 class="page-title-gradient mb-1">Checklists</h1>
          <p class="page-subtitle">Build, reuse and sign-off tapeout checklists</p>
        </div>

        <div class="mx-auto mb-8 grid max-w-7xl grid-cols-1 gap-5 xl:grid-cols-3 page-enter">
          <!-- Checklist Templates -->
          <div class="min-w-0 xl:col-span-2">
            <div class="module-panel flex h-[520px] flex-col">
              <div class="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-dark-700">
                <h2 class="module-section-title text-lg">Checklist Templates</h2>
                <button class="btn-primary px-4 py-2 text-sm" @click="showCreateTemplateModal = true">Create Template</button>
              </div>

              <div class="custom-scrollbar flex-1 overflow-y-auto px-3 py-2">
                <div v-if="checklistsStore.loading" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading templates...</div>
                <div v-else-if="checklistsStore.error" class="py-10 text-center text-sm text-red-500">{{ checklistsStore.error }}</div>
                <div v-else-if="visibleTemplates.length === 0" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">No templates yet. Create your first one.</div>
                <ul v-else class="divide-y divide-gray-200 dark:divide-dark-700">
                  <li
                    v-for="template in visibleTemplates"
                    :key="template.id"
                    class="flex min-w-0 items-center gap-3 px-2 py-3"
                  >
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate text-sm font-medium text-gray-900 dark:text-white" :title="template.name || `Template ${template.id}`">
                        {{ template.name || `Template ${template.id}` }}
                      </h3>
                      <div class="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          v-if="template.is_system"
                          class="rounded-full border border-sky-500/40 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300"
                          data-testid="template-system-badge"
                        >
                          System
                        </span>
                        <span
                          v-if="template.is_system || isTorTemplate(template)"
                          class="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200"
                          data-testid="template-tor-badge"
                        >
                          Tapeout
                        </span>
                      </div>
                      <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                        {{ template.items?.length || 0 }} items
                        <span v-if="template.description"> · {{ template.description }}</span>
                      </p>
                    </div>
                    <div class="flex flex-shrink-0 items-center gap-1.5">
                      <button class="btn-secondary px-3 py-1.5 text-xs" @click="useTemplate(template.id)">Use</button>
                      <button
                        v-if="!template.is_system"
                        class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        @click="confirmDeleteTemplate(template)"
                        :disabled="deletingTemplate === template.id"
                        title="Delete template"
                      >
                        <svg v-if="deletingTemplate === template.id" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Active Checklists -->
          <div class="min-w-0">
            <div class="module-panel flex h-[520px] flex-col">
              <div class="border-b border-gray-200 px-5 py-4 dark:border-dark-700">
                <h2 class="module-section-title text-lg">Active Checklists</h2>
              </div>
              <div class="custom-scrollbar flex-1 overflow-y-auto px-3 py-2">
                <div v-if="activeChecklistsLoading" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading active checklists...</div>
                <div v-else-if="activeChecklistsError" class="py-10 text-center text-sm text-red-500">{{ activeChecklistsError }}</div>
                <div v-else-if="visibleActiveChecklists.length === 0" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">No active checklists.</div>
                <ul v-else class="divide-y divide-gray-200 dark:divide-dark-700">
                  <li
                    v-for="checklist in visibleActiveChecklists"
                    :key="checklist.id"
                    class="px-2 py-3"
                  >
                    <div class="mb-2 flex min-w-0 items-start gap-2">
                      <div class="min-w-0 flex-1">
                        <h3 class="truncate text-sm font-medium text-gray-900 dark:text-white" :title="checklist.template_name || `Checklist ${checklist.id}`">
                          {{ checklist.template_name || `Checklist ${checklist.id}` }}
                        </h3>
                        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {{ getCompletionText(checklist) }}
                        </p>
                      </div>
                      <span :class="getProgressClassFromPercent(getCompletionPercent(checklist))" class="flex-shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                        {{ getCompletionPercent(checklist) }}%
                      </span>
                    </div>

                    <p
                      v-if="checklist.status === 'approved' && (checklist.approved_by || checklist.approved_by_email)"
                      class="mb-2 truncate text-[11px] text-gray-500 dark:text-gray-400"
                    >
                      Approved by {{ checklist.approved_by || checklist.approved_by_email }}
                    </p>
                    <p
                      v-if="checklist.status === 'rejected' && (checklist.rejected_by || checklist.rejected_by_email)"
                      class="mb-2 truncate text-[11px] text-gray-500 dark:text-gray-400"
                    >
                      Rejected by {{ checklist.rejected_by || checklist.rejected_by_email }}
                    </p>

                    <div class="flex items-center gap-2">
                      <button
                        v-if="checklist.status === 'pending'"
                        class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        @click="approveChecklist(checklist.id)"
                        :disabled="approving === checklist.id"
                      >
                        {{ approving === checklist.id ? '…' : 'Approve' }}
                      </button>
                      <span
                        v-else-if="checklist.status === 'approved'"
                        :class="statusBadgeClass('approved')"
                      >
                        Approved
                      </span>
                      <span
                        v-else-if="checklist.status === 'rejected'"
                        :class="statusBadgeClass('rejected')"
                      >
                        Rejected
                      </span>

                      <button
                        class="ml-auto rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        @click="confirmDeleteChecklist(checklist)"
                        :disabled="deleting === checklist.id"
                        title="Delete checklist"
                      >
                        <svg v-if="deleting === checklist.id" class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Section -->
        <div class="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-4">
          <div class="stat-tile !text-left !p-4 border-sky-500/30 bg-sky-500/5">
            <p class="text-xs font-medium uppercase tracking-wide text-sky-400">Total Templates</p>
            <p class="mt-1 font-display text-2xl font-bold text-sky-300">
              {{ checklistsStore.stats?.total_templates ?? (checklistsStore.statsLoading ? '…' : checklistsStore.list.length) }}
            </p>
          </div>
          <div class="stat-tile !text-left !p-4 border-violet-500/30 bg-violet-500/5">
            <p class="text-xs font-medium uppercase tracking-wide text-violet-400">Active Checklists</p>
            <p class="mt-1 font-display text-2xl font-bold text-violet-300">
              {{ checklistsStore.stats?.active_checklists ?? (checklistsStore.statsLoading ? '…' : activeChecklists.length) }}
            </p>
          </div>
          <div class="stat-tile !text-left !p-4 border-emerald-500/30 bg-emerald-500/5">
            <p class="text-xs font-medium uppercase tracking-wide text-emerald-400">Approved</p>
            <p class="mt-1 font-display text-2xl font-bold text-emerald-300">
              {{ checklistsStore.stats?.approved_checklists ?? (checklistsStore.statsLoading ? '…' : approvedCount) }}
            </p>
          </div>
          <div class="stat-tile !text-left !p-4 border-amber-500/30 bg-amber-500/5">
            <p class="text-xs font-medium uppercase tracking-wide text-amber-400">Avg. Completion</p>
            <p class="mt-1 font-display text-2xl font-bold text-amber-300">
              {{ checklistsStore.stats ? `${Math.round(checklistsStore.stats.avg_completion_rate)}%` : (checklistsStore.statsLoading ? '…' : `${averageCompletion}%`) }}
            </p>
          </div>
        </div>
      </main>
      <CreateTemplateModal 
        v-if="showCreateTemplateModal" 
        @close="() => { showCreateTemplateModal = false }" 
        @created="handleTemplateCreated" 
      />
      
      <!-- Delete Template Confirmation Modal -->
      <Transition name="modal">
        <div v-if="showDeleteTemplateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click.self="closeDeleteTemplateModal">
          <div class="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Delete Template</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">This action cannot be undone</p>
              </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete template 
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ templateToDelete?.name || `Template ${templateToDelete?.id}` }}
              </span>?
              This will permanently delete the template and all its items.
            </p>
            <div v-if="deleteTemplateError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Cannot delete template</p>
              <p class="text-sm text-red-600 dark:text-red-400">{{ deleteTemplateError }}</p>
            </div>
            <div class="flex justify-end gap-3">
              <button
                @click="closeDeleteTemplateModal"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                :disabled="deletingTemplate !== null"
              >
                Cancel
              </button>
              <button
                @click="deleteTemplate"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="deletingTemplate !== null"
              >
                <span v-if="deletingTemplate" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
      
      <!-- Delete Confirmation Modal -->
      <Transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click.self="closeDeleteModal">
          <div class="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-2xl w-full max-w-md">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Delete Checklist</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">This action cannot be undone</p>
              </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete 
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ checklistToDelete?.template_name || checklistToDelete?.name || checklistToDelete?.title || `Checklist ${checklistToDelete?.id}` }}
              </span>?
              This will permanently delete the checklist, all its items, comments, and evidence files.
            </p>
            <div v-if="deleteError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ deleteError }}</p>
            </div>
            <div class="flex justify-end gap-3">
              <button
                @click="closeDeleteModal"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                :disabled="deleting !== null"
              >
                Cancel
              </button>
              <button
                @click="deleteChecklist"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="deleting !== null"
              >
                <span v-if="deleting" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <div v-if="toast" :class="['fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-xl', toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white']">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChecklistsStore } from '@/stores/checklists'
import CreateTemplateModal from '@/components/Checklist/CreateTemplateModal.vue'
import { authenticatedFetch } from '@/utils/auth-requests'
import { statusBadgeClass } from '@/utils/status-badge'

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
  // Completion data from API
  completion_percent?: number
  items?: Array<{ id?: string | number; status?: string; [key: string]: any }>
  // Approval/rejection info
  approved_by?: string
  approved_by_email?: string
  rejected_by?: string
  rejected_by_email?: string
  created_at?: string
}

const checklistsStore = useChecklistsStore()
const authStore = useAuthStore()

const activeChecklists = ref<Checklist[]>([])
const activeChecklistsLoading = ref(false)
const activeChecklistsError = ref('')
const approving = ref<string | null>(null)
const deleting = ref<string | null>(null)
const deletingTemplate = ref<string | number | null>(null)
const showCreateTemplateModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteTemplateModal = ref(false)
const checklistToDelete = ref<Checklist | null>(null)
const templateToDelete = ref<any>(null)
const deleteError = ref('')
const deleteTemplateError = ref('')
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
// Track deleted checklist IDs to prevent them from reappearing
const deletedChecklistIds = ref<Set<string>>(new Set())
// Track deleted template IDs to prevent them from reappearing
const deletedTemplateIds = ref<Set<string | number>>(new Set())

// Store completion percentages for each checklist
const checklistCompletion = ref<Record<string, { progress: number; total: number; percent: number; loading: boolean }>>({})

// Computed properties for statistics
// Helper: determine if a checklist should be treated as approved in the UI
const isChecklistApproved = (checklist: Checklist) => {
  const status = checklist.status?.toLowerCase()
  return status === 'approved' || status === 'done'
}

const isChecklistRejected = (checklist: Checklist) => {
  const status = checklist.status?.toLowerCase()
  return status === 'rejected'
}

const isChecklistPending = (checklist: Checklist) => {
  const status = checklist.status?.toLowerCase()
  return status === 'pending' || !status
}

// Computed property to filter out deleted checklists - ensures they never appear in UI
const visibleActiveChecklists = computed(() => {
  return activeChecklists.value.filter(
    checklist => !deletedChecklistIds.value.has(String(checklist.id))
  )
})

// Computed property to filter out deleted templates - ensures they never appear in UI
const visibleTemplates = computed(() => {
  const list = checklistsStore.list || []
  return list.filter(template => {
    if (!template || !template.id) return false
    // Check if template ID (in any format) is in deleted set
    const id = template.id
    return !deletedTemplateIds.value.has(id) && 
           !deletedTemplateIds.value.has(String(id)) && 
           !deletedTemplateIds.value.has(Number(id))
  })
})

const approvedCount = computed(() => {
  return visibleActiveChecklists.value.filter(c => isChecklistApproved(c)).length
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
    // After fetching, filter out any deleted templates from the store's list
    if (checklistsStore.list && deletedTemplateIds.value.size > 0) {
      checklistsStore.list = checklistsStore.list.filter(
        template => template && !deletedTemplateIds.value.has(template.id)
      )
    }
  } catch (e: any) {
    // Don't auto-logout - just show the error
    // The user can manually refresh or try again
    console.error('Error fetching templates:', e)
    // Clear the list on error to prevent stale data
    if (checklistsStore.list) {
      checklistsStore.list = []
    }
  }
}

const fetchActiveChecklists = async () => {
  activeChecklistsLoading.value = true
  activeChecklistsError.value = ''
  try {
    const data = await checklistsStore.fetchActiveChecklists()
    
    // Clear old completion data before mapping new checklists
    const newIds = new Set((data || []).map((c: any) => String(c.id)))
    // Remove completion data for checklists that no longer exist
    Object.keys(checklistCompletion.value).forEach(id => {
      if (!newIds.has(id)) {
        delete checklistCompletion.value[id]
      }
    })
    
    // IMPORTANT: Always replace the entire array, don't merge
    // This ensures deleted items are removed
    // Also filter out any checklists that were marked as deleted
    const normalizedData = (data || [])
      .filter((checklist: any) => !deletedChecklistIds.value.has(String(checklist.id)))
      .map((checklist: any) => {
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
        template_id: templateId,
        // Preserve completion_percent and items from API response
        completion_percent: checklist.completion_percent,
        items: checklist.items || [],
        // Preserve approval/rejection info
        approved_by: checklist.approved_by,
        approved_by_email: checklist.approved_by_email,
        rejected_by: checklist.rejected_by,
        rejected_by_email: checklist.rejected_by_email,
        created_at: checklist.created_at
      }
    })
    
    // IMPORTANT: Replace the entire array to ensure deleted items are removed
    // Use a new array reference to ensure Vue reactivity picks up the change
    activeChecklists.value = [...normalizedData]

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
    // Clear the list on error to prevent stale data
    activeChecklists.value = []
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

function isTorTemplate(template: any) {
  const name = String(template?.name || '').toLowerCase()
  const cat = String(template?.category || '').toLowerCase()
  return Boolean(template?.is_system) || cat.includes('tapeout') || cat.includes('tor') || name.includes('tapeout') || name.includes('tor ')
}

const confirmDeleteTemplate = (template: any) => {
  if (template?.is_system) {
    toast.value = { message: 'System / Tapeout templates cannot be deleted.', type: 'error' }
    setTimeout(() => { toast.value = null }, 3000)
    return
  }
  templateToDelete.value = template
  deleteTemplateError.value = ''
  showDeleteTemplateModal.value = true
}

const closeDeleteTemplateModal = () => {
  // Always allow closing - errors should allow modal to close
  showDeleteTemplateModal.value = false
  templateToDelete.value = null
  deleteTemplateError.value = ''
  // Reset deleting state when modal closes
  deletingTemplate.value = null
}

const deleteTemplate = async () => {
  if (!templateToDelete.value) return

  const templateId = templateToDelete.value.id
  deletingTemplate.value = templateId
  deleteTemplateError.value = ''

  // OPTIMISTIC UPDATE: Remove from UI immediately before API call
  deletedTemplateIds.value.add(templateId)
  deletedTemplateIds.value.add(String(templateId))
  deletedTemplateIds.value.add(Number(templateId))
  
  if (checklistsStore.list) {
    checklistsStore.list = checklistsStore.list.filter(t => {
      if (!t) return false
      return String(t.id) !== String(templateId) && 
             Number(t.id) !== Number(templateId) &&
             t.id !== templateId
    })
  }
  
  // Close modal immediately so user sees the card disappear
  closeDeleteTemplateModal()

  // Make API call asynchronously (don't await - let it run in background)
  ;(async () => {
    try {
      const res = await authenticatedFetch(`/api/v1/checklists/templates/${templateId}`, {
        method: 'DELETE'
      })

      // Handle 404 - template already deleted (we already removed it optimistically)
      if (res.status === 404) {
        toast.value = { 
          message: 'Template was already deleted', 
          type: 'success' 
        }
        // Only refresh stats, don't refresh templates (to avoid bringing back deleted item)
        await checklistsStore.fetchStats()
        setTimeout(() => { toast.value = null }, 2500)
        deletingTemplate.value = null
        return
      }

      if (!res.ok) {
        // API call failed - restore the template to UI (undo optimistic update)
        deletedTemplateIds.value.delete(templateId)
        deletedTemplateIds.value.delete(String(templateId))
        deletedTemplateIds.value.delete(Number(templateId))
        // Refresh templates to restore the deleted one
        await fetchTemplates()
        
        // Handle other error cases
        if (res.status === 403) {
          throw new Error('You do not have permission to delete this template. Only users from the same domain can delete it.')
        } else if (res.status === 400) {
          // Template is being used by active checklists
          const errorData = await res.json().catch(() => ({}))
          let errorMessage = errorData.detail || errorData.message || 'Cannot delete template'
          
          // Clean up error message - remove duplicates and make it user-friendly
          if (errorMessage.toLowerCase().includes('active checklist')) {
            // Extract the count if available
            const countMatch = errorMessage.match(/(\d+)\s+active\s+checklist/i)
            const count = countMatch ? countMatch[1] : ''
            
            // Create a clean, user-friendly message
            if (count) {
              errorMessage = `${count} active checklist${count !== '1' ? 's are' : ' is'} using this template. Please delete ${count !== '1' ? 'them' : 'it'} first.`
            } else {
              errorMessage = 'This template is being used by active checklists. Please delete all active checklists using this template first.'
            }
          }
          throw new Error(errorMessage)
        } else if (res.status === 401) {
          const errorText = await res.text().catch(() => '')
          throw new Error(errorText || 'Authentication required. Please log in again.')
        } else {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.detail || errorData.message || 'Failed to delete template. Please try again.')
        }
      }

      // Success - 204 No Content
      // Template already removed optimistically, just show success
      toast.value = { 
        message: 'Template deleted successfully', 
        type: 'success' 
      }
      
      // Only refresh stats, don't refresh templates immediately (to avoid bringing back deleted item)
      await checklistsStore.fetchStats()
      
      setTimeout(() => { toast.value = null }, 2500)
    } catch (err: any) {
      // API call failed - restore the template to UI (undo optimistic update)
      deletedTemplateIds.value.delete(templateId)
      deletedTemplateIds.value.delete(String(templateId))
      deletedTemplateIds.value.delete(Number(templateId))
      
      // Restore template in the list
      await fetchTemplates()
      
      // Close modal if it's still open
      if (showDeleteTemplateModal.value) {
        closeDeleteTemplateModal()
      }
      
      // Show error toast with clean message
      const errorMessage = err.message || 'Failed to delete template. Please try again.'
      toast.value = {
        message: errorMessage,
        type: 'error'
      }
      setTimeout(() => { toast.value = null }, 5000) // Show for 5 seconds for important errors
      console.error('Error deleting template:', err)
    } finally {
      deletingTemplate.value = null
    }
  })()
  
  // Don't await - let deletion happen in background while UI updates immediately
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

// Get completion percent from API response (completion_percent) or calculate from items
const getCompletionPercent = (checklist: Checklist): number => {
  // Prefer completion_percent from API if available
  if (checklist.completion_percent !== undefined && checklist.completion_percent !== null) {
    return Math.round(checklist.completion_percent)
  }
  
  // Fallback to calculated completion from items array
  if (checklist.items && Array.isArray(checklist.items) && checklist.items.length > 0) {
    const doneCount = checklist.items.filter((item: any) => item.status === 'done').length
    const total = checklist.items.length
    return total > 0 ? Math.round((doneCount / total) * 100) : 0
  }
  
  // Fallback to checklistCompletion if available
  const completion = checklistCompletion.value[checklist.id]
  if (completion && !completion.loading) {
    return completion.percent ?? 0
  }
  
  return 0
}

// Get completion text "X/Y completed" from items array
const getCompletionText = (checklist: Checklist): string => {
  // Calculate from items array if available
  if (checklist.items && Array.isArray(checklist.items) && checklist.items.length > 0) {
    const doneCount = checklist.items.filter((item: any) => item.status === 'done').length
    const total = checklist.items.length
    return `${doneCount}/${total} completed`
  }
  
  // Fallback to checklistCompletion if available
  const completion = checklistCompletion.value[checklist.id]
  if (completion && !completion.loading) {
    return `${completion.progress}/${completion.total} completed`
  }
  
  return '0/0 completed'
}

// Legacy function for backward compatibility (if used elsewhere)
const getProgressClass = (progress: number, total: number) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0
  return getProgressClassFromPercent(percentage)
}

const confirmDeleteChecklist = (checklist: Checklist) => {
  checklistToDelete.value = checklist
  deleteError.value = ''
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  // Always allow closing - errors should allow modal to close
  showDeleteModal.value = false
  checklistToDelete.value = null
  deleteError.value = ''
  // Reset deleting state when modal closes
  deleting.value = null
}

const deleteChecklist = async () => {
  if (!checklistToDelete.value) return

  const deletedId = checklistToDelete.value.id
  deleting.value = deletedId
  deleteError.value = ''

  // OPTIMISTIC UPDATE: Remove from UI immediately before API call
  deletedChecklistIds.value.add(String(deletedId))
  activeChecklists.value = activeChecklists.value.filter(c => String(c.id) !== String(deletedId))
  delete checklistCompletion.value[deletedId]
  
  // Close modal immediately so user sees the card disappear
  closeDeleteModal()

  // Make API call asynchronously (don't await - let it run in background)
  ;(async () => {
    try {
      const res = await authenticatedFetch(`/api/v1/checklists/active/${deletedId}`, {
        method: 'DELETE'
      })

      // Handle 404 - checklist already deleted (we already removed it optimistically)
      if (res.status === 404) {
        toast.value = { 
          message: 'Checklist was already deleted', 
          type: 'success' 
        }
        // Only refresh stats, don't refresh the list (to avoid bringing back deleted item)
        await checklistsStore.fetchStats()
        setTimeout(() => { toast.value = null }, 2500)
        deleting.value = null
        return
      }

      if (!res.ok) {
        // API call failed - restore the item to UI (undo optimistic update)
        deletedChecklistIds.value.delete(String(deletedId))
        // We need to restore the checklist, but we don't have the original data
        // So we'll just refresh the list to get it back
        await fetchActiveChecklists()
        
        // Handle other error cases with user-friendly messages
        if (res.status === 403) {
          throw new Error('You do not have permission to delete this checklist. Only users from the same domain can delete it.')
        } else if (res.status === 401) {
          const errorText = await res.text().catch(() => '')
          throw new Error(errorText || 'Authentication required. Please log in again.')
        } else {
          const errorData = await res.json().catch(() => ({}))
          const errorMessage = errorData.detail || errorData.message || 'Failed to delete checklist. Please try again.'
          throw new Error(errorMessage)
        }
      }

      // Success - 204 No Content or 200 OK
      // Item already removed optimistically, just show success
      toast.value = { 
        message: 'Checklist deleted successfully', 
        type: 'success' 
      }
      
      // Only refresh stats, don't refresh the list immediately (to avoid bringing back deleted item)
      await checklistsStore.fetchStats()
      
      setTimeout(() => { toast.value = null }, 2500)
    } catch (err: any) {
      // API call failed - restore the item to UI (undo optimistic update)
      deletedChecklistIds.value.delete(String(deletedId))
      
      // Restore checklist in the list
      await fetchActiveChecklists()
      
      // Close modal if it's still open
      if (showDeleteModal.value) {
        closeDeleteModal()
      }
      
      // Show error toast with clean message
      const errorMessage = err.message || 'Failed to delete checklist. Please try again.'
      toast.value = {
        message: errorMessage,
        type: 'error'
      }
      setTimeout(() => { toast.value = null }, 5000) // Show for 5 seconds for important errors
      console.error('Error deleting checklist:', err)
    } finally {
      deleting.value = null
    }
  })()
  
  // Don't await - let deletion happen in background while UI updates immediately
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
/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

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