<template>
  <div v-if="showDebugger" class="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold">🔍 Auth Debug</h3>
      <button @click="showDebugger = false" class="text-gray-400 hover:text-white">×</button>
    </div>
    
    <div class="space-y-1">
      <div>Token: {{ tokenStatus }}</div>
      <div>User: {{ userStatus }}</div>
      <div>Authenticated: {{ authStore.isAuthenticated ? '✅' : '❌' }}</div>
      <div>Last Check: {{ lastCheckTime }}</div>
      <div>Logout Count: {{ logoutCount }}</div>
    </div>
    
    <div class="mt-2 pt-2 border-t border-gray-600">
      <button @click="testAuth" class="bg-blue-600 px-2 py-1 rounded text-xs mr-2">
        Test Auth
      </button>
      <button @click="clearLogs" class="bg-red-600 px-2 py-1 rounded text-xs">
        Clear Logs
      </button>
    </div>
  </div>
  
  <!-- Debug toggle button -->
  <button 
    v-if="!showDebugger" 
    @click="showDebugger = true"
    class="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50"
    title="Show Auth Debug"
  >
    🔍
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showDebugger = ref(false)
const lastCheckTime = ref('Never')
const logoutCount = ref(0)

const tokenStatus = computed(() => {
  if (!authStore.token) return '❌ None'
  if (authStore.token === 'undefined' || authStore.token === 'null') return '❌ Invalid'
  return `✅ ${authStore.token.substring(0, 20)}...`
})

const userStatus = computed(() => {
  if (!authStore.user) return '❌ None'
  return `✅ ${authStore.user.email || 'Unknown'}`
})

const testAuth = async () => {
  console.log('🧪 Testing authentication...')
  const result = await authStore.checkAuth()
  lastCheckTime.value = new Date().toLocaleTimeString()
  console.log('🧪 Auth test result:', result)
}

const clearLogs = () => {
  console.clear()
  console.log('🧹 Logs cleared')
}

// Monitor logout events
onMounted(() => {
  const originalLogout = authStore.logout
  authStore.logout = async () => {
    logoutCount.value++
    console.log(`🚪 Logout #${logoutCount.value} detected`)
    await originalLogout()
  }
})

// Auto-refresh every 30 seconds
let refreshInterval: number | null = null

onMounted(() => {
  refreshInterval = window.setInterval(() => {
    if (showDebugger.value) {
      lastCheckTime.value = new Date().toLocaleTimeString()
    }
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
