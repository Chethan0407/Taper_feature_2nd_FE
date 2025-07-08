<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <svg class="w-12 h-12 text-neon-blue animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <p class="text-gray-400">Loading project details...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="text-xl font-semibold text-red-400 mb-2">Failed to Load Project</h3>
          <p class="text-gray-400 mb-4">{{ error }}</p>
          <button @click="loadProject" class="btn-primary">
            Try Again
          </button>
        </div>

        <!-- Project Details -->
        <div v-else-if="project" class="space-y-8">
          <!-- Project Header -->
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center space-x-4 mb-4">
                <button 
                  @click="router.back()"
                  class="btn-secondary p-2 rounded-lg"
                  title="Back to Projects"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h1 class="text-4xl font-bold text-gray-900 dark:text-white tracking-wide">{{ project.name }}</h1>
              </div>
              <p v-if="project.description" class="text-gray-500 dark:text-gray-400 text-lg">{{ project.description }}</p>
            </div>
            <div class="flex space-x-3">
              <button @click="editProject" class="btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit
              </button>
              <button @click="deleteProject" class="btn-secondary text-red-400 hover:text-red-300">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
          </div>

          <!-- Project Metadata Summary Cards -->
          <div v-if="project" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <!-- Platform Card -->
            <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-neon-blue dark:to-neon-purple rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Platform</h3>
              </div>
              <div class="flex flex-wrap gap-3 mt-2">
                <button
                  v-for="platform in metadataStore.platforms"
                  :key="platform"
                  @click="handleFilter('platform', platform)"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-semibold border shadow-sm transition-colors',
                    selectedFilters.platform === platform
                      ? 'bg-blue-600 text-white border-blue-600 dark:bg-neon-blue dark:text-white dark:border-neon-blue'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 dark:hover:bg-dark-700'
                  ]"
                >
                  {{ platform }}
                </button>
              </div>
            </div>

            <!-- EDA Tool Card -->
            <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 dark:from-neon-green dark:to-neon-blue rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">EDA Tool</h3>
              </div>
              <div class="flex flex-wrap gap-3 mt-2">
                <button
                  v-for="edaTool in metadataStore.edaTools"
                  :key="edaTool"
                  @click="handleFilter('edaTool', edaTool)"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-semibold border shadow-sm transition-colors',
                    selectedFilters.edaTool === edaTool
                      ? 'bg-green-600 text-white border-green-600 dark:bg-neon-green dark:text-white dark:border-neon-green'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 dark:hover:bg-dark-700'
                  ]"
                >
                  {{ edaTool }}
                </button>
              </div>
            </div>

            <!-- Type Card -->
            <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-neon-purple dark:to-neon-pink rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Type</h3>
              </div>
              <div class="flex flex-wrap gap-3 mt-2">
                <button
                  v-for="type in metadataStore.types"
                  :key="type"
                  @click="handleFilter('type', type)"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-semibold border shadow-sm transition-colors',
                    selectedFilters.type === type
                      ? 'bg-purple-600 text-white border-purple-600 dark:bg-neon-purple dark:text-white dark:border-neon-purple'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-purple-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 dark:hover:bg-dark-700'
                  ]"
                >
                  {{ type }}
                </button>
              </div>
            </div>

            <!-- Status Card -->
            <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-400 dark:to-yellow-600 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Status</h3>
              </div>
              <div class="flex flex-wrap gap-3 mt-2">
                <button
                  v-for="status in metadataStore.statuses"
                  :key="status"
                  @click="handleFilter('status', status)"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-semibold border shadow-sm transition-colors',
                    selectedFilters.status === status
                      ? 'bg-yellow-600 text-white border-yellow-600 dark:bg-yellow-400 dark:text-white dark:border-yellow-400'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-yellow-50 dark:bg-dark-800 dark:text-gray-300 dark:border-dark-700 dark:hover:bg-dark-700'
                  ]"
                >
                  {{ status }}
                </button>
              </div>
            </div>
          </div>

          <!-- Project Metric Summary Cards -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div class="card text-center">
              <div class="text-3xl font-bold text-neon-blue mb-2">{{ filteredSpecs.length }}</div>
              <div class="text-gray-400">Active Specs</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-neon-green mb-2">{{ pendingReviewsCount }}</div>
              <div class="text-gray-400">Pending Reviews</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-neon-purple mb-2">{{ vendorPartnersCount }}</div>
              <div class="text-gray-400">Vendor Partners</div>
            </div>
            <div class="card text-center">
              <div class="text-3xl font-bold text-yellow-400 mb-2">{{ qualityScore }}%</div>
              <div class="text-gray-400">Quality Score</div>
            </div>
          </div>

          <!-- Project Specs Section -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Project Specifications</h2>
              <button @click="router.push(`/specs?project=${project.id}`)" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Spec
              </button>
            </div>
            
            <!-- Specs will be loaded here -->
            <div class="text-center py-8">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="text-xl font-semibold text-gray-400 mb-2">No Specifications Yet</h3>
              <p class="text-gray-500 mb-6">Add specifications to this project to get started</p>
              <button @click="router.push(`/specs?project=${project.id}`)" class="btn-primary">
                Add First Spec
              </button>
            </div>
          </div>
        </div>
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
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore, type Project } from '@/stores/projects'
import ProjectEditModal from '@/components/Projects/ProjectEditModal.vue'
import { useMetadataStore } from '@/stores/metadata'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const metadataStore = useMetadataStore()

const project = ref<Project | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

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

const loadProject = async () => {
  const projectId = route.params.id as string
  if (!projectId) {
    error.value = 'Project ID is required'
    return
  }

  loading.value = true
  error.value = null
  try {
    const projectData = await projectsStore.getProject(projectId)
    project.value = projectData
    if (!metadataStore.platforms.length) await metadataStore.fetchMetadata()
  } catch (err: any) {
    error.value = err.message || 'Failed to load project'
  } finally {
    loading.value = false
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

onMounted(() => {
  loadProject()
})
</script> 