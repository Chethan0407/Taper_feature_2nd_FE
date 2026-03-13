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
                
                <div v-else-if="visibleTemplates.length === 0" class="text-center py-8">
                  <div class="text-gray-500 dark:text-gray-400">No templates found. Create your first template!</div>
                </div>
                
                <div v-else class="space-y-2">
                  <div v-for="template in visibleTemplates" :key="template.id" class="bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors p-4">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-gray-900 dark:text-white text-base">{{ template.name || `Template ${template.id}` }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          {{ template.items?.length || 0 }} items
                          <span v-if="template.description">• {{ template.description }}</span>
                        </p>
                      </div>
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <button class="btn-secondary text-sm px-3 py-1.5" @click="useTemplate(template.id)">Use Template</button>
                        <button
                          class="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          @click="confirmDeleteTemplate(template)"
                          :disabled="deletingTemplate === template.id"
                          title="Delete template"
                        >
                          <svg v-if="deletingTemplate === template.id" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
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
              <div v-else-if="visibleActiveChecklists.length === 0" class="text-center py-8">
                <div class="text-gray-500 dark:text-gray-400">No active checklists found.</div>
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="checklist in visibleActiveChecklists"
                  :key="checklist.id"
                  class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  <!-- Show the template name that this active checklist was created from -->
                  <h3 class="font-medium text-gray-900 dark:text-white mb-2">
                    {{ checklist.template_name || `Checklist ${checklist.id}` }}
                  </h3>
                  
                  <!-- Completion Status -->
                  <div class="flex items-center justify-between text-sm mb-2">
                    <span class="text-gray-500 dark:text-gray-400">
                      {{ getCompletionText(checklist) }}
                    </span>
                    <span :class="getProgressClassFromPercent(getCompletionPercent(checklist))" class="px-2 py-1 rounded text-xs font-semibold">
                      {{ getCompletionPercent(checklist) }}%
                    </span>
                  </div>
                  
                  <!-- Additional Info (approved_by/rejected_by) -->
                  <div v-if="checklist.status === 'approved' && (checklist.approved_by || checklist.approved_by_email)" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Approved by: {{ checklist.approved_by || checklist.approved_by_email }}
                  </div>
                  <div v-if="checklist.status === 'rejected' && (checklist.rejected_by || checklist.rejected_by_email)" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Rejected by: {{ checklist.rejected_by || checklist.rejected_by_email }}
                  </div>
                  
                  <!-- Status Badge/Button -->
                  <div class="mt-2 flex items-center gap-2">
                    <!-- Pending: Show Approve button (green) -->
                    <button 
                      v-if="checklist.status === 'pending'"
                      class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                      @click="approveChecklist(checklist.id)"
                      :disabled="approving === checklist.id"
                    >
                      {{ approving === checklist.id ? 'Approving...' : 'Approve' }}
                    </button>
                    
                    <!-- Approved: Show Approved badge (green, disabled) -->
                    <span 
                      v-if="checklist.status === 'approved'"
                      class="px-4 py-2 bg-green-500/20 text-green-500 border border-green-500/30 rounded-lg text-sm font-semibold"
                    >
                      Approved
                    </span>
                    
                    <!-- Rejected: Show Rejected badge (red) -->
                    <span 
                      v-if="checklist.status === 'rejected'"
                      class="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-sm font-semibold"
                    >
                      Rejected
                    </span>
                    
                    <!-- Delete button for all statuses -->
                    <button
                      class="ml-auto p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      @click="confirmDeleteChecklist(checklist)"
                      :disabled="deleting === checklist.id"
                      title="Delete checklist"
                    >
                      <svg v-if="deleting === checklist.id" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
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

const confirmDeleteTemplate = (template: any) => {
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