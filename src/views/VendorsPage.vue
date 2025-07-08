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
              
              <div class="space-y-4">
                <div v-for="vendor in vendorsStore.vendors" :key="vendor.id" class="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Communication Timeline -->
          <div class="card bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-700 shadow-lg rounded-2xl">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
            <div class="space-y-4">
              <div v-for="activity in activities" :key="activity.id" class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-neon-blue rounded-full mt-2"></div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 dark:text-white">{{ activity.message }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Vendor Modal -->
    <div v-if="showVendorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-800 p-10 rounded-2xl relative w-full max-w-lg shadow-2xl border border-gray-200 dark:border-dark-600">
        <button class="absolute top-6 right-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl font-bold" @click="showVendorModal = false">&times;</button>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-10">
          {{ editingVendor ? 'Edit Vendor' : 'Add Vendor' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-7">
          <div>
            <label for="name" class="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Name</label>
            <input id="name" v-model="vendorForm.name" class="input-field w-full py-3 px-4 text-base rounded-lg bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100" required>
          </div>
          <div>
            <label for="type" class="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Type</label>
            <input id="type" v-model="vendorForm.type" class="input-field w-full py-3 px-4 text-base rounded-lg bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100" required>
          </div>
          <div>
            <label for="status" class="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Status</label>
            <select id="status" v-model="vendorForm.status" class="input-field w-full py-3 px-4 text-base rounded-lg bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-gray-100">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="pt-2">
            <button type="submit" class="btn-primary w-full py-3 text-lg font-semibold">{{ editingVendor ? 'Update' : 'Add' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref, computed } from 'vue'
import { useVendorsStore } from '@/stores/vendors'
import type { Vendor } from '@/stores/vendors'

// Add or fix VendorActivity type for activities
interface VendorActivity {
  id: string;
  message: string;
  time: string;
}

const vendorsStore = useVendorsStore()
const loading = computed(() => vendorsStore.loading)
const error = computed(() => vendorsStore.error)
const activities = ref<VendorActivity[]>([])
const showVendorModal = ref(false)
const editingVendor = ref<Vendor | null>(null)
const vendorForm = ref({ name: '', type: '', status: 'active' })
const deleting = ref<string | null>(null)
const uploadingNDA = ref<string | null>(null)
const acknowledging = ref<string | null>(null)
const vendorDetails = ref(null)

onMounted(async () => {
  await vendorsStore.fetchVendors()
  if (vendorsStore.vendors.length > 0) {
    activities.value = await vendorsStore.fetchTimeline(vendorsStore.vendors[0].id)
  }
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

const handleSubmit = async () => {
  if (editingVendor.value) {
    await vendorsStore.updateVendor(editingVendor.value.id, vendorForm.value)
  } else {
    await vendorsStore.createVendor(vendorForm.value)
  }
  showVendorModal.value = false
  vendorForm.value = { name: '', type: '', status: 'active' }
  editingVendor.value = null
}

const handleEdit = (vendor: Vendor) => {
  editingVendor.value = vendor
  vendorForm.value = { name: vendor.name, type: vendor.type, status: vendor.status }
  showVendorModal.value = true
}

const handleDelete = async (id: string) => {
  await vendorsStore.deleteVendor(id)
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