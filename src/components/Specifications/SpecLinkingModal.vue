<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Link Specifications to Project
        </h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="p-6 border-b border-gray-200 dark:border-dark-700">
        <div class="flex gap-4 mb-4">
          <!-- Search -->
          <div class="flex-1">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search specifications..."
              class="input-field w-full"
            />
          </div>
          
          <!-- Status Filter -->
          <select v-model="statusFilter" class="input-field">
            <option value="">All Status</option>
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
          
          <!-- Uploader Filter -->
          <select v-model="uploaderFilter" class="input-field">
            <option value="">All Uploaders</option>
            <option v-for="uploader in uploaderOptions" :key="uploader" :value="uploader">
              {{ uploader }}
            </option>
          </select>
        </div>

        <!-- Selected Count -->
        <div v-if="selectedSpecs.length > 0" class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ selectedSpecs.length }} specification(s) selected
          </span>
          <button @click="clearSelection" class="text-sm text-red-600 hover:text-red-700">
            Clear Selection
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden">
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
        </div>
        
        <div v-else-if="error" class="p-6 text-center">
          <div class="text-red-600 mb-4">{{ error }}</div>
          <button @click="loadSpecifications" class="btn-primary">
            Retry
          </button>
        </div>
        
        <div v-else class="h-96 overflow-y-auto">
          <div v-if="filteredSpecs.length === 0" class="p-6 text-center text-gray-500">
            No specifications found matching your criteria.
          </div>
          
          <div v-else class="space-y-2 p-4">
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
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {{ spec.name || spec.file_name || `Spec ${spec.id}` }}
                </h3>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center">
                    <span class="w-2 h-2 rounded-full mr-2" :class="getStatusColor(spec.status)"></span>
                    {{ spec.status }}
                  </span>
                  <span>v{{ spec.version }}</span>
                  <span>by {{ spec.uploaded_by }}</span>
                  <span>{{ formatDate(spec.uploaded_on) }}</span>
                </div>
                <p v-if="spec.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                  {{ spec.description }}
                </p>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 dark:border-dark-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredSpecs.length }} specification(s) available
        </div>
        <div class="flex gap-3">
          <button @click="closeModal" class="btn-secondary">
            Cancel
          </button>
          <button
            @click="linkSelectedSpecs"
            :disabled="selectedSpecs.length === 0 || linking"
            class="btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': selectedSpecs.length === 0 || linking }"
          >
            <span v-if="linking" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Linking...
            </span>
            <span v-else>
              Link {{ selectedSpecs.length }} Specification(s)
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getAvailableSpecifications, linkSpecToProject, downloadSpecification, type LinkedSpecification } from '@/utils/spec-linking-api'

interface Props {
  isOpen: boolean
  projectId: string | number
  linkedSpecIds: (string | number)[]
}

interface Emits {
  (e: 'close'): void
  (e: 'linked', specs: LinkedSpecification[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const specifications = ref<LinkedSpecification[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const linking = ref(false)

// Filters
const searchTerm = ref('')
const statusFilter = ref('')
const uploaderFilter = ref('')

// Selection
const selectedSpecs = ref<(string | number)[]>([])

// Computed
const statusOptions = computed(() => {
  const statuses = [...new Set(specifications.value.map(spec => spec.status))]
  return statuses.sort()
})

const uploaderOptions = computed(() => {
  const uploaders = [...new Set(specifications.value.map(spec => spec.uploaded_by))]
  return uploaders.sort()
})

const filteredSpecs = computed(() => {
  let filtered = specifications.value

  // Filter out already linked specs
  filtered = filtered.filter(spec => !props.linkedSpecIds.includes(spec.id))

  // Apply search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(spec => 
      spec.name?.toLowerCase().includes(search) ||
      spec.file_name?.toLowerCase().includes(search) ||
      spec.description?.toLowerCase().includes(search) ||
      String(spec.id).includes(search)
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(spec => spec.status === statusFilter.value)
  }

  // Apply uploader filter
  if (uploaderFilter.value) {
    filtered = filtered.filter(spec => spec.uploaded_by === uploaderFilter.value)
  }

  return filtered
})

// Methods
const loadSpecifications = async () => {
  loading.value = true
  error.value = null
  
  try {
    specifications.value = await getAvailableSpecifications()
  } catch (err: any) {
    error.value = err.message || 'Failed to load specifications'
  } finally {
    loading.value = false
  }
}

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

const linkSelectedSpecs = async () => {
  if (selectedSpecs.value.length === 0) return
  
  linking.value = true
  
  try {
    // Link each selected spec
    for (const specId of selectedSpecs.value) {
      await linkSpecToProject(props.projectId, specId)
    }
    
    // Get the linked specs data
    const linkedSpecs = specifications.value.filter(spec => 
      selectedSpecs.value.includes(spec.id)
    )
    
    emit('linked', linkedSpecs)
    closeModal()
  } catch (err: any) {
    error.value = err.message || 'Failed to link specifications'
  } finally {
    linking.value = false
  }
}

const downloadSpec = async (specId: string | number) => {
  try {
    await downloadSpecification(specId)
  } catch (err: any) {
    error.value = err.message || 'Failed to download specification'
  }
}

const closeModal = () => {
  emit('close')
  // Reset state
  selectedSpecs.value = []
  searchTerm.value = ''
  statusFilter.value = ''
  uploaderFilter.value = ''
  error.value = null
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-500'
    case 'pending review':
      return 'bg-yellow-500'
    case 'rejected':
      return 'bg-red-500'
    case 'draft':
      return 'bg-blue-500'
    case 'archived':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
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

// Watch for modal open to load specs
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadSpecifications()
  }
})

// Load specs on mount if modal is already open
onMounted(() => {
  if (props.isOpen) {
    loadSpecifications()
  }
})
</script>
