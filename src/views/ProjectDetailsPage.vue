<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Quality Score Breakdown at the very top -->
        <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quality Score Breakdown</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-500 mb-2">{{ dashboardData.qualityScore?.approval_rate || 0 }}%</div>
              <div class="text-gray-400">Approval Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-500 mb-2">{{ dashboardData.qualityScore?.completion_rate || 0 }}%</div>
              <div class="text-gray-400">Completion Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-500 mb-2">{{ dashboardData.qualityScore?.pass_rate || 0 }}%</div>
              <div class="text-gray-400">Pass Rate</div>
            </div>
          </div>
        </div>
        <!-- Tab Switcher -->
        <div class="flex space-x-4 mb-8 border-b border-gray-200 dark:border-dark-700">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-6 py-3 font-semibold text-lg focus:outline-none transition-colors',
              activeTab === tab.key
                ? 'border-b-4 border-neon-blue text-neon-blue dark:text-neon-blue'
                : 'text-gray-500 dark:text-gray-400 hover:text-neon-blue/80'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Manage Project Tab -->
        <template v-if="activeTab === 'manage'">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Manage Project Content</h2>
          <!-- Project Specifications (add/list) -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Project Specifications</h2>
              <button v-if="project" @click="router.push(`/specs?project=${project.id}`)" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Spec
              </button>
            </div>
            
            <!-- Specs will be loaded here -->
            <div v-if="dashboardData.specs.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Specifications Yet</h3>
              <p class="text-gray-500 mb-6">Add specifications to this project to get started</p>
              <button v-if="project" @click="router.push(`/specs?project=${project.id}`)" class="btn-primary">
                Add First Spec
              </button>
            </div>
            <div v-else class="space-y-4">
              <div v-for="spec in dashboardData.specs" :key="spec.id" class="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ spec.name || spec.file_name || `Spec ${spec.id}` }}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(spec.status)"></span>
                        {{ spec.status }}
                      </span>
                      <span v-if="spec.reviewer">Reviewed by: {{ spec.reviewer }}</span>
                      <span v-if="spec.timestamp">{{ formatDate(spec.timestamp) }}</span>
                    </div>
                    <p v-if="spec.comments" class="mt-2 text-gray-600 dark:text-gray-300">{{ spec.comments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Linked Specs & Checklists Section -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">✅ Linked Specs</h2>
              <button v-if="project" class="btn-primary px-4 py-2 text-sm" @click="openLinkModal('spec')">Link Spec</button>
            </div>
            <input v-model="specSearchTerm" class="input-field w-full mb-2" placeholder="Search linked specs..." />
            <div v-if="selectedSpecIds.length" class="mb-2 flex gap-2 items-center">
              <button class="btn-danger px-3 py-1 text-xs" @click="batchUnlinkSpecs">Unlink Selected ({{ selectedSpecIds.length }})</button>
              <!-- Add batch like button here if needed -->
            </div>
            <RecycleScroller
              :items="filteredLinkedSpecs"
              :item-size="56"
              class="mb-6 max-h-96 overflow-auto rounded"
              v-slot="{ item: spec }"
            >
              <li class="flex items-center gap-3 border-b border-dark-800 py-3 px-2 last:border-b-0">
                <input type="checkbox" :checked="selectedSpecIds.includes(typeof spec === 'object' && spec !== null ? spec.id : spec)" @change="toggleSpecSelection(typeof spec === 'object' && spec !== null ? spec.id : spec)" />
                <span class="text-neon-blue font-medium cursor-pointer hover:underline">
                  {{ typeof spec === 'object' && spec !== null ? (spec.name || spec.file_name || `Spec ${spec.id}`) : `Spec ${spec}` }}
                </span>
                <span class="ml-2 text-yellow-400" v-if="typeof spec === 'object' && spec !== null && spec.liked_by_me">⭐️ You liked this</span>
                <span class="ml-2 text-yellow-400" v-else-if="typeof spec === 'object' && spec !== null && (spec.like_count ?? 0) > 0">⭐️ Liked by {{ spec.like_count ?? 0 }} people</span>
                <span class="ml-2 text-gray-400" v-else>(No likes)</span>
                <button class="ml-4 btn-secondary px-2 py-1 text-xs" @click="onLikeSpec(spec)">
                  {{ typeof spec === 'object' && spec !== null && spec.liked_by_me ? 'Unlike' : 'Like' }}
                </button>
                <button class="ml-2 btn-secondary px-2 py-1 text-xs" @click="onUnlinkSpec(spec)">
                  Unlink
                </button>
              </li>
            </RecycleScroller>
            <div v-if="filteredLinkedSpecs.length === 0" class="text-gray-400 text-center py-4">No linked specs.</div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">✅ Linked Checklists</h2>
              <button v-if="project" class="btn-primary px-4 py-2 text-sm" @click="openLinkModal('checklist')">Link Checklist</button>
            </div>
            <input v-model="checklistSearchTerm" class="input-field w-full mb-2" placeholder="Search linked checklists..." />
            <div v-if="selectedChecklistIds.length" class="mb-2 flex gap-2 items-center">
              <button class="btn-danger px-3 py-1 text-xs" @click="batchUnlinkChecklists">Unlink Selected ({{ selectedChecklistIds.length }})</button>
              <!-- Add batch like button here if needed -->
            </div>
            <RecycleScroller
              :items="filteredLinkedChecklists"
              :item-size="56"
              class="max-h-96 overflow-auto rounded"
              v-slot="{ item: checklist }"
            >
              <li class="flex items-center gap-3 border-b border-dark-800 py-3 px-2 last:border-b-0">
                <input type="checkbox" :checked="selectedChecklistIds.includes(typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)" @change="toggleChecklistSelection(typeof checklist === 'object' && checklist !== null ? checklist.id : checklist)" />
                <span class="text-neon-blue font-medium cursor-pointer hover:underline">
                  {{ typeof checklist === 'object' && checklist !== null ? (checklist.name || `Checklist ${checklist.id}`) : `Checklist ${checklist}` }}
                </span>
                <span class="ml-2 text-yellow-400" v-if="typeof checklist === 'object' && checklist !== null && checklist.liked_by_me">⭐️ You liked this</span>
                <span class="ml-2 text-yellow-400" v-else-if="typeof checklist === 'object' && checklist !== null && (checklist.like_count ?? 0) > 0">⭐️ Liked by {{ checklist.like_count ?? 0 }} people</span>
                <span class="ml-2 text-gray-400" v-else>(No likes)</span>
                <button class="ml-4 btn-secondary px-2 py-1 text-xs" @click="onLikeChecklist(checklist)">
                  {{ typeof checklist === 'object' && checklist !== null && checklist.liked_by_me ? 'Unlike' : 'Like' }}
                </button>
                <button class="ml-2 btn-secondary px-2 py-1 text-xs" @click="onUnlinkChecklist(checklist)">
                  Unlink
                </button>
              </li>
            </RecycleScroller>
            <div v-if="filteredLinkedChecklists.length === 0" class="text-gray-400 text-center py-4">No linked checklists.</div>
          </div>
        </template>

        <!-- Review Status Tab -->
        <template v-if="activeTab === 'review'">
          <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Review & Quality Status</h2>
          <!-- Specs with Status -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Specifications with Status</h2>
              <button v-if="project" @click="router.push(`/specs?project=${project.id}`)" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Spec
              </button>
            </div>
            
            <div v-if="dashboardData.specs.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Specifications Yet</h3>
              <p class="text-gray-500 mb-6">Add specifications to this project to get started</p>
              <button v-if="project" @click="router.push(`/specs?project=${project.id}`)" class="btn-primary">
                Add First Spec
              </button>
            </div>
            <div v-else class="space-y-4">
              <div v-for="spec in dashboardData.specs" :key="spec.id" class="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ spec.name || spec.file_name || `Spec ${spec.id}` }}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(spec.status)"></span>
                        {{ spec.status }}
                      </span>
                      <span v-if="spec.reviewer">Reviewed by: {{ spec.reviewer }}</span>
                      <span v-if="spec.timestamp">{{ formatDate(spec.timestamp) }}</span>
                    </div>
                    <p v-if="spec.comments" class="mt-2 text-gray-600 dark:text-gray-300">{{ spec.comments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Checklists with Status -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Checklists with Status</h2>
              <button v-if="project" @click="router.push(`/checklists?project=${project.id}`)" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Checklist
              </button>
            </div>
            
            <div v-if="dashboardData.checklists.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Checklists Yet</h3>
              <p class="text-gray-500 mb-6">Add checklists to this project to get started</p>
              <button v-if="project" @click="router.push(`/checklists?project=${project.id}`)" class="btn-primary">
                Add First Checklist
              </button>
            </div>
            <div v-else class="space-y-4">
              <div v-for="checklist in dashboardData.checklists" :key="checklist.id" class="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ checklist.name || `Checklist ${checklist.id}` }}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(checklist.status)"></span>
                        {{ checklist.status }}
                      </span>
                      <span v-if="checklist.reviewer">Reviewed by: {{ checklist.reviewer }}</span>
                      <span v-if="checklist.timestamp">{{ formatDate(checklist.timestamp) }}</span>
                    </div>
                    <p v-if="checklist.comments" class="mt-2 text-gray-600 dark:text-gray-300">{{ checklist.comments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Spec Lints with Status -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Spec Lints with Status</h2>
              <button v-if="project" @click="router.push(`/speclint?project=${project.id}`)" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Run Lint
              </button>
            </div>
            
            <div v-if="dashboardData.specLints.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Spec Lints Yet</h3>
              <p class="text-gray-500 mb-6">Run spec lints to check for issues</p>
              <button v-if="project" @click="router.push(`/speclint?project=${project.id}`)" class="btn-primary">
                Run First Lint
              </button>
            </div>
            <div v-else class="space-y-4">
              <div v-for="lint in dashboardData.specLints" :key="lint.id" class="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ lint.name || `Lint ${lint.id}` }}</h3>
                    <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(lint.status)"></span>
                        {{ lint.status }}
                      </span>
                      <span v-if="lint.reviewer">Reviewed by: {{ lint.reviewer }}</span>
                      <span v-if="lint.timestamp">{{ formatDate(lint.timestamp) }}</span>
                    </div>
                    <p v-if="lint.comments" class="mt-2 text-gray-600 dark:text-gray-300">{{ lint.comments }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>

  <!-- Add ProjectEditModal -->
  <ProjectEditModal
    v-if="showEditModal && project"
    :project="project"
    @close="closeEditModal"
    @updated="handleProjectUpdated"
  />

  <!-- Link Modal (Reusable for Specs and Checklists) -->
  <LinkModal
    v-if="showLinkModal"
    :type="linkModalType"
    :available-items="linkModalType === 'spec' ? filteredUnlinkedSpecs : filteredUnlinkedChecklists"
    :on-link="linkModalType === 'spec' ? linkSelectedSpec : linkSelectedChecklist"
    :on-close="closeLinkModal"
  />
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore, type Project as BaseProject } from '@/stores/projects'
import ProjectEditModal from '@/components/Projects/ProjectEditModal.vue'
import { useMetadataStore } from '@/stores/metadata'
import { useAuthStore } from '@/stores/auth'
import LinkModal from '@/components/LinkModal.vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { fetchProjectDashboard } from '@/utils/auth-requests'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const metadataStore = useMetadataStore()
const authStore = useAuthStore()

// Extend the Project type to include optional specs and checklists arrays
interface LinkedSpec {
  id: string | number
  name?: string
  file_name?: string
  liked_by_me?: boolean
  like_count?: number
}
interface LinkedChecklist {
  id: string | number
  name?: string
  liked_by_me?: boolean
  like_count?: number
}

type Project = BaseProject & {
  specs?: LinkedSpec[]
  checklists?: LinkedChecklist[]
}

const project = ref<Project | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Dashboard data types
interface DashboardItem {
  id: string | number
  name?: string
  file_name?: string
  status: string
  reviewer?: string
  timestamp?: string
  comments?: string
}

interface QualityScore {
  overall_score: number
  approval_rate: number
  completion_rate: number
  pass_rate: number
}

// Dashboard data
const dashboardData = ref<{
  specs: DashboardItem[]
  checklists: DashboardItem[]
  specLints: DashboardItem[]
  qualityScore: QualityScore | null
}>({
  specs: [],
  checklists: [],
  specLints: [],
  qualityScore: null
})
const dashboardLoading = ref(false)
const dashboardError = ref<string | null>(null)

const showEditModal = ref(false)

const selectedFilters = ref({
  platform: '',
  edaTool: '',
  type: '',
  status: ''
})

function handleFilter(key: keyof typeof selectedFilters.value, value: string) {
  selectedFilters.value[key] = selectedFilters.value[key] === value ? '' : value
}

const filteredSpecs = computed(() => {
  // If project.value.specs does not exist, return an empty array
  const specs = (project.value && Array.isArray((project.value as any).specs)) ? (project.value as any).specs : [];
  return specs.filter((spec: any) => {
    return (
      (!selectedFilters.value.platform || spec.platform === selectedFilters.value.platform) &&
      (!selectedFilters.value.edaTool || spec.edaTool === selectedFilters.value.edaTool) &&
      (!selectedFilters.value.type || spec.type === selectedFilters.value.type) &&
      (!selectedFilters.value.status || spec.status === selectedFilters.value.status)
    )
  })
})

const pendingReviewsCount = computed(() => {
  return filteredSpecs.value.filter((spec: any) => spec.status === 'Pending Review').length;
});

const vendorPartnersCount = computed(() => {
  // If specs have a vendor field, count unique vendors
  const vendors = filteredSpecs.value.map((spec: any) => spec.vendor).filter(Boolean);
  return Array.from(new Set(vendors)).length;
});

const qualityScore = computed(() => {
  if (!filteredSpecs.value.length) return 0;
  const passed = filteredSpecs.value.filter((spec: any) => spec.status === 'Passed').length;
  return Math.round((passed / filteredSpecs.value.length) * 100);
});

// Update loadProject to use the enhanced /linked-content endpoint
const loadProject = async () => {
  const projectId = route.params.id as string
  if (!projectId) {
    error.value = 'Project ID is required'
    return
  }

  loading.value = true
  error.value = null
  try {
    const res = await fetch(`/api/v1/projects/${projectId}/linked-content`, {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    if (!res.ok) throw new Error(await res.text() || 'Failed to load project')
    const projectData = await res.json()
    project.value = projectData
    if (!metadataStore.platforms.length) await metadataStore.fetchMetadata()
    
    // Load dashboard data
    await loadDashboardData(projectId)
  } catch (err: any) {
    error.value = err.message || 'Failed to load project'
  } finally {
    loading.value = false
  }
}

// Load dashboard data from all required endpoints
const loadDashboardData = async (projectId: string) => {
  dashboardLoading.value = true
  dashboardError.value = null
  
  try {
    const data = await fetchProjectDashboard(projectId)
    dashboardData.value = data
  } catch (err: any) {
    dashboardError.value = err.message || 'Failed to load dashboard data'
    console.error('Dashboard data loading error:', err)
  } finally {
    dashboardLoading.value = false
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'planning':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'completed':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    case 'archived':
      return 'bg-red-500/20 text-red-400 border border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

// Helper function to get status color for dashboard items
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'passed':
    case 'completed':
      return 'bg-green-500'
    case 'pending':
    case 'in_review':
    case 'review':
      return 'bg-yellow-500'
    case 'rejected':
    case 'failed':
    case 'error':
      return 'bg-red-500'
    case 'draft':
    case 'in_progress':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

// Helper function to format dates
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const editProject = () => {
  showEditModal.value = true
}

const handleProjectUpdated = async () => {
  showEditModal.value = false
  await loadProject()
}

const closeEditModal = () => {
  showEditModal.value = false
}

const deleteProject = async () => {
  if (!project.value) return
  
  if (confirm(`Are you sure you want to delete "${project.value.name}"?`)) {
    try {
      await projectsStore.deleteProject(project.value.id)
      router.push('/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }
}

function onMetaChipClick(type: string, value: string) {
  console.log('Clicked', type, value)
  // You can implement filtering or other actions here
}

const specLikes = ref<Record<string, { likedByUser: boolean; likeCount: number }>>({})
const checklistLikes = ref<Record<string, { likedByUser: boolean; likeCount: number }>>({})
// TODO: Replace with real API calls for likes
onMounted(() => {
  loadProject()
  // Mock: populate likes for demo
  specLikes.value = { '1': { likedByUser: true, likeCount: 1 }, '2': { likedByUser: false, likeCount: 3 } }
  checklistLikes.value = { '10': { likedByUser: true, likeCount: 1 }, '11': { likedByUser: false, likeCount: 2 } }
})

// Add empty handlers for like/unlike and unlink actions (to be wired to real API later)
async function onUnlinkSpec(spec: any) {
  if (!project.value) return
  const projectId = project.value.id
  const specId = typeof spec === 'object' && spec !== null ? spec.id : spec
  try {
    await fetch(`/api/v1/projects/${projectId}/specs/${specId}`, {
      method: 'DELETE',
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    await loadProject()
  } catch (e: any) {
    alert('Failed to unlink spec: ' + (e.message || e))
  }
}
async function onUnlinkChecklist(checklist: any) {
  if (!project.value) return
  const projectId = project.value.id
  const checklistId = typeof checklist === 'object' && checklist !== null ? checklist.id : checklist
  try {
    await fetch(`/api/v1/projects/${projectId}/checklists/${checklistId}`, {
      method: 'DELETE',
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    await loadProject()
  } catch (e: any) {
    alert('Failed to unlink checklist: ' + (e.message || e))
  }
}
// Like/unlike handlers will be implemented in Phase 2
async function onLikeSpec(spec: any) {
  if (!project.value) return
  const projectId = project.value.id
  const specId = typeof spec === 'object' && spec !== null ? spec.id : spec
  try {
    if (spec.liked_by_me) {
      await fetch(`/api/v1/projects/specifications/${specId}/like`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    } else {
      await fetch(`/api/v1/projects/specifications/${specId}/like`, {
        method: 'POST',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    }
    await loadProject()
  } catch (e: any) {
    alert('Failed to update like: ' + (e.message || e))
  }
}
async function onLikeChecklist(checklist: any) {
  if (!project.value) return
  const checklistId = typeof checklist === 'object' && checklist !== null ? checklist.id : checklist
  try {
    if (checklist.liked_by_me) {
      await fetch(`/api/v1/projects/checklists/${checklistId}/like`, {
        method: 'DELETE',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    } else {
      await fetch(`/api/v1/projects/checklists/${checklistId}/like`, {
        method: 'POST',
        headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
      })
    }
    await loadProject()
  } catch (e: any) {
    alert('Failed to update like: ' + (e.message || e))
  }
}

const showLinkModal = ref(false)
const linkModalType = ref<'spec' | 'checklist'>('spec')
function openLinkModal(type: 'spec' | 'checklist') {
  linkModalType.value = type
  showLinkModal.value = true
}
function closeLinkModal() {
  showLinkModal.value = false
}

const specSearch = ref('')
const checklistSearch = ref('')
const selectedSpecToLink = ref<string | number | null>(null)
const selectedChecklistToLink = ref<string | number | null>(null)
const allSpecs = ref<LinkedSpec[]>([])
const allChecklists = ref<LinkedChecklist[]>([])

// Fetch all specs and checklists on mount (for linking)
onMounted(async () => {
  loadProject()
  try {
    const specsRes = await fetch('/api/v1/specifications/', { headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined })
    if (specsRes.ok) allSpecs.value = await specsRes.json()
    const checklistsRes = await fetch('/api/v1/checklists/', { headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined })
    if (checklistsRes.ok) allChecklists.value = await checklistsRes.json()
  } catch {}
})

const filteredUnlinkedSpecs = computed(() => {
  const linkedIds = new Set((project.value?.specs ?? project.value?.spec_ids ?? []).map((s: any) => typeof s === 'object' && s !== null ? s.id : s))
  return allSpecs.value.filter(spec => !linkedIds.has(spec.id) && (spec.name?.toLowerCase().includes(specSearch.value.toLowerCase()) || spec.file_name?.toLowerCase().includes(specSearch.value.toLowerCase()) || String(spec.id).includes(specSearch.value)))
})
const filteredUnlinkedChecklists = computed(() => {
  const linkedIds = new Set((project.value?.checklists ?? project.value?.checklist_ids ?? []).map((c: any) => typeof c === 'object' && c !== null ? c.id : c))
  return allChecklists.value.filter(checklist => !linkedIds.has(checklist.id) && (checklist.name?.toLowerCase().includes(checklistSearch.value.toLowerCase()) || String(checklist.id).includes(checklistSearch.value)))
})

async function linkSelectedSpec(item: LinkedSpec) {
  if (!project.value) return
  const projectId = project.value.id
  try {
    await fetch(`/api/v1/projects/${projectId}/specs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify({ specification_id: item.id })
    })
    closeLinkModal()
    await loadProject()
  } catch (e: any) {
    alert('Failed to link spec: ' + (e.message || e))
  }
}
async function linkSelectedChecklist(item: LinkedChecklist) {
  if (!project.value) return
  const projectId = project.value.id
  try {
    await fetch(`/api/v1/projects/${projectId}/checklists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : {})
      },
      body: JSON.stringify({ checklist_id: item.id })
    })
    closeLinkModal()
    await loadProject()
  } catch (e: any) {
    alert('Failed to link checklist: ' + (e.message || e))
  }
}

const specSearchTerm = ref('')
const checklistSearchTerm = ref('')
const filteredLinkedSpecs = computed(() => {
  const list = project.value?.specs ?? project.value?.spec_ids ?? []
  return list.filter(spec => {
    const name = typeof spec === 'object' && spec !== null ? (spec.name || spec.file_name || `Spec ${spec.id}`) : `Spec ${spec}`
    return name.toLowerCase().includes(specSearchTerm.value.toLowerCase())
  })
})
const filteredLinkedChecklists = computed(() => {
  const list = project.value?.checklists ?? project.value?.checklist_ids ?? []
  return list.filter(checklist => {
    const name = typeof checklist === 'object' && checklist !== null ? (checklist.name || `Checklist ${checklist.id}`) : `Checklist ${checklist}`
    return name.toLowerCase().includes(checklistSearchTerm.value.toLowerCase())
  })
})

const selectedSpecIds = ref<(string | number)[]>([])
const selectedChecklistIds = ref<(string | number)[]>([])
function toggleSpecSelection(id: string | number) {
  const idx = selectedSpecIds.value.indexOf(id)
  if (idx === -1) selectedSpecIds.value.push(id)
  else selectedSpecIds.value.splice(idx, 1)
}
function toggleChecklistSelection(id: string | number) {
  const idx = selectedChecklistIds.value.indexOf(id)
  if (idx === -1) selectedChecklistIds.value.push(id)
  else selectedChecklistIds.value.splice(idx, 1)
}
async function batchUnlinkSpecs() {
  if (!project.value || !selectedSpecIds.value.length) return
  const projectId = project.value.id
  for (const id of selectedSpecIds.value) {
    await onUnlinkSpec(id)
  }
  selectedSpecIds.value = []
}
async function batchUnlinkChecklists() {
  if (!project.value || !selectedChecklistIds.value.length) return
  const projectId = project.value.id
  for (const id of selectedChecklistIds.value) {
    await onUnlinkChecklist(id)
  }
  selectedChecklistIds.value = []
}

// Tab state for enterprise UX
const tabs = [
  { key: 'manage', label: 'Manage Project' },
  { key: 'review', label: 'Review Status' }
]
const activeTab = ref<string>('manage')
</script> 