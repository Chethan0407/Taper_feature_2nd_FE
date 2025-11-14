<template>
  <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Linked Specifications
      </h2>
      <button @click="$emit('open-link-modal')" class="btn-primary">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Link Specification
      </button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search linked specifications..."
        class="input-field w-full"
      />
    </div>

    <!-- Batch Actions -->
    <div v-if="selectedSpecs.length > 0" class="mb-4 flex items-center gap-3">
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {{ selectedSpecs.length }} selected
      </span>
      <button @click="batchUnlink" class="btn-danger px-3 py-1 text-sm">
        Unlink Selected
      </button>
      <button @click="batchDownload" class="btn-secondary px-3 py-1 text-sm">
        Download Selected
      </button>
      <button @click="clearSelection" class="text-sm text-gray-500 hover:text-gray-700">
        Clear Selection
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 mb-4">{{ error }}</div>
      <button @click="$emit('reload')" class="btn-primary">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredSpecs.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <h3 class="text-xl font-semibold text-gray-400 mb-2">No Linked Specifications</h3>
      <p class="text-gray-500 mb-6">Link specifications to this project to get started</p>
      <button @click="$emit('open-link-modal')" class="btn-primary">
        Link First Specification
      </button>
    </div>

    <!-- Specifications List -->
    <div v-else class="space-y-3">
      <div
        v-for="spec in filteredSpecs"
        :key="spec.id"
        class="flex items-center gap-4 p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
      >
        <!-- Checkbox -->
        <input
          type="checkbox"
          :checked="selectedSpecs.includes(spec.id)"
          @change="toggleSelection(spec.id)"
          class="w-4 h-4 text-neon-blue border-gray-300 rounded focus:ring-neon-blue"
        />

        <!-- Spec Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ spec.name || spec.file_name || `Spec ${spec.id}` }}
            </h3>
            <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getStatusClass(spec.status)">
              {{ spec.status }}
            </span>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>v{{ spec.version }}</span>
            <span>by {{ spec.uploaded_by }}</span>
            <span>{{ formatDate(spec.uploaded_on) }}</span>
            <span v-if="spec.file_size">{{ formatFileSize(spec.file_size) }}</span>
          </div>
          
          <p v-if="spec.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
            {{ spec.description }}
          </p>
        </div>

        <!-- Like Count -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">
            {{ spec.like_count || 0 }} likes
          </span>
          <button
            @click="toggleLike(spec)"
            class="flex items-center gap-1 px-2 py-1 text-sm rounded transition-colors"
            :class="spec.liked_by_me ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-500 hover:text-yellow-500'"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {{ spec.liked_by_me ? 'Unlike' : 'Like' }}
          </button>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            @click="downloadSpec(spec.id)"
            class="btn-secondary px-3 py-1 text-sm"
            title="Download"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </button>
          <button
            @click="unlinkSpec(spec.id)"
            class="btn-danger px-3 py-1 text-sm"
            title="Unlink"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { unlinkSpecFromProject, downloadSpecification, likeSpecification, unlikeSpecification, type LinkedSpecification } from '@/utils/spec-linking-api'

interface Props {
  specifications: LinkedSpecification[]
  loading?: boolean
  error?: string | null
}

interface Emits {
  (e: 'open-link-modal'): void
  (e: 'reload'): void
  (e: 'spec-unlinked', specId: string | number): void
  (e: 'spec-liked', specId: string | number, liked: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const searchTerm = ref('')
const selectedSpecs = ref<(string | number)[]>([])

// Computed
const filteredSpecs = computed(() => {
  if (!searchTerm.value) return props.specifications
  
  const search = searchTerm.value.toLowerCase()
  return props.specifications.filter(spec => 
    spec.name?.toLowerCase().includes(search) ||
    spec.file_name?.toLowerCase().includes(search) ||
    spec.description?.toLowerCase().includes(search) ||
    String(spec.id).includes(search)
  )
})

// Methods
const toggleSelection = (specId: string | number) => {
  const index = selectedSpecs.value.indexOf(specId)
  if (index === -1) {
    selectedSpecs.value.push(specId)
  } else {
    selectedSpecs.value.splice(index, 1)
  }
}

const clearSelection = () => {
  selectedSpecs.value = []
}

const batchUnlink = async () => {
  if (selectedSpecs.value.length === 0) return
  
  try {
    for (const specId of selectedSpecs.value) {
      await unlinkSpecFromProject(props.projectId, specId)
      emit('spec-unlinked', specId)
    }
    clearSelection()
  } catch (err: any) {
    console.error('Failed to unlink specifications:', err)
  }
}

const batchDownload = async () => {
  if (selectedSpecs.value.length === 0) return
  
  try {
    for (const specId of selectedSpecs.value) {
      await downloadSpecification(specId)
    }
  } catch (err: any) {
    console.error('Failed to download specifications:', err)
  }
}

const unlinkSpec = async (specId: string | number) => {
  try {
    await unlinkSpecFromProject(props.projectId, specId)
    emit('spec-unlinked', specId)
  } catch (err: any) {
    console.error('Failed to unlink specification:', err)
  }
}

const downloadSpec = async (specId: string | number) => {
  try {
    await downloadSpecification(specId)
  } catch (err: any) {
    console.error('Failed to download specification:', err)
  }
}

const toggleLike = async (spec: LinkedSpecification) => {
  try {
    if (spec.liked_by_me) {
      await unlikeSpecification(spec.id)
      emit('spec-liked', spec.id, false)
    } else {
      await likeSpecification(spec.id)
      emit('spec-liked', spec.id, true)
    }
  } catch (err: any) {
    console.error('Failed to toggle like:', err)
  }
}

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'pending review':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'draft':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'archived':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
