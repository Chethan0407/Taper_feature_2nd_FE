<template>
  <div class="min-h-screen bg-gray-50 dark:bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Vendors</h1>
          <p class="text-gray-500 dark:text-gray-400">Vendor collaboration and tracking</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Vendor List -->
          <div class="lg:col-span-2">
            <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Vendor Partners</h2>
                <button class="btn-primary" @click="showVendorModal = true">Add Vendor</button>
              </div>
              <div v-if="error" class="text-red-500 text-center mb-4">{{ error }}</div>
              <div v-if="loading" class="text-gray-400 text-center mb-4">Loading...</div>
              <div v-if="!loading && vendorList.length === 0" class="text-gray-400 text-center mb-4">No vendors yet.</div>
              <div v-else class="space-y-4">
                <div v-for="vendor in vendorList" :key="vendor.id" class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                        <span class="text-white font-semibold">{{ vendor.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900 dark:text-white">{{ vendor.name }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ vendor.type }} • {{ vendor.status }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span :class="getStatusClass(vendor.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                        {{ vendor.status }}
                      </span>
                      <button class="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" @click="handleEdit(vendor)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                      </button>
                      <button class="p-2 text-red-400 hover:text-red-600 transition-colors" @click="confirmDelete(vendor)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Communication Timeline -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl flex flex-col" style="max-height: 600px;">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 px-6 pt-6 flex-shrink-0">Recent Activity</h2>
            <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
              <div v-if="activitiesLoading" class="text-center text-gray-400 py-4">Loading...</div>
              <div v-else-if="activitiesError" class="text-center text-red-400 py-4">Activity feed unavailable</div>
              <div v-else-if="activities.length === 0" class="text-center text-gray-400 py-4">No recent activity.</div>
              <div v-else class="space-y-4">
                <div v-for="activity in recentActivities" :key="activity.timestamp + activity.action + activity.entity_id" class="flex items-start space-x-3">
                  <div class="w-2 h-2 bg-neon-blue rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 dark:text-white break-words">{{ activity.action }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ formatActivityDate(activity.timestamp) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Vendor Modal - Improved Design -->
    <!-- WHY: Better UX with larger modal, better spacing, searchable multi-selects, and validation -->
    <Transition name="modal">
      <div v-if="showVendorModal" class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeModal">
        <div class="bg-dark-900 rounded-2xl relative w-full max-w-2xl shadow-2xl border border-dark-700 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-dark-900 border-b border-dark-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 class="text-2xl font-bold text-gradient">{{ editingVendor ? 'Edit Vendor' : 'Add Vendor' }}</h2>
            <button 
              class="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-dark-800 rounded-lg" 
              @click="closeModal"
              aria-label="Close modal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
            <!-- Name Field -->
            <div>
              <label for="name" class="block text-sm font-semibold text-gray-200 mb-2">
                Vendor Name <span class="text-red-400">*</span>
              </label>
              <input 
                id="name" 
                v-model="vendorForm.name" 
                type="text"
                class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all" 
                placeholder="Enter vendor name"
                required
                :class="{ 'border-red-500': formErrors.name }"
              >
              <p v-if="formErrors.name" class="text-red-400 text-sm mt-1">{{ formErrors.name }}</p>
            </div>

            <!-- Type Field - Dropdown with common types -->
            <div>
              <label for="type" class="block text-sm font-semibold text-gray-200 mb-2">
                Vendor Type <span class="text-red-400">*</span>
              </label>
              <select 
                id="type" 
                v-model="vendorForm.type" 
                class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
                required
                :class="{ 'border-red-500': formErrors.type }"
              >
                <option value="">Select vendor type</option>
                <option value="EDA Tool">EDA Tool</option>
                <option value="IP Provider">IP Provider</option>
                <option value="Foundry">Foundry</option>
                <option value="Packaging">Packaging</option>
                <option value="Testing">Testing</option>
                <option value="Design Services">Design Services</option>
                <option value="Other">Other</option>
              </select>
              <p v-if="formErrors.type" class="text-red-400 text-sm mt-1">{{ formErrors.type }}</p>
            </div>

            <!-- Status Field -->
            <div>
              <label for="status" class="block text-sm font-semibold text-gray-200 mb-2">
                Status <span class="text-red-400">*</span>
              </label>
              <select 
                id="status" 
                v-model="vendorForm.status" 
                class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
                required
                :class="{ 'border-red-500': formErrors.status }"
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <p v-if="formErrors.status" class="text-red-400 text-sm mt-1">{{ formErrors.status }}</p>
            </div>

            <!-- Linked Specs - Improved with search and chips -->
            <div>
              <label class="block text-sm font-semibold text-gray-200 mb-2">
                Linked Specifications
                <span class="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
              </label>
              <div class="relative">
                <input 
                  v-model="specSearch" 
                  type="text"
                  class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all" 
                  placeholder="Search specifications..."
                  @focus="showSpecDropdown = true"
                >
                <!-- Dropdown -->
                <div v-if="showSpecDropdown && filteredSpecs.length > 0" class="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div 
                    v-for="spec in filteredSpecs" 
                    :key="spec.id"
                    class="px-4 py-2 hover:bg-dark-700 cursor-pointer flex items-center justify-between"
                    @click="toggleSpec(spec.id)"
                  >
                    <span class="text-white text-sm">{{ spec.name || spec.file_name || 'Unnamed Spec' }}</span>
                    <svg v-if="vendorForm.linkedSpecs.includes(spec.id)" class="w-5 h-5 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
              <!-- Selected Specs Chips -->
              <div v-if="vendorForm.linkedSpecs.length > 0" class="flex flex-wrap gap-2 mt-3">
                <span 
                  v-for="specId in vendorForm.linkedSpecs" 
                  :key="specId"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                >
                  {{ getSpecName(specId) }}
                  <button 
                    type="button"
                    @click="removeSpec(specId)"
                    class="ml-2 text-neon-blue hover:text-neon-blue/70"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </span>
              </div>
            </div>

            <!-- Linked Checklists - Improved with search and chips -->
            <div>
              <label class="block text-sm font-semibold text-gray-200 mb-2">
                Linked Checklists
                <span class="text-xs font-normal text-gray-400 ml-2">(Optional)</span>
              </label>
              <div class="relative">
                <input 
                  v-model="checklistSearch" 
                  type="text"
                  class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all" 
                  placeholder="Search checklists..."
                  @focus="showChecklistDropdown = true"
                >
                <!-- Dropdown -->
                <div v-if="showChecklistDropdown && filteredChecklists.length > 0" class="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div 
                    v-for="checklist in filteredChecklists" 
                    :key="checklist.id"
                    class="px-4 py-2 hover:bg-dark-700 cursor-pointer flex items-center justify-between"
                    @click="toggleChecklist(checklist.id)"
                  >
                    <span class="text-white text-sm">{{ checklist.name || 'Unnamed Checklist' }}</span>
                    <svg v-if="vendorForm.linkedChecklists.includes(checklist.id)" class="w-5 h-5 text-neon-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
              <!-- Selected Checklists Chips -->
              <div v-if="vendorForm.linkedChecklists.length > 0" class="flex flex-wrap gap-2 mt-3">
                <span 
                  v-for="checklistId in vendorForm.linkedChecklists" 
                  :key="checklistId"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                >
                  {{ getChecklistName(checklistId) }}
                  <button 
                    type="button"
                    @click="removeChecklist(checklistId)"
                    class="ml-2 text-neon-blue hover:text-neon-blue/70"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </span>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="vendorsStore.error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p class="text-red-400 text-sm">{{ vendorsStore.error }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t border-dark-700">
              <button 
                type="button" 
                class="btn-secondary flex-1 py-3 font-semibold" 
                @click="closeModal"
                :disabled="vendorsStore.loading"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn-primary flex-1 py-3 font-semibold flex items-center justify-center" 
                :disabled="vendorsStore.loading || !isFormValid"
              >
                <span v-if="vendorsStore.loading" class="mr-2">
                  <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span>{{ editingVendor ? 'Update Vendor' : 'Add Vendor' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold" @click="showDeleteModal = false">&times;</button>
        <h2 class="text-2xl font-bold mb-6 text-center text-gradient">Delete Vendor</h2>
        <p class="mb-6 text-gray-300 text-center">Are you sure you want to delete <span class="font-semibold">{{ vendorToDelete?.name }}</span>?</p>
        <div class="flex justify-end gap-2">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-primary bg-red-500 hover:bg-red-600" @click="deleteVendor" :disabled="deletingVendor">Delete<span v-if="deletingVendor" class="ml-2 animate-spin">⏳</span></button>
        </div>
        <div v-if="deleteError" class="text-red-400 mt-2 text-center">{{ deleteError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref, computed } from 'vue'
import { useVendorsStore } from '@/stores/vendors'
import { useAuthStore } from '@/stores/auth'
import type { Vendor } from '@/stores/vendors'

// Replace VendorActivity interface and activities ref with new structure
interface Activity {
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entity_id: number;
}

const vendorsStore = useVendorsStore()
const loading = computed(() => vendorsStore.loading)
const error = computed(() => vendorsStore.error)
const activities = ref<Activity[]>([])
const activitiesLoading = ref(false)
const activitiesError = ref('')
const showVendorModal = ref(false)
const editingVendor = ref<Vendor | null>(null)
const vendorForm = ref({ name: '', type: '', status: '' as '' | 'active' | 'pending' | 'inactive', linkedSpecs: [] as (string | number)[], linkedChecklists: [] as (string | number)[] })
const deleting = ref<string | null>(null)
const uploadingNDA = ref<string | null>(null)
const acknowledging = ref<string | null>(null)
const vendorDetails = ref(null)

const vendorList = computed(() => vendorsStore.vendors as Vendor[])
const authStore = useAuthStore()

const allSpecs = ref<any[]>([])
const allChecklists = ref<any[]>([])

// Form validation and search states
const formErrors = ref<{ name?: string; type?: string; status?: string }>({})
const specSearch = ref('')
const checklistSearch = ref('')
const showSpecDropdown = ref(false)
const showChecklistDropdown = ref(false)

// Form validation
const isFormValid = computed(() => {
  return vendorForm.value.name.trim() !== '' && 
         vendorForm.value.type.trim() !== '' && 
         vendorForm.value.status.trim() !== ''
})

// Filtered specs and checklists for search
const filteredSpecs = computed(() => {
  if (!specSearch.value) return allSpecs.value
  const search = specSearch.value.toLowerCase()
  return allSpecs.value.filter(spec => 
    (spec.name || spec.file_name || '').toLowerCase().includes(search)
  )
})

const filteredChecklists = computed(() => {
  if (!checklistSearch.value) return allChecklists.value
  const search = checklistSearch.value.toLowerCase()
  return allChecklists.value.filter(checklist => 
    (checklist.name || '').toLowerCase().includes(search)
  )
})

// Helper functions for multi-select
const toggleSpec = (specId: string | number) => {
  const index = vendorForm.value.linkedSpecs.indexOf(specId)
  if (index > -1) {
    vendorForm.value.linkedSpecs.splice(index, 1)
  } else {
    vendorForm.value.linkedSpecs.push(specId)
  }
}

const removeSpec = (specId: string | number) => {
  const index = vendorForm.value.linkedSpecs.indexOf(specId)
  if (index > -1) {
    vendorForm.value.linkedSpecs.splice(index, 1)
  }
}

const getSpecName = (specId: string | number) => {
  const spec = allSpecs.value.find(s => s.id === specId)
  return spec?.name || spec?.file_name || 'Unnamed Spec'
}

const toggleChecklist = (checklistId: string | number) => {
  const index = vendorForm.value.linkedChecklists.indexOf(checklistId)
  if (index > -1) {
    vendorForm.value.linkedChecklists.splice(index, 1)
  } else {
    vendorForm.value.linkedChecklists.push(checklistId)
  }
}

const removeChecklist = (checklistId: string | number) => {
  const index = vendorForm.value.linkedChecklists.indexOf(checklistId)
  if (index > -1) {
    vendorForm.value.linkedChecklists.splice(index, 1)
  }
}

const getChecklistName = (checklistId: string | number) => {
  const checklist = allChecklists.value.find(c => c.id === checklistId)
  return checklist?.name || 'Unnamed Checklist'
}

// Close modal and reset form
const closeModal = () => {
  showVendorModal.value = false
  formErrors.value = {}
  specSearch.value = ''
  checklistSearch.value = ''
  showSpecDropdown.value = false
  showChecklistDropdown.value = false
}

// Limit for recent activities display
const MAX_RECENT_ACTIVITIES = 15

// Helper function to safely parse timestamp for sorting
const parseTimestampForSort = (timestamp: string): number => {
  if (!timestamp) return 0
  try {
    let cleanTimestamp = timestamp.trim()
    // Remove trailing Z if it exists after timezone offset
    if (cleanTimestamp.endsWith('Z') && (cleanTimestamp.includes('+') || cleanTimestamp.includes('-'))) {
      cleanTimestamp = cleanTimestamp.slice(0, -1)
    }
    const date = new Date(cleanTimestamp)
    if (isNaN(date.getTime())) {
      // Fallback: try without timezone
      const withoutTimezone = cleanTimestamp.split(/[+-]/)[0]
      const utcDate = new Date(withoutTimezone + 'Z')
      return isNaN(utcDate.getTime()) ? 0 : utcDate.getTime()
    }
    return date.getTime()
  } catch {
    return 0
  }
}

// Computed property to show only recent activities
const recentActivities = computed(() => {
  // Sort by timestamp (newest first) and limit to MAX_RECENT_ACTIVITIES
  return [...activities.value]
    .sort((a, b) => {
      const dateA = parseTimestampForSort(a.timestamp)
      const dateB = parseTimestampForSort(b.timestamp)
      return dateB - dateA // Descending order (newest first)
    })
    .slice(0, MAX_RECENT_ACTIVITIES)
})

// Fetch recent activity from API
const fetchActivities = async () => {
  activitiesLoading.value = true
  activitiesError.value = ''
  try {
    const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    // Fetch activities - limit is handled client-side by recentActivities computed property
    const res = await fetch('/api/v1/activity/', { headers })
    if (!res.ok) {
      if (res.status === 401) {
        await authStore.logout()
        window.location.href = '/login'
        throw new Error('Session expired. Please log in again.')
      }
      throw new Error('Failed to fetch activity')
    }
    const data = await res.json()
    // Store only the most recent activities to prevent memory issues
    const allActivities = Array.isArray(data) ? data : []
    // Sort by timestamp (newest first) and limit what we store
    const sortedActivities = [...allActivities]
      .sort((a, b) => {
        const dateA = parseTimestampForSort(a.timestamp)
        const dateB = parseTimestampForSort(b.timestamp)
        return dateB - dateA // Descending order (newest first)
      })
      .slice(0, MAX_RECENT_ACTIVITIES)
    activities.value = sortedActivities
  } catch (e: any) {
    activitiesError.value = e.message || 'Failed to fetch activity'
    activities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

onMounted(async () => {
  await vendorsStore.fetchVendors()
  await fetchActivities()
  // Fetch specs
  const specsRes = await fetch('/api/v1/specifications', { headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined })
  if (specsRes.ok) allSpecs.value = await specsRes.json()
  // Fetch checklists
  const checklistsRes = await fetch('/api/v1/checklists', { headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined })
  if (checklistsRes.ok) allChecklists.value = await checklistsRes.json()
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    case 'inactive':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

// Format activity date safely - handles various timestamp formats from API
const formatActivityDate = (timestamp: string) => {
  if (!timestamp) return 'Unknown date'
  
  try {
    let cleanTimestamp = timestamp.trim()
    
    // Handle malformed timestamps like "2026-01-06T16:25:27.499454+00:00Z" (has both offset and Z)
    // Remove trailing Z if it exists after timezone offset
    if (cleanTimestamp.endsWith('Z') && (cleanTimestamp.includes('+') || cleanTimestamp.includes('-'))) {
      // Check if there's a timezone offset before the Z
      const offsetMatch = cleanTimestamp.match(/[+-]\d{2}:\d{2}Z$/)
      if (offsetMatch) {
        cleanTimestamp = cleanTimestamp.slice(0, -1) // Remove the trailing Z
      }
    }
    
    // Try to parse the date
    let date = new Date(cleanTimestamp)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If parsing fails, try removing microseconds and timezone, then add Z for UTC
      const withoutMicroseconds = cleanTimestamp.replace(/\.\d+/, '') // Remove microseconds
      const withoutTimezone = withoutMicroseconds.split(/[+-]/)[0] // Remove timezone offset
      
      if (withoutTimezone) {
        date = new Date(withoutTimezone + 'Z')
        if (!isNaN(date.getTime())) {
          return date.toLocaleString()
        }
      }
      
      // Last resort: try parsing as-is without any modifications
      date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        console.warn('Unable to parse timestamp:', timestamp)
        return 'Invalid date'
      }
    }
    
    return date.toLocaleString()
  } catch (error) {
    console.error('Error formatting date:', timestamp, error)
    return 'Invalid date'
  }
}

// Validate form before submission
const validateForm = () => {
  formErrors.value = {}
  let isValid = true

  if (!vendorForm.value.name.trim()) {
    formErrors.value.name = 'Vendor name is required'
    isValid = false
  }

  if (!vendorForm.value.type.trim()) {
    formErrors.value.type = 'Vendor type is required'
    isValid = false
  }

  if (!vendorForm.value.status || vendorForm.value.status.trim() === '') {
    formErrors.value.status = 'Status is required'
    isValid = false
  }

  return isValid
}

// Call fetchActivities after vendor CRUD
const handleSubmit = async (e?: Event) => {
  // Prevent default form submission
  if (e) {
    e.preventDefault()
  }
  
  // Validate form
  if (!validateForm()) {
    // Scroll to first error field
    const firstErrorField = document.querySelector('.border-red-500')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ;(firstErrorField as HTMLElement).focus()
    }
    return
  }

  try {
    if (editingVendor.value) {
      await vendorsStore.updateVendor(editingVendor.value.id, vendorForm.value)
    } else {
      await vendorsStore.createVendor(vendorForm.value)
    }
    
    // Only close if successful
    if (!vendorsStore.error) {
      closeModal()
      vendorForm.value = { name: '', type: '', status: '', linkedSpecs: [], linkedChecklists: [] }
      editingVendor.value = null
      await fetchActivities()
    }
  } catch (error: any) {
    console.error('Error submitting vendor form:', error)
  }
}

const handleEdit = (vendor: Vendor) => {
  editingVendor.value = vendor
  vendorForm.value = { 
    name: vendor.name, 
    type: vendor.type, 
    status: vendor.status, 
    linkedSpecs: vendor.linked_specs || [], 
    linkedChecklists: vendor.linked_checklists || [] 
  }
  showVendorModal.value = true
  formErrors.value = {}
}

const showDeleteModal = ref(false)
const vendorToDelete = ref<Vendor | null>(null)
const deletingVendor = ref(false)
const deleteError = ref('')

function confirmDelete(vendor: Vendor) {
  vendorToDelete.value = vendor
  showDeleteModal.value = true
  deleteError.value = ''
}

async function deleteVendor() {
  if (!vendorToDelete.value) return
  const id = (vendorToDelete.value as Vendor).id
  deletingVendor.value = true
  deleteError.value = ''
  try {
    await vendorsStore.deleteVendor(id)
    showDeleteModal.value = false
    vendorToDelete.value = null
    await fetchActivities()
  } catch (e: any) {
    deleteError.value = e.message || 'Failed to delete vendor'
  } finally {
    deletingVendor.value = false
  }
}

const uploadNDA = async () => {
  if (uploadingNDA.value) {
    const res = await fetch(`/api/v1/vendors/${uploadingNDA.value}/nda`, {
      method: 'POST'
    })
    if (res.ok) {
      // Handle successful upload
      uploadingNDA.value = null
    }
  }
}

const acknowledge = async () => {
  if (acknowledging.value) {
    const res = await fetch(`/api/v1/vendors/${acknowledging.value}/acknowledge`, {
      method: 'POST'
    })
    if (res.ok) {
      // Handle successful acknowledgement
      acknowledging.value = null
    }
  }
}

// WHY: Function kept for potential future use, but currently unused
// const viewVendor = async () => {
//   if (vendorDetails.value) {
//     const res = await fetch(`/api/v1/vendors/${(vendorDetails.value as any).id}`)
//     if (res.ok) {
//       vendorDetails.value = await res.json()
//     }
//   }
// }
</script>

<style scoped>
/**
 * Modal transition animations
 * WHY: Smooth fade and scale animation for better UX
 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .bg-dark-900,
.modal-leave-active .bg-dark-900 {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-dark-900,
.modal-leave-to .bg-dark-900 {
  transform: scale(0.95);
  opacity: 0;
}

/* Custom scrollbar for activity feed */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style> 