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
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
            <div v-if="activitiesLoading" class="text-center text-gray-400 py-4">Loading...</div>
            <div v-else-if="activitiesError" class="text-center text-red-400 py-4">Activity feed unavailable</div>
            <div v-else-if="activities.length === 0" class="text-center text-gray-400 py-4">No recent activity.</div>
            <div v-else class="space-y-4">
              <div v-for="activity in activities" :key="activity.timestamp + activity.action + activity.entity_id" class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-neon-blue rounded-full mt-2"></div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 dark:text-white">{{ activity.action }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ new Date(activity.timestamp).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Vendor Modal -->
    <div v-if="showVendorModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-dark-900 p-6 rounded-2xl relative w-[420px] max-w-full shadow-2xl border border-dark-700">
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl font-bold" @click="showVendorModal = false">&times;</button>
        <h2 class="text-2xl font-bold text-gradient mb-6">{{ editingVendor ? 'Edit Vendor' : 'Add Vendor' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="name" class="block text-base font-medium text-gray-200 mb-1">Name</label>
            <input id="name" v-model="vendorForm.name" class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-400" placeholder="Vendor name" required>
          </div>
          <div>
            <label for="type" class="block text-base font-medium text-gray-200 mb-1">Type</label>
            <input id="type" v-model="vendorForm.type" class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white placeholder-gray-400" placeholder="Type" required>
          </div>
          <div>
            <label for="status" class="block text-base font-medium text-gray-200 mb-1">Status</label>
            <select id="status" v-model="vendorForm.status" class="input-field w-full py-3 px-4 text-base rounded-lg bg-dark-800 border border-dark-700 text-white">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label class="block text-base font-medium text-gray-200 mb-1">Linked Specs</label>
            <select v-model="vendorForm.linkedSpecs" class="input-field w-full bg-dark-800 border border-dark-700 text-white" multiple>
              <option v-for="spec in allSpecs" :key="spec.id" :value="spec.id">
                {{ spec.name || spec.file_name || 'Unnamed Spec' }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-base font-medium text-gray-200 mb-1">Linked Checklists</label>
            <select v-model="vendorForm.linkedChecklists" class="input-field w-full bg-dark-800 border border-dark-700 text-white" multiple>
              <option v-for="checklist in allChecklists" :key="checklist.id" :value="checklist.id">
                {{ checklist.name }}
              </option>
            </select>
          </div>
          <button type="submit" class="btn-primary w-full py-3 text-lg font-semibold" :disabled="vendorsStore.loading">{{ editingVendor ? 'Update' : 'Add' }}<span v-if="vendorsStore.loading" class="ml-2 animate-spin">⏳</span></button>
          <div v-if="vendorsStore.error" class="text-red-500 text-center mt-2">{{ vendorsStore.error }}</div>
        </form>
      </div>
    </div>

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
const vendorForm = ref({ name: '', type: '', status: 'active', linkedSpecs: [], linkedChecklists: [] })
const deleting = ref<string | null>(null)
const uploadingNDA = ref<string | null>(null)
const acknowledging = ref<string | null>(null)
const vendorDetails = ref(null)

const vendorList = computed(() => vendorsStore.vendors as Vendor[])
const authStore = useAuthStore()

const allSpecs = ref([])
const allChecklists = ref([])

// Fetch recent activity from API
const fetchActivities = async () => {
  activitiesLoading.value = true
  activitiesError.value = ''
  try {
    const headers = authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    const res = await fetch('/api/v1/activity/', { headers })
    if (!res.ok) {
      if (res.status === 401) {
        await authStore.logout()
        window.location.href = '/login'
        throw new Error('Session expired. Please log in again.')
      }
      throw new Error('Failed to fetch activity')
    }
    activities.value = await res.json()
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

// Call fetchActivities after vendor CRUD
const handleSubmit = async () => {
  if (editingVendor.value) {
    await vendorsStore.updateVendor(editingVendor.value.id, vendorForm.value)
  } else {
    await vendorsStore.createVendor(vendorForm.value)
  }
  showVendorModal.value = false
  vendorForm.value = { name: '', type: '', status: 'active', linkedSpecs: [], linkedChecklists: [] }
  editingVendor.value = null
  await fetchActivities()
}

const handleEdit = (vendor: Vendor) => {
  editingVendor.value = vendor
  vendorForm.value = { name: vendor.name, type: vendor.type, status: vendor.status, linkedSpecs: vendor.linked_specs, linkedChecklists: vendor.linked_checklists }
  showVendorModal.value = true
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

const viewVendor = async () => {
  if (vendorDetails.value) {
    const res = await fetch(`/api/v1/vendors/${vendorDetails.value.id}`)
    if (res.ok) {
      vendorDetails.value = await res.json()
    }
  }
}
</script> 