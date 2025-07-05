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
                <button class="btn-primary">Add Vendor</button>
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
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Layout/Sidebar.vue'
import Header from '@/components/Layout/Header.vue'

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

const vendors: Vendor[] = [
  { id: '1', name: 'TSMC', type: 'Foundry', status: 'active' },
  { id: '2', name: 'GlobalFoundries', type: 'Foundry', status: 'active' },
  { id: '3', name: 'Samsung Foundry', type: 'Foundry', status: 'pending' },
  { id: '4', name: 'UMC', type: 'Foundry', status: 'inactive' }
]

const activities: Activity[] = [
  { id: '1', message: 'NDA signed with TSMC', time: '2 hours ago' },
  { id: '2', message: 'Spec acknowledgment from GlobalFoundries', time: '1 day ago' },
  { id: '3', message: 'Contract renewal with Samsung', time: '3 days ago' }
]

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
</script> 