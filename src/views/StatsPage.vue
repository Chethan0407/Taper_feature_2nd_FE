<template>
  <div class="min-h-screen app-page">
    <Sidebar />
    <div class="ml-64">
      <Header />

      <main class="p-8">
        <div
          v-if="adminAccessNotice"
          class="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100"
          role="status"
        >
          <p class="font-semibold">System Usage is superuser-only</p>
          <p class="mt-1 text-sm opacity-90">
            You were redirected because this account is not a superuser.
          </p>
          <button type="button" class="mt-3 text-sm font-medium text-neon-blue hover:underline" @click="dismissAdminNotice">
            Dismiss
          </button>
        </div>

        <!-- Live header -->
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4 page-enter">
          <div>
            <p class="mb-1 text-sm text-slate-500 dark:text-gray-400">
              Welcome back<span v-if="authStore.user?.name">, {{ authStore.user.name }}</span>
              <span class="ml-2 inline-flex items-center gap-1.5 text-emerald-400">
                <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
            </p>
            <h1 class="page-title-gradient mb-1">Stats</h1>
            <p class="page-subtitle">Live program metrics — specs, checklists, and readiness at a glance</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="btn-secondary px-4 py-2 text-sm" @click="router.push('/speclint')">
              Run SpecLint
            </button>
            <button type="button" class="btn-primary px-4 py-2 text-sm" @click="goToProjects">
              Open Projects
            </button>
          </div>
        </div>

        <!-- Live colorful KPIs -->
        <section class="mb-8 page-enter">
          <div v-if="statsError" class="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p class="mb-2 text-sm text-red-300">{{ statsError }}</p>
            <button type="button" class="btn-primary px-3 py-1.5 text-sm" @click="fetchStats">Try again</button>
          </div>
          <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <button
              type="button"
              class="stat-tile !text-left transition hover:border-emerald-400/50"
              :class="{ 'ring-2 ring-emerald-400/40': isFilterSelected('status', 'Approved') }"
              @click="handleFilter('status', 'Approved')"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Approved</p>
              <p v-if="loadingStats && stats.approved_specs == null" class="mt-2 h-8 w-12 animate-pulse rounded bg-slate-700/60" />
              <p v-else class="mt-1 font-display text-3xl font-bold text-emerald-400">{{ stats.approved_specs ?? 0 }}</p>
            </button>
            <button
              type="button"
              class="stat-tile !text-left transition hover:border-amber-400/50"
              :class="{ 'ring-2 ring-amber-400/40': isFilterSelected('status', 'Pending') }"
              @click="handleFilter('status', 'Pending')"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Pending</p>
              <p v-if="loadingStats && stats.pending_specs == null" class="mt-2 h-8 w-12 animate-pulse rounded bg-slate-700/60" />
              <p v-else class="mt-1 font-display text-3xl font-bold text-amber-300">{{ stats.pending_specs ?? 0 }}</p>
            </button>
            <button
              type="button"
              class="stat-tile !text-left transition hover:border-red-400/50"
              :class="{ 'ring-2 ring-red-400/40': isFilterSelected('status', 'Rejected') }"
              @click="handleFilter('status', 'Rejected')"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Rejected</p>
              <p v-if="loadingStats && stats.rejected_specs == null" class="mt-2 h-8 w-12 animate-pulse rounded bg-slate-700/60" />
              <p v-else class="mt-1 font-display text-3xl font-bold text-red-400">{{ stats.rejected_specs ?? 0 }}</p>
            </button>
            <button type="button" class="stat-tile !text-left transition hover:border-sky-400/40" @click="router.push('/vendors')">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Vendors</p>
              <p v-if="loadingStats && stats.vendor_partners == null" class="mt-2 h-8 w-12 animate-pulse rounded bg-slate-700/60" />
              <p v-else class="mt-1 font-display text-3xl font-bold text-sky-300">{{ stats.vendor_partners ?? 0 }}</p>
            </button>
            <div class="stat-tile !text-left">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Quality</p>
              <p v-if="loadingStats && stats.quality_score == null" class="mt-2 h-8 w-16 animate-pulse rounded bg-slate-700/60" />
              <p v-else class="mt-1 font-display text-3xl font-bold text-fuchsia-300">{{ stats.quality_score ?? 0 }}%</p>
            </div>
          </div>
        </section>

        <!-- Quick links -->
        <section class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 page-enter">
          <router-link
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="group rounded-2xl border border-slate-700 bg-dark-900/80 px-4 py-3 transition hover:border-transparent"
            :class="link.hover"
          >
            <p class="text-sm font-semibold text-white" :class="link.text">{{ link.label }}</p>
            <p class="mt-0.5 text-xs text-slate-400">{{ link.hint }}</p>
          </router-link>
        </section>

        <!-- Filters -->
        <section class="settings-card mb-6 page-enter">
          <div class="settings-card-body !gap-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 class="text-base font-semibold text-white">Browse specs</h2>
                <p class="text-sm text-slate-400">
                  Showing
                  <span class="font-medium text-slate-200">{{ activeFilterSummary }}</span>
                </p>
              </div>
              <button
                v-if="hasAnyFilter"
                type="button"
                class="text-sm font-medium text-neon-blue hover:underline"
                @click="clearAllFilters"
              >
                Clear filters
              </button>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-400">Platform</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="platform in metadataStore.platforms"
                    :key="platform"
                    type="button"
                    class="rounded-md border px-2.5 py-1 text-xs font-medium transition"
                    :class="isFilterSelected('platform', platform)
                      ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-sky-500/40'"
                    @click="handleFilter('platform', platform)"
                  >
                    {{ platform }}
                  </button>
                </div>
              </div>
              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">EDA tool</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="edaTool in metadataStore.edaTools"
                    :key="edaTool"
                    type="button"
                    class="rounded-md border px-2.5 py-1 text-xs font-medium transition"
                    :class="isFilterSelected('edaTool', edaTool)
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/40'"
                    @click="handleFilter('edaTool', edaTool)"
                  >
                    {{ edaTool }}
                  </button>
                </div>
              </div>
              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-400">Type</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="type in metadataStore.types"
                    :key="type"
                    type="button"
                    class="rounded-md border px-2.5 py-1 text-xs font-medium transition"
                    :class="isFilterSelected('type', type)
                      ? 'border-violet-400 bg-violet-500/20 text-violet-300'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-violet-500/40'"
                    @click="handleFilter('type', type)"
                  >
                    {{ type }}
                  </button>
                </div>
              </div>
              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-400">Status</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="status in ['Approved', 'Pending', 'Rejected']"
                    :key="status"
                    type="button"
                    class="rounded-md border px-2.5 py-1 text-xs font-medium transition"
                    :class="isFilterSelected('status', status)
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-500/40'"
                    @click="handleFilter('status', status)"
                  >
                    {{ status }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Live specs preview -->
        <section class="settings-card page-enter">
          <div class="settings-card-body">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-base font-semibold text-white">Matching specifications</h2>
              <router-link to="/specs" class="text-sm font-medium text-neon-blue hover:underline">View all →</router-link>
            </div>

            <div v-if="metadataStore.loading || showTapeoutsLoading" class="space-y-2 py-4">
              <div v-for="i in 4" :key="i" class="h-10 animate-pulse rounded-lg bg-slate-800/80" />
            </div>
            <div v-else-if="tapeoutsError" class="py-8 text-center">
              <p class="mb-3 text-sm text-red-400">{{ tapeoutsError }}</p>
              <button type="button" class="btn-primary px-4 py-2 text-sm" @click="fetchTapeouts">Try again</button>
            </div>
            <div v-else-if="!tapeouts.length" class="rounded-xl border border-dashed border-slate-600 py-10 text-center">
              <p class="text-sm text-slate-400">No specs match these filters.</p>
              <button type="button" class="mt-3 text-sm font-medium text-neon-blue hover:underline" @click="router.push('/specs')">
                Go to Specs
              </button>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-500">
                    <th class="px-2 py-2 font-semibold">Name</th>
                    <th class="px-2 py-2 font-semibold">Status</th>
                    <th class="px-2 py-2 font-semibold">Platform</th>
                    <th class="px-2 py-2 font-semibold">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="spec in previewSpecs"
                    :key="spec.id"
                    class="border-b border-slate-800/80 last:border-0"
                  >
                    <td class="px-2 py-2.5 font-medium text-white">
                      {{ spec.name || spec.title || `Spec ${spec.id}` }}
                    </td>
                    <td class="px-2 py-2.5">
                      <span :class="statusBadgeClass(spec.status)">{{ spec.status || 'Unknown' }}</span>
                    </td>
                    <td class="px-2 py-2.5 text-slate-400">{{ spec.platform || '—' }}</td>
                    <td class="px-2 py-2.5 text-slate-500">
                      {{ formatSpecDate(spec.uploaded_on || spec.updated_at || spec.created_at) }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-if="tapeouts.length > previewSpecs.length" class="mt-3 text-xs text-slate-500">
                Showing {{ previewSpecs.length }} of {{ tapeouts.length }} — open Specs for the full list.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { useMetadataStore } from '@/stores/metadata'
import { useSpecificationsStore } from '@/stores/specifications'
import { fetchDashboardJson } from '@/utils/shell-data'
import {
  createRequestScope,
  isAbortError,
} from '@/utils/request-coordinator'
import { statusBadgeClass } from '@/utils/status-badge'

const pageScope = createRequestScope('stats-page')
const STATS_POLL_MS = 60_000

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const adminAccessNotice = computed(() => route.query.notice === 'admin_required')
function dismissAdminNotice() {
  router.replace({ path: '/dashboard' })
}
const metadataStore = useMetadataStore()
const specificationsStore = useSpecificationsStore()

const goToProjects = () => {
  router.push('/projects')
}

const quickLinks = [
  { label: 'Projects', to: '/projects', hint: 'Browse & create', text: 'group-hover:text-sky-300', hover: 'hover:bg-sky-500/10' },
  { label: 'Specifications', to: '/specs', hint: 'Review pipeline', text: 'group-hover:text-emerald-300', hover: 'hover:bg-emerald-500/10' },
  { label: 'Vendors', to: '/vendors', hint: 'Partner network', text: 'group-hover:text-violet-300', hover: 'hover:bg-violet-500/10' },
  { label: 'Checklists', to: '/checklists', hint: 'Active work', text: 'group-hover:text-amber-300', hover: 'hover:bg-amber-500/10' },
  { label: 'SpecLint', to: '/speclint', hint: 'Validate docs', text: 'group-hover:text-fuchsia-300', hover: 'hover:bg-fuchsia-500/10' },
] as const

type SpecPreview = {
  id?: string | number
  name?: string
  title?: string
  status?: string
  platform?: string
  uploaded_on?: string
  updated_at?: string
  created_at?: string
}

const stats = ref<{ approved_specs?: number; pending_specs?: number; rejected_specs?: number; vendor_partners?: number; quality_score?: number }>({})
const loadingStats = ref(true)
const statsError = ref('')
let statsInterval: number | undefined

const tapeouts = ref<SpecPreview[]>([])
const tapeoutsLoading = ref(false)
const showTapeoutsLoading = ref(false)
let tapeoutsLoadingDelay: ReturnType<typeof setTimeout> | null = null
let tapeoutsLoadingMin: ReturnType<typeof setTimeout> | null = null
const tapeoutsError = ref('')

const selectedFilters = ref({
  platform: '',
  edaTool: '',
  type: '',
  status: '',
})

const activeFilterSummary = computed(() => {
  const parts: string[] = []
  if (selectedFilters.value.platform) parts.push(selectedFilters.value.platform)
  if (selectedFilters.value.edaTool) parts.push(selectedFilters.value.edaTool)
  if (selectedFilters.value.type) parts.push(selectedFilters.value.type)
  if (selectedFilters.value.status) parts.push(selectedFilters.value.status)
  return parts.length ? parts.join(' • ') : 'All specs'
})

const hasAnyFilter = computed(() =>
  Boolean(
    selectedFilters.value.platform ||
      selectedFilters.value.edaTool ||
      selectedFilters.value.type ||
      selectedFilters.value.status,
  ),
)

function clearAllFilters() {
  selectedFilters.value = { platform: '', edaTool: '', type: '', status: '' }
  fetchStats()
  fetchTapeouts()
}

const previewSpecs = computed(() => (Array.isArray(tapeouts.value) ? tapeouts.value.slice(0, 8) : []))

function formatSpecDate(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const fetchStats = async () => {
  loadingStats.value = true
  statsError.value = ''
  try {
    const params = new URLSearchParams()
    if (selectedFilters.value.platform) params.append('platform', selectedFilters.value.platform)
    if (selectedFilters.value.edaTool) params.append('eda_tool', selectedFilters.value.edaTool)
    if (selectedFilters.value.type) params.append('type', selectedFilters.value.type)
    if (selectedFilters.value.status) params.append('status', selectedFilters.value.status)

    const queryString = params.toString()
    stats.value = await fetchDashboardJson(queryString, pageScope.signal)
    statsError.value = ''
  } catch (e: any) {
    if (isAbortError(e)) return
    // Soft-empty on 404-style messages from shell helper
    if (String(e?.message || '').includes('404')) {
      stats.value = {
        approved_specs: 0,
        pending_specs: 0,
        rejected_specs: 0,
        vendor_partners: 0,
        quality_score: undefined,
      }
      statsError.value = ''
      return
    }
    statsError.value = e.message || 'Unable to load dashboard stats.'
    console.error('Error fetching dashboard stats:', e)
    window.dispatchEvent(new CustomEvent('toast', { detail: { message: statsError.value, type: 'error' } }))
  } finally {
    loadingStats.value = false
  }
}

const fetchTapeouts = async () => {
  if (tapeoutsLoadingDelay) clearTimeout(tapeoutsLoadingDelay)
  if (tapeoutsLoadingMin) clearTimeout(tapeoutsLoadingMin)
  tapeoutsLoading.value = true
  tapeoutsLoadingDelay = setTimeout(() => {
    showTapeoutsLoading.value = true
    tapeoutsLoadingMin = setTimeout(() => {}, 400)
  }, 200)
  tapeoutsError.value = ''
  try {
    const filters: Record<string, string> = {}
    if (selectedFilters.value.platform) filters.platform = selectedFilters.value.platform
    if (selectedFilters.value.edaTool) filters.eda_tool = selectedFilters.value.edaTool
    if (selectedFilters.value.type) filters.type = selectedFilters.value.type
    if (selectedFilters.value.status) filters.status = selectedFilters.value.status

    await specificationsStore.loadSpecifications(filters)
    tapeouts.value = (specificationsStore.specifications || []) as SpecPreview[]
  } catch (e: any) {
    const errorMessage = e.message || 'Failed to fetch specifications'

    if (errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found')) {
      tapeouts.value = []
      tapeoutsError.value = ''
    } else {
      tapeoutsError.value = errorMessage
      console.error('Error fetching tapeouts:', e)
    }
  } finally {
    tapeoutsLoading.value = false
    if (tapeoutsLoadingDelay) clearTimeout(tapeoutsLoadingDelay)
    if (showTapeoutsLoading.value) {
      setTimeout(() => {
        showTapeoutsLoading.value = false
      }, 400)
    } else {
      showTapeoutsLoading.value = false
    }
  }
}

const handleSpecDeleted = () => {
  fetchStats()
  fetchTapeouts()
}

onMounted(async () => {
  pageScope.begin()
  await authStore.checkAuth()

  if (!metadataStore.platforms.length) await metadataStore.fetchMetadata()
  // Stage: dashboard shell first, then specs list
  await fetchStats()
  if (!pageScope.signal.aborted) {
    await fetchTapeouts()
  }
  // Bounded poll — was 10s which compounded with nav fan-out under load
  statsInterval = window.setInterval(() => {
    if (!pageScope.signal.aborted) void fetchStats()
  }, STATS_POLL_MS)

  window.addEventListener('specification-deleted', handleSpecDeleted)
})

onUnmounted(() => {
  pageScope.abort()
  if (statsInterval) clearInterval(statsInterval)
  window.removeEventListener('specification-deleted', handleSpecDeleted)
})

const handleFilter = (key: keyof typeof selectedFilters.value, value: string) => {
  selectedFilters.value[key] = selectedFilters.value[key] === value ? '' : value
  fetchStats()
  fetchTapeouts()
}

const isFilterSelected = (key: keyof typeof selectedFilters.value, value: string) =>
  selectedFilters.value[key] === value
</script>
