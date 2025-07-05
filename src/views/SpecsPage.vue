<template>
  <div class="min-h-screen bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Specifications</h1>
          <p class="text-gray-400">Upload, manage and review your tapeout specifications</p>
        </div>

        <!-- Upload Section -->
        <div class="card mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">Upload New Spec</h2>
            <button class="btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Upload Spec
            </button>
          </div>
          
          <div class="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p class="text-gray-400 mb-2">Drag and drop your spec files here</p>
            <p class="text-sm text-gray-500">Supports PDF, DOCX, PPT, XLS (Max 50MB)</p>
          </div>
        </div>

        <!-- Specs List -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-white">Recent Specifications</h2>
            <div class="flex space-x-2">
              <select class="input-field">
                <option>All Status</option>
                <option>Draft</option>
                <option>Review</option>
                <option>Approved</option>
              </select>
            </div>
          </div>

          <div class="space-y-4">
            <div v-for="spec in specs" :key="spec.id" class="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-600">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-medium text-white">{{ spec.name }}</h3>
                  <p class="text-sm text-gray-400">v{{ spec.version }} • {{ spec.uploadDate }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-4">
                <span :class="getStatusClass(spec.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ spec.status }}
                </span>
                <div class="flex space-x-2">
                  <button class="p-2 text-gray-400 hover:text-gray-300 transition-colors" title="Preview">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-gray-300 transition-colors" title="Download">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </button>
                </div>
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

interface Spec {
  id: string
  name: string
  version: string
  status: 'draft' | 'review' | 'approved'
  uploadDate: string
}

const specs = ref<Spec[]>([])

// Add modal and state for create/update
const showSpecModal = ref(false)
const editingSpec = ref<Spec | null>(null)
const specForm = ref({ name: '', version: '', status: 'draft', uploadDate: '' })
const deleting = ref<string | null>(null)
const downloading = ref<string | null>(null)
const duplicating = ref<string | null>(null)
const assigningReviewer = ref<string | null>(null)
const approving = ref<string | null>(null)
const comparing = ref<string | null>(null)
const viewingVersions = ref<string | null>(null)
const runningLint = ref<string | null>(null)
const viewingLintResults = ref<string | null>(null)

onMounted(async () => {
  // Replace with your actual project_id logic
  const projectId = 'your_project_id'
  const res = await fetch(`/api/v1/specs/projects/${projectId}/specs`)
  if (res.ok) {
    specs.value = await res.json()
  }
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'review':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'draft':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}
</script> 