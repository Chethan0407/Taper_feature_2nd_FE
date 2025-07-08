<template>
  <div class="min-h-screen bg-light-50 dark:bg-dark-950">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
      <Header />
      
      <!-- Dashboard Content -->
      <main class="p-8">
        <!-- Welcome Banner -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gradient mb-4">
            Streamline Your Tapeout Workflow
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
            Welcome back<span v-if="authStore.user?.name">, {{ authStore.user.name }}</span>. Manage your semiconductor design specifications, 
            automate quality checks, and collaborate with vendors all in one place.
          </p>
        </div>

        <!-- CTA Section -->
        <div class="mb-12">
          <button class="btn-primary text-lg px-8 py-4 animate-glow" @click="goToProjects">
            Get Started
          </button>
        </div>

        <!-- Chip Illustration -->
        <div class="mb-12 flex justify-center">
          <div class="relative w-64 h-64">
            <!-- Animated Circuit Pattern -->
            <svg class="w-full h-full" viewBox="0 0 256 256" fill="none">
              <!-- Grid Pattern -->
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(0,212,255,0.1)" stroke-width="1"/>
                </pattern>
              </defs>
              <rect width="256" height="256" fill="url(#grid)"/>
              
              <!-- Circuit Lines -->
              <path d="M 32 64 L 96 64 L 96 32 L 160 32 L 160 96 L 224 96" 
                    stroke="rgba(0,212,255,0.6)" stroke-width="2" fill="none" 
                    class="animate-pulse-slow"/>
              <path d="M 64 128 L 128 128 L 128 160 L 192 160 L 192 224" 
                    stroke="rgba(139,92,246,0.6)" stroke-width="2" fill="none" 
                    class="animate-pulse-slow" style="animation-delay: 1s"/>
              
              <!-- Connection Points -->
              <circle cx="32" cy="64" r="4" fill="rgba(0,212,255,0.8)" class="animate-pulse"/>
              <circle cx="96" cy="64" r="4" fill="rgba(0,212,255,0.8)" class="animate-pulse"/>
              <circle cx="160" cy="32" r="4" fill="rgba(0,212,255,0.8)" class="animate-pulse"/>
              <circle cx="224" cy="96" r="4" fill="rgba(0,212,255,0.8)" class="animate-pulse"/>
              <circle cx="64" cy="128" r="4" fill="rgba(139,92,246,0.8)" class="animate-pulse"/>
              <circle cx="192" cy="224" r="4" fill="rgba(139,92,246,0.8)" class="animate-pulse"/>
            </svg>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <!-- SpecLint Engine Card -->
          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">SpecLint Engine</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  Automatically validate your specifications for compliance, completeness, and best practices.
                </p>
                <button class="text-neon-blue hover:text-neon-blue/80 font-medium transition-colors" @click="router.push('/speclint')">
                  Try SpecLint →
                </button>
              </div>
            </div>
          </div>

          <!-- Checklist Automation Card -->
          <div class="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 group">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Checklist Automation</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  Create, assign, and track approval workflows with automated reminders and notifications.
                </p>
                <button class="text-neon-green hover:text-neon-green/80 font-medium transition-colors" @click="router.push('/checklists')">
                  Create Checklist →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12 mt-12">
          <!-- Platform Card -->
          <div class="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-neon-blue dark:to-neon-purple rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">Platform</span>
            </div>
            <div class="flex flex-wrap gap-3 mt-2">
              <button v-for="platform in metadataStore.platforms" :key="platform"
                @click="handleFilter('platform', platform)"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-semibold border shadow-sm transition-colors',
                  isFilterSelected('platform', platform)
                    ? 'bg-blue-600 text-white border-blue-600 dark:bg-neon-blue dark:text-white dark:border-neon-blue'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 dark:hover:bg-dark-700'
                ]">
                {{ platform }}
              </button>
            </div>
          </div>
          <!-- EDA Tool Card -->
          <div class="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 dark:from-neon-green dark:to-neon-blue rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">EDA Tool</span>
            </div>
            <div class="flex flex-wrap gap-3 mt-2">
              <button v-for="edaTool in metadataStore.edaTools" :key="edaTool"
                @click="handleFilter('edaTool', edaTool)"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-semibold border shadow-sm transition-colors',
                  isFilterSelected('edaTool', edaTool)
                    ? 'bg-green-600 text-white border-green-600 dark:bg-neon-green dark:text-white dark:border-neon-green'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 dark:hover:bg-dark-700'
                ]">
                {{ edaTool }}
              </button>
            </div>
          </div>
          <!-- Type Card -->
          <div class="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-neon-purple dark:to-neon-pink rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">Type</span>
            </div>
            <div class="flex flex-wrap gap-3 mt-2">
              <button v-for="type in metadataStore.types" :key="type"
                @click="handleFilter('type', type)"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-semibold border shadow-sm transition-colors',
                  isFilterSelected('type', type)
                    ? 'bg-purple-600 text-white border-purple-600 dark:bg-neon-purple dark:text-white dark:border-neon-purple'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-purple-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 dark:hover:bg-dark-700'
                ]">
                {{ type }}
              </button>
            </div>
          </div>
          <!-- Status Card -->
          <div class="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-400 dark:to-yellow-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">Status</span>
            </div>
            <div class="flex flex-wrap gap-3 mt-2">
              <button v-for="status in ['Approved', 'Pending', 'Rejected']" :key="status"
                @click="handleFilter('status', status)"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-semibold border shadow-sm transition-colors',
                  isFilterSelected('status', status)
                    ? 'bg-yellow-500 text-white border-yellow-500 dark:bg-yellow-400 dark:text-white dark:border-yellow-400'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-yellow-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 dark:hover:bg-dark-700'
                ]">
                {{ status }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading state for tapeouts or metadata -->
        <div v-if="metadataStore.loading || tapeoutsLoading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <svg class="w-12 h-12 text-neon-blue animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <p class="text-gray-400">Loading data...</p>
          </div>
        </div>
        <div v-else-if="tapeoutsError" class="text-center py-12">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="text-xl font-semibold text-red-400 mb-2">Failed to Load Tapeouts</h3>
          <p class="text-gray-400 mb-4">{{ tapeoutsError }}</p>
          <button @click="fetchTapeouts" class="btn-primary">Try Again</button>
        </div>

        <!-- Quick Stats -->
        <div class="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card text-center">
            <div class="text-3xl font-bold text-neon-blue mb-2">{{ loadingStats ? '--' : stats.active_specs ?? '--' }}</div>
            <div class="text-gray-600 dark:text-gray-400">Active Specs</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-neon-green mb-2">{{ loadingStats ? '--' : stats.pending_reviews ?? '--' }}</div>
            <div class="text-gray-600 dark:text-gray-400">Pending Reviews</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-neon-purple mb-2">{{ loadingStats ? '--' : stats.vendor_partners ?? '--' }}</div>
            <div class="text-gray-600 dark:text-gray-400">Vendor Partners</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-yellow-400 mb-2">{{ loadingStats ? '--' : (stats.quality_score !== undefined ? stats.quality_score + '%' : '--') }}</div>
            <div class="text-gray-600 dark:text-gray-400">Quality Score</div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { useMetadataStore } from '@/stores/metadata'

const authStore = useAuthStore()
const router = useRouter()
const metadataStore = useMetadataStore()

const goToProjects = () => {
  router.push('/projects')
}

const stats = ref<{ active_specs?: number; pending_reviews?: number; vendor_partners?: number; quality_score?: number }>({})
const loadingStats = ref(true)
const statsError = ref('')
let statsInterval: number | undefined

const tapeouts = ref([])
const tapeoutsLoading = ref(false)
const tapeoutsError = ref('')

const selectedFilters = ref({
  platform: '',
  edaTool: '',
  type: '',
  status: ''
})

const fetchStats = async () => {
  loadingStats.value = true
  statsError.value = ''
  try {
    const headers: HeadersInit = {}
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    const res = await fetch('http://localhost:8000/api/v1/dashboard/stats', { headers })
    if (!res.ok) throw new Error('Unable to load dashboard stats.')
    stats.value = await res.json()
  } catch (e: any) {
    statsError.value = e.message || 'Unable to load dashboard stats.'
    // Show toast (simple alert for now)
    window.dispatchEvent(new CustomEvent('toast', { detail: { message: statsError.value, type: 'error' } }))
  } finally {
    loadingStats.value = false
  }
}

const fetchTapeouts = async () => {
  tapeoutsLoading.value = true
  tapeoutsError.value = ''
  try {
    const params = []
    if (selectedFilters.value.platform) params.push(`platform=${encodeURIComponent(selectedFilters.value.platform)}`)
    if (selectedFilters.value.edaTool) params.push(`eda_tool=${encodeURIComponent(selectedFilters.value.edaTool)}`)
    if (selectedFilters.value.type) params.push(`type=${encodeURIComponent(selectedFilters.value.type)}`)
    if (selectedFilters.value.status) params.push(`status=${encodeURIComponent(selectedFilters.value.status)}`)
    const query = params.length ? `?${params.join('&')}` : ''
    const res = await fetch(`/api/v1/specifications${query}`)
    if (!res.ok) throw new Error(await res.text() || 'Failed to fetch specifications')
    tapeouts.value = await res.json()
  } catch (e: any) {
    tapeoutsError.value = e.message || 'Failed to fetch specifications'
  } finally {
    tapeoutsLoading.value = false
  }
}

onMounted(async () => {
  // Check authentication on mount
  await authStore.checkAuth()

  if (!metadataStore.platforms.length) await metadataStore.fetchMetadata()
  await fetchStats()
  await fetchTapeouts()
  statsInterval = window.setInterval(fetchStats, 10000)
})

onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval)
})

const handleFilter = (key: keyof typeof selectedFilters.value, value: string) => {
  selectedFilters.value[key] = value
  fetchTapeouts()
}

const isFilterSelected = (key: keyof typeof selectedFilters.value, value: string) => selectedFilters.value[key] === value
</script>

<style scoped>
.chip {
  @apply px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer;
}
</style> 