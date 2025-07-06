<template>
  <div class="min-h-screen bg-dark-950">
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
                <h1 class="text-4xl font-bold text-white tracking-wide">{{ project.name }}</h1>
              </div>
              <p v-if="project.description" class="text-gray-400 text-lg">{{ project.description }}</p>
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

          <!-- Project Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="card bg-dark-900/30 backdrop-blur-sm border border-dark-600/50 rounded-2xl p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-white">Platform</h3>
              </div>
              <p class="text-2xl font-bold text-neon-blue">{{ project.platform }}</p>
            </div>

            <div class="card bg-dark-900/30 backdrop-blur-sm border border-dark-600/50 rounded-2xl p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-white">EDA Tool</h3>
              </div>
              <p class="text-2xl font-bold text-neon-green">{{ project.edaTool }}</p>
            </div>

            <div class="card bg-dark-900/30 backdrop-blur-sm border border-dark-600/50 rounded-2xl p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-white">Type</h3>
              </div>
              <p class="text-2xl font-bold text-neon-purple">{{ project.type }}</p>
            </div>

            <div class="card bg-dark-900/30 backdrop-blur-sm border border-dark-600/50 rounded-2xl p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-neon-yellow to-neon-orange rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-white">Status</h3>
              </div>
              <span :class="getStatusClass(project.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ project.status }}
              </span>
            </div>
          </div>

          <!-- Project Specs Section -->
          <div class="card bg-dark-900/30 backdrop-blur-sm border border-dark-600/50 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-white">Project Specifications</h2>
              <button @click="router.push(`/specs?project=${project.id}`)" class="btn-primary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Spec
              </button>
            </div>
            
            <!-- Specs will be loaded here -->
            <div class="text-center py-8">
              <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore, type Project } from '@/stores/projects'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()

const project = ref<Project | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

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
  // TODO: Implement edit functionality
  console.log('Edit project:', project.value)
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

onMounted(() => {
  loadProject()
})
</script> 