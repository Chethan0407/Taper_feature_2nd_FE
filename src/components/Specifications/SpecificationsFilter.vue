<template>
  <div class="bg-dark-800 border border-dark-700 rounded-xl p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white cursor-pointer select-none" @click="showFilters = !showFilters">
        Filters
        <span v-if="showFilters">▲</span>
        <span v-else>▼</span>
      </h3>
      <button v-if="showFilters" @click="resetFilters" class="text-sm text-gray-400 hover:text-white transition-colors">
        Reset All
      </button>
    </div>
    <transition name="fade">
      <div v-if="showFilters">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              v-model="localFilters.status"
              @change="handleFilterChange"
              class="w-full input-field"
            >
              <option value="">All Status</option>
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <!-- Assigned To Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Assigned To</label>
            <select
              v-model="localFilters.assigned_to"
              @change="handleFilterChange"
              class="w-full input-field"
            >
              <option value="">All Assignees</option>
              <option v-for="assignee in assignedToOptions" :key="assignee" :value="assignee">
                {{ assignee }}
              </option>
            </select>
          </div>

          <!-- Uploaded By Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Uploaded By</label>
            <select
              v-model="localFilters.uploaded_by"
              @change="handleFilterChange"
              class="w-full input-field"
            >
              <option value="">All Uploaders</option>
              <option v-for="uploader in uploadedByOptions" :key="uploader" :value="uploader">
                {{ uploader }}
              </option>
            </select>
          </div>

          <!-- File Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">File Type</label>
            <select
              v-model="localFilters.file_type"
              @change="handleFilterChange"
              class="w-full input-field"
            >
              <option value="">All File Types</option>
              <option v-for="fileType in fileTypeOptions" :key="fileType" :value="fileType">
                {{ getFileTypeLabel(fileType || '') }}
              </option>
            </select>
          </div>

          <!-- Date Range Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Date From</label>
            <input
              type="date"
              v-model="localFilters.date_from"
              @change="handleFilterChange"
              class="w-full input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Date To</label>
            <input
              type="date"
              v-model="localFilters.date_to"
              @change="handleFilterChange"
              class="w-full input-field"
            />
          </div>
        </div>

        <!-- Sort Options -->
        <div class="mt-4 pt-4 border-t border-dark-700">
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                v-model="localFilters.sort_by"
                @change="handleFilterChange"
                class="w-full input-field"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
              <select
                v-model="localFilters.sort_order"
                @change="handleFilterChange"
                class="w-full input-field"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Active Filters Summary -->
        <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-dark-700">
          <div class="flex flex-wrap gap-2">
            <span class="text-sm text-gray-400">Active filters:</span>
            <span
              v-for="(value, key) in activeFilters"
              :key="key"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white"
            >
              {{ getFilterLabel(key, value) }}
              <button
                @click="removeFilter(key)"
                class="ml-1 hover:text-red-200"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSpecificationsStore, type SpecificationFilters } from '@/stores/specifications'

const showFilters = ref(false)

const props = defineProps<{
  modelValue?: SpecificationFilters
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SpecificationFilters]
  'filter-change': [filters: SpecificationFilters]
}>()

const specificationsStore = useSpecificationsStore()

// Local filter state
const localFilters = ref<SpecificationFilters>({
  status: '',
  assigned_to: '',
  uploaded_by: '',
  file_type: '',
  date_from: '',
  date_to: '',
  sort_by: 'uploaded_on',
  sort_order: 'desc'
})

// Computed properties from store
const statusOptions = computed(() => specificationsStore.statusOptions)
const assignedToOptions = computed(() => specificationsStore.assignedToOptions)
const uploadedByOptions = computed(() => specificationsStore.uploadedByOptions)
const fileTypeOptions = computed(() => specificationsStore.fileTypeOptions)
const sortOptions = computed(() => specificationsStore.sortOptions)

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localFilters.value = { ...newValue }
  }
}, { immediate: true })

// Handle filter changes
const handleFilterChange = () => {
  emit('update:modelValue', { ...localFilters.value })
  emit('filter-change', { ...localFilters.value })
}

// Reset filters
const resetFilters = () => {
  localFilters.value = {
    status: '',
    assigned_to: '',
    uploaded_by: '',
    file_type: '',
    date_from: '',
    date_to: '',
    sort_by: 'uploaded_on',
    sort_order: 'desc'
  }
  handleFilterChange()
}

// Remove specific filter
const removeFilter = (key: string) => {
  if (key in localFilters.value) {
    (localFilters.value as any)[key] = ''
    handleFilterChange()
  }
}

// Check if there are active filters
const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(value => 
    value && value !== '' && value !== 'uploaded_on' && value !== 'desc'
  )
})

// Get active filters for display
const activeFilters = computed(() => {
  const active: Record<string, string> = {}
  Object.entries(localFilters.value).forEach(([key, value]) => {
    if (value && value !== '' && key !== 'sort_by' && key !== 'sort_order') {
      active[key] = value
    }
  })
  return active
})

// Helper function to get file type label
const getFileTypeLabel = (mimeType: string) => {
  if (!mimeType) return 'Unknown'
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'Excel'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'Word'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'PowerPoint'
  if (mimeType === 'application/vnd.ms-excel') return 'Excel'
  if (mimeType === 'application/msword') return 'Word'
  if (mimeType === 'application/vnd.ms-powerpoint') return 'PowerPoint'
  return mimeType.split('/').pop()?.toUpperCase() || 'Unknown'
}

// Helper function to get filter label for display
const getFilterLabel = (key: string, value: string) => {
  const labels: Record<string, string> = {
    status: 'Status',
    assigned_to: 'Assigned To',
    uploaded_by: 'Uploaded By',
    file_type: 'File Type',
    date_from: 'From Date',
    date_to: 'To Date'
  }
  return `${labels[key] || key}: ${value}`
}
</script> 