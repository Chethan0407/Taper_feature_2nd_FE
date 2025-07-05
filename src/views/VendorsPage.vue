<template>
  <div class="min-h-screen bg-dark-950">
    <Sidebar />
    
    <div class="ml-64">
      <Header />
      
      <main class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Vendors</h1>
          <p class="text-gray-400">Vendor collaboration and tracking</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Vendor List -->
          <div class="lg:col-span-2">
            <div class="card">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-white">Vendor Partners</h2>
                <button class="btn-primary" @click="showVendorModal = true">Add Vendor</button>
              </div>
              
              <div class="space-y-4">
                <div v-for="vendor in vendors" :key="vendor.id" class="p-4 bg-dark-800 rounded-lg border border-dark-600">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                        <span class="text-white font-semibold">{{ vendor.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <h3 class="font-medium text-white">{{ vendor.name }}</h3>
                        <p class="text-sm text-gray-400">{{ vendor.type }} • {{ vendor.status }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span :class="getStatusClass(vendor.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                        {{ vendor.status }}
                      </span>
                      <button class="p-2 text-gray-400 hover:text-gray-300 transition-colors">
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
          <div class="card">
            <h2 class="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <div class="space-y-4">
              <div v-for="activity in activities" :key="activity.id" class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-neon-blue rounded-full mt-2"></div>
                <div class="flex-1">
                  <p class="text-sm text-white">{{ activity.message }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Vendor Modal -->
    <div v-if="showVendorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-dark-800 p-8 rounded-lg">
        <h2 class="text-xl font-semibold text-white mb-6">
          {{ editingVendor ? 'Edit Vendor' : 'Add Vendor' }}
        </h2>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="name" class="text-white">Name</label>
            <input id="name" v-model="vendorForm.name" class="input" required>
          </div>
          <div class="mb-4">
            <label for="type" class="text-white">Type</label>
            <input id="type" v-model="vendorForm.type" class="input" required>
          </div>
          <div class="mb-4">
            <label for="status" class="text-white">Status</label>
            <select id="status" v-model="vendorForm.status" class="input" required>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" class="btn-primary">
            {{ editingVendor ? 'Update' : 'Add' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'
import { onMounted, ref } from 'vue'

interface Vendor {
  id: string
  name: string
  type: string
  status: 'active' | 'pending' | 'inactive'
}

interface Activity {
  id: string
  message: string
  time: string
}

const vendors = ref<Vendor[]>([])
const activities = ref<Activity[]>([])
const showVendorModal = ref(false)
const editingVendor = ref<Vendor | null>(null)
const vendorForm = ref({ name: '', type: '', status: 'active' })
const deleting = ref<string | null>(null)
const uploadingNDA = ref<string | null>(null)
const acknowledging = ref<string | null>(null)
const vendorDetails = ref<Vendor | null>(null)

onMounted(async () => {
  const res = await fetch('/api/v1/vendors/')
  if (res.ok) {
    vendors.value = await res.json()
  }
  // Fetch activities for the first vendor as an example
  if (vendors.value.length > 0) {
    const actRes = await fetch(`/api/v1/vendors/${vendors.value[0].id}/timeline`)
    if (actRes.ok) {
      activities.value = await actRes.json()
    }
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
    await updateVendor()
  } else {
    await addVendor()
  }
}

const addVendor = async () => {
  const res = await fetch('/api/v1/vendors/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(vendorForm.value)
  })
  if (res.ok) {
    vendors.value.push(await res.json())
    showVendorModal.value = false
  }
}

const updateVendor = async () => {
  if (editingVendor.value) {
    const res = await fetch(`/api/v1/vendors/${editingVendor.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vendorForm.value)
    })
    if (res.ok) {
      const updatedVendor = await res.json()
      const index = vendors.value.findIndex(v => v.id === updatedVendor.id)
      if (index !== -1) {
        vendors.value[index] = updatedVendor
      }
      showVendorModal.value = false
    }
  }
}

const deleteVendor = async () => {
  if (deleting.value) {
    const res = await fetch(`/api/v1/vendors/${deleting.value}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      vendors.value = vendors.value.filter(v => v.id !== deleting.value)
      deleting.value = null
    }
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